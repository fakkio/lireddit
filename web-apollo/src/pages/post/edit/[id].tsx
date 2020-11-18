import {Box, Button, Heading} from "@chakra-ui/core";
import {Form, Formik} from "formik";
import {useRouter} from "next/router";
import React from "react";
import {InputField} from "../../../components/InputField";
import {Layout} from "../../../components/layout";
import {useUpdatePostMutation} from "../../../generated/graphql";
import {useGetPostFromUrl} from "../../../utils/useGetPostFromUrl";
import {withApollo} from "../../../utils/withApollo";

const EditPost = () => {
  const router = useRouter();
  const [updatePost] = useUpdatePostMutation();
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

  return (
    <Layout variant="small">
      <Heading>Modifica post</Heading>
      <Formik
        initialValues={{
          title: data.post.title ?? "",
          text: data.post.text ?? "",
        }}
        onSubmit={async (values) => {
          const {errors} = await updatePost({
            variables: {...values, id: data.post!.id},
          });
          if (!errors) {
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

export default withApollo()(EditPost);
