import {FormControl, FormErrorMessage, FormLabel, Input, Textarea} from "@chakra-ui/core";
import {useField} from "formik";
import React, {InputHTMLAttributes} from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  textarea?: boolean;
};

export const InputField = ({
  label,
  size,
  textarea,
  ...props
}: InputFieldProps) => {
  const [field, {error}] = useField(props);

  const Component = textarea ? Textarea : Input;

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Component {...field} {...props} id={field.name} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
