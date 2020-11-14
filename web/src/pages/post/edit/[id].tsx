import {Box, Button, Heading} from "@chakra-ui/core";
import {Form, Formik} from "formik";
import {withUrqlClient} from "next-urql";
import {useRouter} from "next/router";
import React from "react";
import {InputField} from "../../../components/InputField";
import {Layout} from "../../../components/layout";
import {useUpdatePostMutation} from "../../../generated/graphql";
import {createUrqlClient} from "../../../utils/createUrqlClient";
import {useGetPostFromUrl} from "../../../utils/useGetPostFromUrl";

const EditPost = () => {
  const router = useRouter();
  const [, updatePost] = useUpdatePostMutation();
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

  return (
    <Layout variant="small">
      <Heading>Modifica post</Heading>
      <Formik
        initialValues={{
          title: data.post.title ?? "",
          text: data.post.text ?? "",
        }}
        onSubmit={async (values) => {
          const {error} = await updatePost({...values, id: data.post!.id});
          if (!error) {
            await router.back();
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
              Aggiorna post
            </Button>
          </Form>
        )}
      </Formik>{" "}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
