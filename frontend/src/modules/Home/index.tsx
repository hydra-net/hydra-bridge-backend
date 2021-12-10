import { useState } from "react";
import styled, { useTheme } from "styled-components";
import Button from "../../common/components/Buttons/Button";
import TransferChainSelects from "../../common/components/TransferChain/TransferChainSelects";
import { getFlexCenter } from "../../common/styles";
import useHome from "./useHome";

const Root = styled.div``;
const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 480px;
  width: 100%;
  background: rgb(255, 255, 255);
  box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px,
    rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;
  border-radius: 24px;
  margin-top: 5rem;
  margin-left: auto;
  margin-right: auto;
  z-index: 1;
  padding: 10px;
`;

const Container = styled.div`
  width: 100%;
`;
const ButtonContainer = styled.div`
  ${getFlexCenter};
  flex-direction: column;
`;

const Home = () => {
  const [chainFrom, setChainFrom] = useState<string>("");
  const [chainTo, setChainTo] = useState<string>("");
  const theme = useTheme();
  const {
    handleWalletConnect,
    // checkApprove,
    // getApproveTxData,
    // approveWallet,
    // getBridgeTxData,
    // bridgeAsset,
  } = useHome();

  const handleSelectChainFrom = (option: any) => {
    setChainFrom(option ? option.value : null);
  };

  const handleSelectChainTo = (option: any) => {
    setChainTo(option ? option.value : null);
  };

  return (
    <Root>
      <Wrapper>
        <Container>
          <TransferChainSelects
            chainFrom={chainFrom}
            chainTo={chainTo}
            onSelectChainFrom={handleSelectChainFrom}
            onSelectChainTo={handleSelectChainTo}
          />
          <ButtonContainer>
            <Button
              background={theme.buttonDefaultColor}
              fontWeight={"700"}
              onClick={handleWalletConnect}
              width={"100%"}
              text={"Connect wallet"}
            />
          </ButtonContainer>
        </Container>
      </Wrapper>
    </Root>
  );
};

export default Home;
