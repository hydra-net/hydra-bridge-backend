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
  isEth?: boolean
  isRouteIdSelected?: boolean;
  amountIn?: boolean;
  inProgress: boolean;
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
  inProgress,
  onWalletConnect,
  onWalletApprove,
  onMoveAssets
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
          disabled={inProgress}
        />
      )}
      {showSelectRoute && (
        <Button
          background={theme.buttonDefaultColor}
          fontWeight={"700"}
          width={"100%"}
          text={"Select route"}
          disabled
        />
      )}
      {showApprove && (
        <Button
          background={theme.greenColor}
          fontWeight={"700"}
          onClick={onWalletApprove}
          width={"100%"}
          text={"Approve"}
          disabled={inProgress}
          isLoading={inProgress}
        />
      )}

      {showMoveAssets && (
        <Button
          background={theme.blueColor}
          fontWeight={"700"}
          onClick={onMoveAssets}
          width={"100%"}
          text={"Move"}
          isLoading={inProgress}
          disabled={inProgress}
        />
      )}
    </Root>
  );
};

export default ActionButtons;
