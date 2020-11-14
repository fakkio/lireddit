import {Box, Button, Flex, Link, Text} from "@chakra-ui/core";
import NextLink from "next/link";
import {useRouter} from "next/router";
import React from "react";
import {useLogoutMutation, useMeQuery} from "../generated/graphql";
import {isServer} from "../utils/isServer";

interface NavBarProps {}

export const NavBar = ({}: NavBarProps) => {
  const router = useRouter();
  const [{data, fetching}] = useMeQuery({pause: isServer()});
  const [{fetching: logoutFetching}, logout] = useLogoutMutation();

  let body = null;
  if (fetching) {
  } else if (!data?.me) {
    body = (
      <Box ml="auto">
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </Box>
    );
  } else {
    body = (
      <Flex ml="auto">
        <Box>Ciao {data?.me.username}!</Box>
        <NextLink href="/create-post">
          <Link ml={2}>Crea nuovo post</Link>
        </NextLink>
        <Button
          ml={2}
          variant="link"
          onClick={async () => {
            await logout();
            router.reload();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      bg="#34495e"
      p={4}
      color="#ecf0f1"
      position="sticky"
      top={0}
      zIndex={10}
      alignItems="center"
    >
      <NextLink href="/">
        <Link>
          <Text fontSize="xl">LiReddit</Text>
        </Link>
      </NextLink>
      {body}
    </Flex>
  );
};
