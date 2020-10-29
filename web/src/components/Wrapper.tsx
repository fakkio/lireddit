import {Box} from "@chakra-ui/core";
import * as React from "react";
import {ReactNode} from "react";

interface WrapperProps {
  children?: ReactNode;
  variant?: "small" | "regular";
}

export const Wrapper = ({children, variant = "regular"}: WrapperProps) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "small" ? "400px" : "800px"}
      w="100%"
    >
      {children}
    </Box>
  );
};
