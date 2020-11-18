import {ApolloCache, gql} from "@apollo/client";
import {Flex, IconButton} from "@chakra-ui/core";
import React, {useState} from "react";
import {PostSnippetFragment, useVoteMutation, VoteMutation} from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    votedStatus: number | null;
  }>({
    id: `Post:${postId}`,
    fragment: gql`
      fragment _ on Post {
        id
        points
        votedStatus
      }
    `,
  });
  if (data) {
    if (data.votedStatus === value) {
      return;
    }
    const newPoints =
      (data.points as number) + (data.votedStatus ? 2 : 1) * value;
    cache.writeFragment({
      id: `Post:${postId}`,
      fragment: gql`
        fragment __ on Post {
          points
          votedStatus
        }
      `,
      data: {id: postId, points: newPoints, votedStatus: value},
    });
  }
};

export const UpdootSection = ({post}: UpdootSectionProps) => {
  const [clicked, setClicked] = useState<"up" | "down" | undefined>();
  const [vote, {loading}] = useVoteMutation();

  return (
    <Flex flexDirection="column" mr={4} alignItems="center">
      <IconButton
        icon="chevron-up"
        aria-label="Mi piace"
        title="Mi piace"
        isLoading={loading && clicked === "up"}
        isDisabled={post.votedStatus === 1}
        variantColor={post.votedStatus === 1 ? "green" : undefined}
        onClick={async () => {
          setClicked("up");
          await vote({
            variables: {value: 1, postId: post.id},
            update: (cache) => updateAfterVote(1, post.id, cache),
          });
        }}
      />
      {post.points}
      <IconButton
        icon="chevron-down"
        aria-label="Non mi piace"
        title="Non mi piace"
        isLoading={loading && clicked === "down"}
        isDisabled={post.votedStatus === -1}
        variantColor={post.votedStatus === -1 ? "red" : undefined}
        onClick={async () => {
          setClicked("down");
          await vote({
            variables: {value: -1, postId: post.id},
            update: (cache) => updateAfterVote(-1, post.id, cache),
          });
        }}
      />
    </Flex>
  );
};
