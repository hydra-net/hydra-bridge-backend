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
  onWalletConnect: () => void;
  onWalletApprove: () => void;
  onMoveAssets: () => void;
};

const ActionButtons = ({
  isConnected,
  isApproved,
  onWalletConnect,
  onWalletApprove,
}: Props) => {
  const theme = useTheme();

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
      {isConnected && !isApproved && (
        <Button
          background={theme.greenColor}
          fontWeight={"700"}
          onClick={onWalletApprove}
          width={"100%"}
          text={"Approve"}
        />
      )}

      {isConnected && isApproved && (
        <Button
          background={theme.blueColor}
          fontWeight={"700"}
          onClick={onWalletApprove}
          width={"100%"}
          text={"Approve"}
        />
      )}
    </Root>
  );
};

export default ActionButtons;
