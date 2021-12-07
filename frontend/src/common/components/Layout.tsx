import styled, { ThemeProvider } from "styled-components";
import { GlobalStyle } from "../../shell/theme/globalStyle";

interface ILayoutProps {
  theme: any;
  children: any;
}

const Container = styled.div``;

const Layout = ({ theme, children }: ILayoutProps) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>{children}</Container>
    </ThemeProvider>
  );
};

export default Layout;
