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
  isEth?: boolean;
  isAbleToMove?: boolean;
  isRouteIdSelected?: boolean;
  isAmountSet?: boolean;
  inProgress: boolean;
  onWalletConnect: () => void;
  onWalletApprove: () => void;
  onMoveAssets: () => void;
};

const ActionButtons = ({
  isEth,
  isAbleToMove,
  isRouteIdSelected,
  isAmountSet,
  isConnected,
  isApproved,
  inProgress,
  onWalletConnect,
  onWalletApprove,
  onMoveAssets,
}: Props) => {
  const theme = useTheme();
  const showApprove =
    isConnected && isAmountSet && !isApproved && !isEth && !inProgress;
  const showInputAmount = isConnected && !isAmountSet && !inProgress;
  const showSelectRoute =
    isConnected && !isRouteIdSelected && isAbleToMove && isAmountSet && !inProgress;
  const showMoveAssets =
    isConnected && isAbleToMove && isRouteIdSelected && isAmountSet && !inProgress;

  return (
    <Root>
      {!isConnected && (
        <Button
          background={theme.blueColor}
          fontWeight={"700"}
          onClick={onWalletConnect}
          width={"100%"}
          text={"Connect wallet"}
          disabled={inProgress}
        />
      )}

      {showInputAmount && (
        <Button
          background={theme.buttonDefaultColor}
          fontWeight={"700"}
          onClick={onWalletConnect}
          width={"100%"}
          text={"Input amount"}
          disabled={inProgress}
        />
      )}

      {inProgress && isConnected && (
        <Button
          background={theme.buttonDefaultColor}
          fontWeight={"700"}
          onClick={onWalletConnect}
          width={"100%"}
          isLoading={inProgress}
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
