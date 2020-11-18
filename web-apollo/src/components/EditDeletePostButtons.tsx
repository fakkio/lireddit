import {Box, IconButton} from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import {useDeletePostMutation, useMeQuery} from "../generated/graphql";

interface EditDeletePostButtonsProps {
  creatorId: number;
  id: number;
}

export const EditDeletePostButtons = ({
  creatorId,
  id,
}: EditDeletePostButtonsProps) => {
  const [deletePost] = useDeletePostMutation();
  const {data: me} = useMeQuery();

  if (creatorId !== me?.me?.id) {
    return null;
  }

  return (
    <Box>
      <NextLink href={`/post/edit/${id}`}>
        <IconButton mr={2} aria-label="Modifica post" icon="edit" />
      </NextLink>
      <IconButton
        variantColor="red"
        aria-label="Elimina post"
        icon="delete"
        onClick={async () => {
          await deletePost({
            variables: {id},
            update: (cache) => {
              cache.evict({id: `Post:${id}`});
            },
          });
        }}
      />
    </Box>
  );
};
