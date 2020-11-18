import {ApolloClient, InMemoryCache} from "@apollo/client";
import {NextPageContext} from "next";
import {withApollo as withApolloCreator} from "next-apollo";
import {PaginatedPosts} from "../generated/graphql";
import {isServer} from "./isServer";

const apolloClient = (ctx?: NextPageContext) => {
  let cookie: string | undefined;
  if (isServer()) {
    cookie = ctx?.req?.headers.cookie;
  }

  return new ApolloClient({
    uri: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
    headers: cookie ? {cookie} : undefined,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: false,
              merge(
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts
              ): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existing?.posts ?? []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    }),
  });
};

export const withApollo = withApolloCreator(apolloClient);
