import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from "type-graphql";
import {getConnection} from "typeorm";
import {Post} from "../entities/Post";
import {Updoot} from "../entities/Updoot";
import {User} from "../entities/User";
import {isAuth} from "../middleware/isAuth";
import {ResolverContext} from "../types";

@InputType()
class PostInput {
  @Field()
  title!: string;
  @Field()
  text!: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts!: Post[];
  @Field()
  hasMore!: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 100);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() {userLoader}: ResolverContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, {nullable: true})
  async votedStatus(
    @Root() post: Post,
    @Ctx() {req, updootLoader}: ResolverContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() {req}: ResolverContext
  ): Promise<boolean> {
    const userId = req.session.userId;
    const realValue = Math.sign(value);

    const updoot = await Updoot.findOne({where: {postId, userId}});

    if (updoot && updoot.value !== realValue) {
      // Cambio voto
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
            update updoot
            set value = $3
            where "postId" = $2
              and "userId" = $1
          `,
          [userId, postId, realValue]
        );
        await tm.query(
          `
            update post
            set points = points + $2
            where id = $1
          `,
          [postId, realValue * 2]
        );
      });
    } else if (!updoot) {
      // Non ha ancora votato
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
            insert into updoot ("userId", "postId", value)
            values ($1, $2, $3)
          `,
          [userId, postId, realValue]
        );
        await tm.query(
          `
            update post
            set points = points + $2
            where id = $1;
          `,
          [postId, realValue]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, {nullable: true}) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    // await new Promise((res) => setTimeout(res, 3000));

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
      select post.*
      from post
      ${cursor ? `where post."createdAt" < $2` : ``}
      order by post."createdAt" desc
      limit $1
    `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, {nullable: true})
  post(@Arg("id", () => Int!) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("values") values: PostInput,
    @Ctx() {req}: ResolverContext
  ): Promise<Post> {
    return Post.create({...values, creatorId: req.session.userId}).save();
  }

  @Mutation(() => Post, {nullable: true})
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int!) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() {req}: ResolverContext
  ): Promise<Post | undefined> {
    const updateResult = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({title, text})
      .where(`id = :id and "creatorId" = :creatorId`, {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return updateResult.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int!) id: number,
    @Ctx() {req}: ResolverContext
  ): Promise<boolean> {
    await Post.delete({id, creatorId: req.session.userId});
    return true;
  }
}
