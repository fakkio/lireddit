import {Box, Button} from "@chakra-ui/core";
import {Form, Formik} from "formik";
import {useRouter} from "next/router";
import React from "react";
import {InputField} from "../components/InputField";
import {NavBar} from "../components/NavBar";
import {Wrapper} from "../components/Wrapper";
import {MeDocument, MeQuery, useRegisterMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap";
import {withApollo} from "../utils/withApollo";

interface RegisterProps {}

const Register = ({}: RegisterProps) => {
  const router = useRouter();
  const [register] = useRegisterMutation();

  return (
    <>
      <NavBar />
      <Wrapper variant="small">
        <Formik
          initialValues={{username: "", password: "", email: ""}}
          onSubmit={async (values, {setErrors}) => {
            const response = await register({
              variables: {options: values},
              update: (cache, {data}) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.register.user,
                  },
                });
              },
            });
            if (response.data?.register.errors) {
              setErrors(toErrorMap(response.data.register.errors));
            } else if (response.data?.register.user) {
              await router.push("/");
            }
          }}
        >
          {({isSubmitting}) => (
            <Form noValidate={true}>
              <InputField
                label="Username"
                name="username"
                placeholder="username"
              />
              <Box mt={4}>
                <InputField
                  type="password"
                  label="Password"
                  name="password"
                  placeholder="password"
                />
              </Box>
              <Box mt={4}>
                <InputField
                  type="email"
                  label="Email"
                  name="email"
                  placeholder="Email"
                />
              </Box>
              <Button
                type="submit"
                isLoading={isSubmitting}
                variantColor="teal"
                mt={4}
              >
                Register
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

export default withApollo()(Register);
