import {Box, Button, Icon, Link} from "@chakra-ui/core";
import {Form, Formik} from "formik";
import NextLink from "next/link";
import {useRouter} from "next/router";
import React, {useState} from "react";
import {InputField} from "../../components/InputField";
import {NavBar} from "../../components/NavBar";
import {Wrapper} from "../../components/Wrapper";
import {MeDocument, MeQuery, useChangePasswordMutation} from "../../generated/graphql";
import {toErrorMap} from "../../utils/toErrorMap";
import {withApollo} from "../../utils/withApollo";

const ChangePassword = () => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");

  return (
    <>
      <NavBar />
      <Wrapper variant="small">
        <Formik
          initialValues={{newPassword: ""}}
          onSubmit={async (values, {setErrors}) => {
            const response = await changePassword({
              variables: {
                token:
                  typeof router.query.token === "string"
                    ? router.query.token
                    : "",
                newPassword: values.newPassword,
              },
              update: (cache, {data}) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {__typename: "Query", me: data?.changePassword.user},
                });
              },
            });
            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              await router.push("/");
            }
          }}
        >
          {({isSubmitting}) => (
            <Form>
              <InputField
                type="password"
                label="Nuova password"
                name="newPassword"
                placeholder="Nuova password"
              />
              {tokenError && (
                <Box>
                  <Box style={{color: "red"}}>
                    <Icon name="warning" /> {tokenError}
                  </Box>
                  <NextLink href="/forgot-password">
                    <Link>Richiedine uno nuovo</Link>
                  </NextLink>
                </Box>
              )}
              <Button
                type="submit"
                isLoading={isSubmitting}
                variantColor="teal"
                mt={4}
              >
                Cambia password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

export default withApollo()(ChangePassword);
