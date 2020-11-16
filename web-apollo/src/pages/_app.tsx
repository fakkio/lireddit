import {CSSReset, ThemeProvider} from "@chakra-ui/core";
import {AppProps} from "next/app";
import React from "react";
import theme from "../theme";

function MyApp({Component, pageProps}: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      {/*<ColorModeProvider>*/}
      <CSSReset />
      <Component {...pageProps} />
      {/*</ColorModeProvider>*/}
    </ThemeProvider>
  );
}

export default MyApp;
