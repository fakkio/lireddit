import {Flex, IconButton} from "@chakra-ui/core";
import React, {useState} from "react";
import {PostSnippetFragment, useVoteMutation} from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection = ({post}: UpdootSectionProps) => {
  const [clicked, setClicked] = useState<"up" | "down" | undefined>();
  const [{fetching}, vote] = useVoteMutation();

  return (
    <Flex flexDirection="column" mr={4} alignItems="center">
      <IconButton
        icon="chevron-up"
        aria-label="Mi piace"
        title="Mi piace"
        isLoading={fetching && clicked === "up"}
        onClick={async () => {
          setClicked("up");
          await vote({value: 1, postId: post.id});
        }}
      />
      {post.points}
      <IconButton
        icon="chevron-down"
        aria-label="Non mi piace"
        title="Non mi piace"
        isLoading={fetching && clicked === "down"}
        onClick={async () => {
          setClicked("down");
          await vote({value: -1, postId: post.id});
        }}
      />
    </Flex>
  );
};
