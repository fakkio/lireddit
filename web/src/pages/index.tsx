import {Heading} from "@chakra-ui/core";
import {withUrqlClient} from "next-urql";
import * as React from "react";
import {NavBar} from "../components/NavBar";
import {Wrapper} from "../components/Wrapper";
import {usePostsQuery} from "../generated/graphql";
import {createUrqlClient} from "../utils/createUrqlClient";

const Index = () => {
  const [{data}] = usePostsQuery();
  return (
    <>
      <NavBar />
      <Wrapper>
        <Heading mb={4}>Posts</Heading>
        {data &&
          data.posts.map((post) => <div key={post.id}>{post.title}</div>)}
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
