import { Suspense } from "react";
import Layout from "../common/components/Layout";
import { Routes, Route } from "react-router-dom";
import { defaultTheme } from "./theme/theme";
import { lazyWithPreload } from "../helpers/lazy";
import { routes } from "../routes";
import LoadingSpinner from "../common/components/LoadingSpinner";
import styled from "styled-components";
import { getFlexCenter } from "../common/styles";

const Home = lazyWithPreload(
  () => import(/* webpackChunkName: 'LandingModule' */ "../modules/Home/Home")
);

const Page404 = lazyWithPreload(
  () =>
    import(/* webpackChunkName: 'LandingModule' */ "../modules/Page404/Page404")
);
const FallbackContainer = styled.div`
  ${getFlexCenter};
  height: 460px;
`;
const Shell = () => {
  return (
    <>
      <Layout theme={defaultTheme}>
        <Suspense
          fallback={
            <FallbackContainer>
              <LoadingSpinner />
            </FallbackContainer>
          }
        >
          <Routes>
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.page404} element={<Page404 />} />
            <Route path="*" element={<Page404 />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
};

export default Shell;
