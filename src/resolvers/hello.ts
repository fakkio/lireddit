import {Ctx, Query, Resolver} from "type-graphql";
import {Context} from "../types";

@Resolver()
export class HelloResolver {
  @Query(() => String) hello(@Ctx() {req}: Context) {
    return req.session;
  }
}
