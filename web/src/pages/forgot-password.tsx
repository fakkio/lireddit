import {Alert, AlertIcon, Button} from "@chakra-ui/core";
import {Form, Formik} from "formik";
import {withUrqlClient} from "next-urql";
import React, {useState} from "react";
import {InputField} from "../components/InputField";
import {NavBar} from "../components/NavBar";
import {Wrapper} from "../components/Wrapper";
import {useForgotPasswordMutation} from "../generated/graphql";
import {createUrqlClient} from "../utils/createUrqlClient";

interface ForgotPasswordProps {}

const ForgotPassword = ({}: ForgotPasswordProps) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <>
      <NavBar />
      <Wrapper variant="small">
        {complete ? (
          <Alert status="success">
            <AlertIcon />
            Se l'account esiste, ti verrà inviata un email con il link per
            resettare la password
          </Alert>
        ) : (
          <Formik
            initialValues={{email: ""}}
            onSubmit={async (values) => {
              await forgotPassword(values);
              setComplete(true);
            }}
          >
            {({isSubmitting}) => (
              <Form noValidate={true}>
                <InputField label="Email" name="email" placeholder="Email" />
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  variantColor="teal"
                  mt={4}
                >
                  Password dimenticata
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
