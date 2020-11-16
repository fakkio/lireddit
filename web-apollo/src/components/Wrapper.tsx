import {Box} from "@chakra-ui/core";
import * as React from "react";
import {ReactNode} from "react";

export type WrapperVariant = "small" | "regular";

interface WrapperProps {
  children?: ReactNode;
  variant?: WrapperVariant;
}

export const Wrapper = ({children, variant = "regular"}: WrapperProps) => {
  return (
    <Box
      my={8}
      mx="auto"
      maxW={variant === "small" ? "400px" : "800px"}
      w="100%"
    >
      {children}
    </Box>
  );
};
