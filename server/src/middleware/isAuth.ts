import {MiddlewareFn} from "type-graphql";
import {ResolverContext} from "../types";

export const isAuth: MiddlewareFn<ResolverContext> = (
  {context: {req}},
  next
) => {
  if (!req.session.userId) {
    throw new Error("not authenticated");
  }

  return next();
};
