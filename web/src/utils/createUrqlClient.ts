import {dedupExchange, Exchange, fetchExchange, stringifyVariables} from "@urql/core";
import {Cache, cacheExchange, Resolver} from "@urql/exchange-graphcache";
import gql from "graphql-tag";
import Router from "next/router";
import {pipe, tap} from "wonka";
import {
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables
} from "../generated/graphql";
import {betterUpdateQuery} from "./betterUpdateQuery";
import {isServer} from "./isServer";

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
  };
};

const invalidateAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
  fieldInfos.forEach((fieldInfo) => {
    cache.invalidate("Query", "posts", fieldInfo.arguments ?? {});
  });
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie: string | undefined;
  if (isServer()) {
    cookie = ctx?.req.headers.cookie;
  }

  return {
    url: process.env.NEXT_PUBLIC_API_URL!,
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? {cookie} : undefined,
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
            deletePost: (_resultData, args, cache) => {
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (_resultData, args, cache) => {
              const {postId, value} = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    votedStatus
                  }
                `,
                {id: postId} as any
              );
              if (data) {
                if (data.voteStatus === value) {
                  return;
                }
                const newPoints =
                  (data.points as number) + (data.votedStatus ? 2 : 1) * value;
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      votedStatus
                    }
                  `,
                  {id: postId, points: newPoints, votedStatus: value} as any
                );
              }
            },

            createPost: (_resultData, _args, cache) => {
              invalidateAllPosts(cache);
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
              invalidateAllPosts(cache);
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
  };
};
