import { DefaultTheme } from "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    primaryColor: string;
    secondaryColor: string;

    heading: {
      xxl: string;
      xl: string;
      lg: string;
      md: string;
      sm: string;
      xs: string;
    };

    paragraph: {
      xxl: string;
      xl: string;
      lg: string;
      md: string;
      sm: string;
      xs: string;
    };
  }
}

export const defaultTheme: DefaultTheme = {
  primaryColor: "#ffffff",
  secondaryColor: "#121212",

  heading: {
    xxl: "58px",
    xl: "48px",
    lg: "38px",
    md: "28px",
    sm: "24px",
    xs: "19px",
  },

  paragraph: {
    xxl: "22px",
    xl: "18px",
    lg: "16px",
    md: "14px",
    sm: "12px",
    xs: "10px",
  },
};
