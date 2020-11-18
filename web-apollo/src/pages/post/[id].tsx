import {Box, Flex, Heading, Text} from "@chakra-ui/core";
import React from "react";
import {EditDeletePostButtons} from "../../components/EditDeletePostButtons";
import {Layout} from "../../components/layout";
import {useGetPostFromUrl} from "../../utils/useGetPostFromUrl";
import {withApollo} from "../../utils/withApollo";

const Post = () => {
  const {data, loading} = useGetPostFromUrl();

  if (loading) {
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

export default withApollo({ssr: true})(Post);
