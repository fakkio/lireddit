import React, {ReactNode} from "react";
import {NavBar} from "./NavBar";
import {Wrapper, WrapperVariant} from "./Wrapper";

interface LayoutProps {
  children?: ReactNode;
  variant?: WrapperVariant;
}

export const Layout = ({children, variant}: LayoutProps) => {
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};
