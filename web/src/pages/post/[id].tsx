import {Box, Flex, Heading, Text} from "@chakra-ui/core";
import {withUrqlClient} from "next-urql";
import React from "react";
import {EditDeletePostButtons} from "../../components/EditDeletePostButtons";
import {Layout} from "../../components/layout";
import {createUrqlClient} from "../../utils/createUrqlClient";
import {useGetPostFromUrl} from "../../utils/useGetPostFromUrl";

const Post = () => {
  const [{data, fetching}] = useGetPostFromUrl();

  if (fetching) {
    return <Layout>Caricamento in corso</Layout>;
  }

  if (!data) {
    return <Layout>Errore imprevisto</Layout>;
  }

  if (!data.post) {
    return <Layout>Post inesistente</Layout>;
  }

  const {id, title, text, points, creator} = data.post;

  return (
    <Layout>
      <Flex alignItems="center">
        <Heading as="h2">{title}</Heading>
        <Box ml="auto">
          <EditDeletePostButtons creatorId={creator.id} id={id} />
        </Box>
      </Flex>
      <Text mb={2}>
        By {creator.username} - Points {points}
      </Text>
      <Text>{text}</Text>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);
