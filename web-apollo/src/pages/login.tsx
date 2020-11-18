import {Formik} from "formik";
import {useRouter} from "next/router";
import React from "react";
import {NavBar} from "../components/NavBar";
import {Wrapper} from "../components/Wrapper";
import {MeDocument, MeQuery, useLoginMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap";

interface LoginProps {}

const Login = ({}: LoginProps) => {
  const router = useRouter();
  const [login] = useLoginMutation();

  return (
    <>
      <NavBar />
      <Wrapper variant="small">
        <Formik
          initialValues={{usernameOrEmail: "", password: ""}}
          onSubmit={async (values, {setErrors}) => {
            const response = await login({
              variables: values,
              update: (cache, {data}) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.login.user,
                  },
                });
                cache.evict({fieldName: "Posts"});
              },
            });
            if (response.data?.login.errors) {
              setErrors(toErrorMap(response.data.login.errors));
            } else if (response.data?.login.user) {
              await router.push(
                typeof router.query.next === "string" ? router.query.next : "/"
              );
            }
          }}
        >
          {({isSubmitting}) => (
            <Form>
              <InputField
                label="Username or Email"
                name="usernameOrEmail"
                placeholder="Username or Email"
              />
              <Box mt={4}>
                <InputField
                  type="password"
                  label="Password"
                  name="password"
                  placeholder="password"
                />
              </Box>
              <Box mt={4} textAlign="right">
                <NextLink href="/forgot-password">
                  <Link>Password dimenticata</Link>
                </NextLink>
              </Box>
              <Button
                type="submit"
                isLoading={isSubmitting}
                variantColor="teal"
                mt={4}
              >
                Login
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

export default withApollo()(Login);
