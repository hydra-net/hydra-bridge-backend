import { useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import ActionButtons from "../../common/components/ActionButtons/ActionButtons";
import AssetSelect from "../../common/components/AssetSelect";
import AmountInput from "../../common/components/Input";
import TransferChainSelects from "../../common/components/TransferChain/TransferChainSelects";
import { Asset, ChainId, RouteId } from "../../common/enums";
import {
  getFlexCenter,
  getFlexStart,
  getVerticalGap,
} from "../../common/styles";
import { getContractFromAsset } from "../../helpers/assetHelper";
import { getChainFromId } from "../../helpers/chainHelper";
import useHome from "./useHome";

const Root = styled.div``;

const TitleContainer = styled.div`
  ${getFlexStart};
  margin-top: 10px;
  margin-left: 10px;
`;
const Title = styled.div`
  font-size: ${({ theme }) => theme.heading.md};
  font-weight: 700;
`;
const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 480px;
  width: 100%;
  margin-top: 3rem;
  padding: 10px;
`;

const TransferWrapper = styled.div`
  background: rgb(255, 255, 255);
  box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px,
    rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;
  border-radius: 24px;
  margin-left: auto;
  margin-right: auto;
  z-index: 1;
  padding: 10px;
`;
const SendWrapper = styled.div`
  ${getFlexCenter}
  width: 100%;
  margin-bottom: 20px;
`;

const Container = styled.div`
  width: 100%;
`;

const AmountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  ${getVerticalGap("15px")};
`;

const Home = () => {
  const [chainFrom, setChainFrom] = useState<ChainId>();
  const [chainTo, setChainTo] = useState<ChainId>();
  const [asset, setAsset] = useState<Asset>();
  const [amountIn, setAmountIn] = useState<number>();
  const [amountOut, setAmountOut] = useState<number>();
  const [routeId, setRouteId] = useState<RouteId>();
  const theme = useTheme();
  const {
    onConnectWallet,
    onCheckAllowance,
    onBuildApproveTxData,
    onApproveWallet,
    getBridgeTxData,
    onMoveAssets,
    isConnected,
    isApproved,
    setIsAllowed,
    isAllowed,
    approveTxHash,
    buildApproveTx,
    moveTxHash,
    isError,
  } = useHome();

  useEffect(() => {
    async function checkAllowance() {
      await onCheckAllowance(
        amountIn?.toString()!,
        getChainFromId(chainFrom!)!,
        getContractFromAsset(asset!)!
      );
    }

    checkAllowance();
  }, [setAmountIn]);

  useEffect(() => {
    async function getApproveTxData() {
      await onBuildApproveTxData(
        getChainFromId(chainFrom!)!,
        getContractFromAsset(asset!)!,
        amountIn?.toString()!,
        routeId!
      );
    }
    getApproveTxData();
  }, [setIsAllowed]);

  const handleSelectChainFrom = (option: any) => {
    if (option.value !== chainTo) {
      setChainFrom(option ? option.value : null);
    }
  };

  const handleSelectChainTo = (option: any) => {
    if (option.value !== chainFrom) {
      setChainTo(option ? option.value : null);
    }
  };

  const handleSelectAsset = (option: any) => {
    setAsset(option ? option.value : null);
  };

  const handleAmountInChange = (e: any) => {
    const { value } = e.target;
    if (value >= 0) {
      setAmountIn(value);
      setAmountOut(value);
    }
  };

  return (
    <Root>
      <TitleContainer>
        <Title>Hydra bridge</Title>
      </TitleContainer>
      <Wrapper>
        <SendWrapper>
          <AssetSelect onSelectAsset={handleSelectAsset} />
        </SendWrapper>
        <TransferWrapper>
          <Container>
            <TransferChainSelects
              chainFrom={chainFrom!}
              chainTo={chainTo!}
              onSelectChainFrom={handleSelectChainFrom}
              onSelectChainTo={handleSelectChainTo}
            />
            <AmountsContainer>
              <AmountInput
                amount={amountIn}
                min={0}
                label={"Send"}
                onChange={handleAmountInChange}
              />
              <AmountInput
                amount={amountOut}
                step={0.01}
                placeholder={"0.0"}
                label={"Receive"}
                disabled={true}
              />
            </AmountsContainer>
            <ActionButtons
              isConnected={isConnected}
              isApproved={isApproved}
              isAllowed={isAllowed}
              onWalletConnect={onConnectWallet}
              onWalletApprove={onApproveWallet}
              onMoveAssets={onMoveAssets}
            />
          </Container>
        </TransferWrapper>
      </Wrapper>
    </Root>
  );
};

export default Home;
