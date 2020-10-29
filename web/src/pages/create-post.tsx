import {Box, Button, Heading} from "@chakra-ui/core";
import {Form, Formik} from "formik";
import {withUrqlClient} from "next-urql";
import {useRouter} from "next/router";
import React from "react";
import {InputField} from "../components/InputField";
import {Layout} from "../components/layout";
import {useCreatePostMutation} from "../generated/graphql";
import {createUrqlClient} from "../utils/createUrqlClient";
import {useAuth} from "../utils/useAuth";

interface CreatePostProps {}

const CreatePost = ({}: CreatePostProps) => {
  useAuth();
  const router = useRouter();
  const [, createPost] = useCreatePostMutation();

  return (
    <Layout variant="small">
      <Heading>Crea post</Heading>
      <Formik
        initialValues={{title: "", text: ""}}
        onSubmit={async (values) => {
          const {error} = await createPost({values});
          if (!error) {
            await router.push("/");
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField label="Titolo" name="title" placeholder="Titolo" />
            <Box mt={4}>
              <InputField
                label="Testo"
                name="text"
                placeholder="Test"
                textarea={true}
              />
            </Box>
            <Button
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
              mt={4}
            >
              Crea post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
