import argon2 from "argon2";
import {Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver} from "type-graphql";
import {v4} from "uuid";
import {COOKIE_NAME, FORGET_PASSWORD_PREFIX} from "../constants";
import {User} from "../entities/User";
import {Context} from "../types";
import {sendEmail} from "../utils/sendEmail";
import {validateRegister} from "../utils/validate";
import {UsernamePasswordInput} from "./UsernamePasswordInput";

const ONE_DAY_IN_MILLS = 1000 * 60 * 60 * 24;

@ObjectType()
class FieldError {
  @Field()
  field!: string;
  @Field()
  message!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() {req, redis}: Context
  ): Promise<UserResponse> {
    if (newPassword.length < 6) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "La password deve essere lunga almeno 6 caratteri",
          },
        ],
      };
    }

    const redisUserId = await redis.get(FORGET_PASSWORD_PREFIX + token);
    if (!redisUserId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token non valido",
          },
        ],
      };
    }

    const userId = parseInt(redisUserId);
    const user = await User.findOne(userId);
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "L'utente non esiste più",
          },
        ],
      };
    }

    await User.update(userId, {password: await argon2.hash(newPassword)});
    await redis.del(FORGET_PASSWORD_PREFIX + token);

    req.session.userId = user.id;

    return {user};
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() {redis}: Context
  ): Promise<boolean> {
    const user = await User.findOne({where: {email}});
    if (!user) {
      return true;
    }

    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      3 * ONE_DAY_IN_MILLS
    );

    await sendEmail(
      user.email,
      `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
    );
    return true;
  }

  @Query(() => User, {nullable: true})
  async me(@Ctx() {req}: Context): Promise<User | undefined> {
    if (!req.session.userId) {
      return undefined;
    }
    return await User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() {req}: Context
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return {errors};
    }

    const hashedPassword = await argon2.hash(options.password);
    const createUser = User.create({
      username: options.username,
      password: hashedPassword,
      email: options.email,
    });

    let user: User;
    try {
      user = await createUser.save();
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "Esiste già un utente con questo username",
            },
          ],
        };
      } else {
        console.error(error.message);
        return {
          errors: [
            {
              field: "user",
              message: "Errore salvataggio utente",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return {user};
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() {req}: Context
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: usernameOrEmail.includes("@")
        ? {email: usernameOrEmail}
        : {username: usernameOrEmail},
    });
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Questo username non esiste",
          },
        ],
      };
    }

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return {
        errors: [
          {
            field: "password",
            message: "Username o password errati",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {user};
  }

  @Mutation(() => Boolean)
  logout(@Ctx() {req, res}: Context) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
