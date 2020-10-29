import {Box, Button, Flex, Link} from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import {useLogoutMutation, useMeQuery} from "../generated/graphql";
import {isServer} from "../utils/isServer";

interface NavBarProps {}

export const NavBar = ({}: NavBarProps) => {
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
        <Button
          ml={2}
          variant="link"
          onClick={() => logout()}
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
    >
      <NextLink href="/">
        <Link>Home</Link>
      </NextLink>
      {body}
    </Flex>
  );
};
