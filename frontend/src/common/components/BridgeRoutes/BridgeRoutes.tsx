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
  ${getFlexCenter};
`;

const RouteContent = styled.div`
  width: 100%;
  display: flex;
  ${getHorizontalGap("5px")};
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
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

type Props = {
  routes: RouteDto[];
  selectedRouteId?: number;
  onClick: (routeId: number) => void;
};
const BridgeRoutes = ({ routes, selectedRouteId, onClick }: Props) => {
  const theme = useTheme();
  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <Root>
      <TitleContainer>
        <Title>Available routes:</Title>
      </TitleContainer>
      <Container>
        {routes.map((route: RouteDto) => {
          const assetIconName =
            route.bridgeRoute.fromAsset.symbol.toLocaleLowerCase() as IconKeys;
          const isSelected = selectedRouteId === route.id;

          return (
            <Route
              key={route.id}
              isSelected={isSelected}
              onClick={() => onClick(route.id)}
            >
              <RouteContent>
                <AmountContainer>
                  <div>
                    <Icon name={assetIconName} />
                  </div>
                  <AmountStyled>{route.bridgeRoute.amountIn}</AmountStyled>
                </AmountContainer>
                <Icon
                  name="arrowRight"
                  color={isSelected ? theme.primaryColor : theme.secondaryColor}
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

                <Icon name="arrowRight" />
                <AmountContainer>
                  <div>
                    <Icon name={assetIconName} />
                  </div>
                  <AmountStyled isSelected={isSelected}>
                    {route.bridgeRoute.amountOut}
                  </AmountStyled>
                </AmountContainer>
              </RouteContent>
            </Route>
          );
        })}
      </Container>
    </Root>
  );
};

export default BridgeRoutes;
