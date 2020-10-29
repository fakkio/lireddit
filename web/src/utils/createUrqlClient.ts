import {dedupExchange, Exchange, fetchExchange, stringifyVariables} from "@urql/core";
import {cacheExchange, Resolver} from "@urql/exchange-graphcache";
import Router from "next/router";
import {pipe, tap} from "wonka";
import {LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation} from "../generated/graphql";
import {betterUpdateQuery} from "./betterUpdateQuery";

export const errorExchange: Exchange = ({forward}) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(async ({error}) => {
      if (error?.message.includes("not authenticated")) {
        await Router.replace("/login");
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const {parentKey: entityKey, fieldName} = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    );
    info.partial = !isInTheCache;

    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fieldInfo) => {
      const key = cache.resolveFieldByKey(
        entityKey,
        fieldInfo.fieldKey
      ) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore") as boolean;
      if (!_hasMore) {
        hasMore = _hasMore;
      }
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      posts: results,
      hasMore: hasMore,
    };

    //   const visited = new Set();
    //   let result: NullArray<string> = [];
    //   let prevOffset: number | null = null;
    //
    //   for (let i = 0; i < size; i++) {
    //     const {fieldKey, arguments: args} = fieldInfos[i];
    //     if (args === null || !compareArgs(fieldArgs, args)) {
    //       continue;
    //     }
    //
    //     const links = cache.resolveFieldByKey(entityKey, fieldKey) as string[];
    //     const currentOffset = args[cursorArgument];
    //
    //     if (
    //       links === null ||
    //       links.length === 0 ||
    //       typeof currentOffset !== "number"
    //     ) {
    //       continue;
    //     }
    //
    //     if (!prevOffset || currentOffset > prevOffset) {
    //       for (let j = 0; j < links.length; j++) {
    //         const link = links[j];
    //         if (visited.has(link)) continue;
    //         result.push(link);
    //         visited.add(link);
    //       }
    //     } else {
    //       const tempResult: NullArray<string> = [];
    //       for (let j = 0; j < links.length; j++) {
    //         const link = links[j];
    //         if (visited.has(link)) continue;
    //         tempResult.push(link);
    //         visited.add(link);
    //       }
    //       result = [...tempResult, ...result];
    //     }
    //
    //     prevOffset = currentOffset;
    //   }
    //
    //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    //   if (hasCurrentPage) {
    //     return result;
    //   } else if (!(info as any).store.schema) {
    //     return undefined;
    //   } else {
    //     info.partial = true;
    //     return result;
    //   }
    // };
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {Query: {posts: cursorPagination()}},
      updates: {
        Mutation: {
          createPost: (_resultData, _args, cache) => {
            const allFields = cache.inspectFields("Query");
            const fieldInfos = allFields.filter(
              (info) => info.fieldName === "posts"
            );
            fieldInfos.forEach((fieldInfo) => {
              cache.invalidate("Query", "posts", fieldInfo.arguments ?? {});
            });
          },
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
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
