import {Ctx, Query, Resolver} from "type-graphql";
import {ResolverContext} from "../types";

@Resolver()
export class HelloResolver {
  @Query(() => String) hello(@Ctx() {req}: ResolverContext) {
    return req.session.userId;
  }
}
