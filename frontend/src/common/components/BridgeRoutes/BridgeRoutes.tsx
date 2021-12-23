import styled, { useTheme } from "styled-components";
import { RouteDto } from "../../dtos";
import {
  getFlexCenter,
  getFlexStart,
  getHorizontalGap,
  getVerticalGap,
} from "../../styles";
import Icon from "../Icon/Icon";
import { IconKeys } from "../../commonTypes";
import { getBridgeIconName } from "../../../helpers/bridgeHelper";

const Root = styled.div`
  margin-top: 10px;
  background: rgb(255, 255, 255);
  box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px,
    rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;
  border-radius: 24px;
  margin-left: auto;
  margin-right: auto;
  z-index: 1;
  padding: 10px;
`;

const TitleContainer = styled.div`
  ${getFlexStart};
  margin-top: 10px;
  margin-bottom: 10px;
`;
const Title = styled.div`
  font-size: ${({ theme }) => theme.heading.xs};
  font-weight: 700;
`;

const Container = styled.div`
  display: flex;
  ${getVerticalGap("5px")};
  flex-direction: column;
`;

const Route = styled.div<{ isSelected?: boolean }>`
  height: 100px;
  width: 100%;
  border: 2px solid ${({ theme }) => theme.buttonDefaultColor};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  background: ${(props) =>
    props.isSelected ? props.theme.greenColor : "transparent"};
  color: ${(props) =>
    props.isSelected ? props.theme.primaryColor : props.theme.secondaryColor};
`;

const RouteContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0px 10px 0px 10px;
  height: 100%;
`;

const RouteItems = styled.div`
  width: 100%;
  display: flex;
  ${getHorizontalGap("5px")};
  flex-direction: row;
  justify-content: space-between;
`;

const AmountContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: row;
  ${getFlexCenter};
  ${getHorizontalGap("10px")};
`;

const AmountStyled = styled.div<{ isSelected?: boolean }>`
  font-size: ${({ theme }) => theme.heading.xs};
`;

const BridgeIconContainer = styled.div`
  display: flex;
  flex-direction: row;
  ${getFlexCenter};
  ${getVerticalGap("5px")};
  ${getHorizontalGap("5px")};
`;

const BridgeNameStyled = styled.div`
  font-size: ${({ theme }) => theme.heading.xs};
`;

const FeeContainer = styled.div`
font-size: ${({ theme }) => theme.paragraph.lg};
font-weight: 700;
margin-bottom: 5px;
`;

type Props = {
  isEth: boolean;
  routes: RouteDto[];
  selectedRouteId?: number;
  onClick: (routeId: number) => void;
};
const BridgeRoutes = ({ isEth, routes, selectedRouteId, onClick }: Props) => {
  const theme = useTheme();
  if (!routes || routes.length === 0) {
    return null;
  }
  let filteredRoutes = routes;

  if (isEth) {
    filteredRoutes = routes.filter(
      (route) => route.bridgeRoute.bridgeName !== "hop-bridge-goerli"
    );
  }

  return (
    <Root>
      <TitleContainer>
        <Title>Available routes:</Title>
      </TitleContainer>
      <Container>
        {filteredRoutes.map((route: RouteDto) => {
          const assetIconName =
            route.bridgeRoute.fromAsset.symbol.toLocaleLowerCase() as IconKeys;
          const isSelected = selectedRouteId === route.id;

          const formatAmountIn =
            route.bridgeRoute.amountIn !== ""
              ? route.bridgeRoute.amountIn.length > 6
                ? route.bridgeRoute.amountIn.substring(0, 5) + "..."
                : route.bridgeRoute.amountIn
              : "";
          const formatAmountOut =
            route.bridgeRoute.amountOut !== ""
              ? route.bridgeRoute.amountOut.length > 6
                ? route.bridgeRoute.amountOut.substring(0, 5) + "..."
                : route.bridgeRoute.amountOut
              : "";

          return (
            <Route
              key={route.id}
              isSelected={isSelected}
              onClick={() => onClick(route.id)}
            >
              <RouteContent>
                <FeeContainer>
                  {"Fee: $" +
                    (
                      Math.round(route.fees.transactionCoastUsd * 100) / 100
                    ).toFixed(2)}
                </FeeContainer>

                <RouteItems>
                  <AmountContainer>
                    <div>
                      <Icon name={assetIconName} />
                    </div>
                    <AmountStyled>{formatAmountIn}</AmountStyled>
                  </AmountContainer>

                  <Icon
                    name="arrowRight"
                    color={
                      isSelected ? theme.primaryColor : theme.secondaryColor
                    }
                  />
                  <BridgeIconContainer>
                    <Icon
                      height="24px"
                      width="24px"
                      name={
                        getBridgeIconName(
                          route.bridgeRoute.bridgeName
                        ) as IconKeys
                      }
                    />
                    <BridgeNameStyled>
                      {route.bridgeRoute.bridgeInfo.displayName}
                    </BridgeNameStyled>
                  </BridgeIconContainer>

                  <Icon
                    name="arrowRight"
                    color={
                      isSelected ? theme.primaryColor : theme.secondaryColor
                    }
                  />
                  <AmountContainer>
                    <div>
                      <Icon name={assetIconName} />
                    </div>
                    <AmountStyled isSelected={isSelected}>
                      {formatAmountOut}
                    </AmountStyled>
                  </AmountContainer>
                </RouteItems>
              </RouteContent>
            </Route>
          );
        })}
      </Container>
    </Root>
  );
};

export default BridgeRoutes;
