import styled, { useTheme } from "styled-components";
import { getFlexCenter } from "../../styles";
import Button from "../Buttons/Button";

const Root = styled.div`
  ${getFlexCenter};
  padding: 10px;
`;

type Props = {
  isConnected?: boolean;
  isApproved?: boolean;
  isAllowed?: boolean;
  isEth?: boolean
  isRouteIdSelected?: boolean;
  amountIn?: number;
  onWalletConnect: () => void;
  onWalletApprove: () => void;
  onMoveAssets: () => void;
};

const ActionButtons = ({
  isEth,
  isRouteIdSelected,
  amountIn,
  isConnected,
  isApproved,
  onWalletConnect,
  onWalletApprove,
}: Props) => {
  const theme = useTheme();

  const showSelectRoute = isConnected && !isRouteIdSelected;
  const showApprove = isConnected && amountIn && isRouteIdSelected && !isApproved && !isEth;
  const showMoveAssets = isConnected && (isApproved || isEth) && isRouteIdSelected;

  return (
    <Root>
      {!isConnected && (
        <Button
          background={theme.buttonDefaultColor}
          fontWeight={"700"}
          onClick={onWalletConnect}
          width={"100%"}
          text={"Connect wallet"}
        />
      )}
      {showSelectRoute && (
        <Button
          background={theme.buttonDefaultColor}
          fontWeight={"700"}
          onClick={onWalletApprove}
          width={"100%"}
          text={"Select route"}
        />
      )}
      {showApprove && (
        <Button
          background={theme.greenColor}
          fontWeight={"700"}
          onClick={onWalletApprove}
          width={"100%"}
          text={"Approve"}
        />
      )}

      {showMoveAssets&& (
        <Button
          background={theme.blueColor}
          fontWeight={"700"}
          onClick={onWalletApprove}
          width={"100%"}
          text={"Move"}
        />
      )}
    </Root>
  );
};

export default ActionButtons;
