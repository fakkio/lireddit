import {FormControl, FormErrorMessage, FormLabel, Input} from "@chakra-ui/core";
import {useField} from "formik";
import React, {InputHTMLAttributes} from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

export const InputField = ({label, size, ...props}: InputFieldProps) => {
  const [field, {error}] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input {...field} {...props} id={field.name} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
