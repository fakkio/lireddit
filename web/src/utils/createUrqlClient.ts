import {dedupExchange, fetchExchange} from "@urql/core";
import {cacheExchange} from "@urql/exchange-graphcache";
import {LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation} from "../generated/graphql";
import {betterUpdateQuery} from "./betterUpdateQuery";

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (resultData, _args, cache) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              {query: MeDocument},
              resultData,
              () => ({me: null})
            );
          },
          login: (resultData, _args, cache) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              {query: MeDocument},
              resultData,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {me: result.login.user};
                }
              }
            );
          },
          register: (resultData, _args, cache) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              {query: MeDocument},
              resultData,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {me: result.register.user};
                }
              }
            );
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
