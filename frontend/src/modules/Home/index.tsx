import { useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import ActionButtons from "../../common/components/ActionButtons/ActionButtons";
import AssetSelect from "../../common/components/AssetSelect";
import BridgeRoutes from "../../common/components/BridgeRoutes";
import AmountInput from "../../common/components/Input";
import TransferChainSelects from "../../common/components/TransferChain/TransferChainSelects";
import { Asset } from "../../common/enums";
import {
  getFlexCenter,
  getFlexStart,
  getVerticalGap,
} from "../../common/styles";
import { getContractFromAsset } from "../../helpers/assetHelper";
import { getChainFromId } from "../../helpers/chainHelper";
import { routes } from "../../routes";
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
  max-width: 520px;
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
  const [chainFrom, setChainFrom] = useState<number>();
  const [chainTo, setChainTo] = useState<number>();
  const [asset, setAsset] = useState<number>();
  const [amountIn, setAmountIn] = useState<number>();
  const [amountOut, setAmountOut] = useState<number>();
  const [routeId, setRouteId] = useState<string>();
  const theme = useTheme();
  const {
    onConnectWallet,
    onCheckAllowance,
    onBuildApproveTxData,
    onApproveWallet,
    getBridgeTxData,
    onGetQuote,
    onMoveAssets,
    isConnected,
    isApproved,
    setIsAllowed,
    isAllowed,
    bridgeRoutes,
    approveTxHash,
    buildApproveTx,
    moveTxHash,
    isError,
  } = useHome();

  useEffect(() => {
    async function checkAllowance() {
      await onCheckAllowance(
        amountIn!,
        getChainFromId(chainFrom!)!,
        getContractFromAsset(asset!)!
      );
    }

    if (
      isConnected &&
      amountIn &&
      chainFrom &&
      asset?.toString() === Asset.usdc.toString()
    ) {
      checkAllowance();
    }
  }, [isConnected, asset!]);

  useEffect(() => {
    async function getBridgesQuote() {
      await onGetQuote({
        fromAsset: asset!,
        fromChainId: chainFrom!,
        toAsset: asset!,
        toChainId: chainTo!,
        amount: amountIn!,
      });
    }
    if (asset && chainFrom && chainTo && amountIn) {
      getBridgesQuote();
    }
  }, [asset, chainFrom, chainTo, amountIn]);

  useEffect(() => {
    async function checkAllowance() {
      await onCheckAllowance(
        amountIn!,
        getChainFromId(chainFrom!)!,
        getContractFromAsset(asset!)!
      );
    }
    if (
      isConnected &&
      amountIn &&
      chainFrom &&
      Asset[asset!] === Asset.usdc.toString()
    ) {
      checkAllowance();
    }
  }, [isConnected, asset]);

  useEffect(() => {
    async function getApproveTxData() {
      await onBuildApproveTxData(
        getChainFromId(chainFrom!)!,
        getContractFromAsset(asset!)!,
        amountIn?.toString()!,
        routeId!
      );
    }
    if (isConnected && amountIn && chainFrom && asset) {
      getApproveTxData();
    }
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
    console.log(option.value);
    setAsset(option ? option.value : null);
  };

  const handleAmountInChange = (e: any) => {
    const { value } = e.target;
    if (value >= 0) {
      setAmountIn(value);
      setAmountOut(value);
    }
  };

  const handleOnRouteClick = (id: string) => {
    console.log("tu sam", id);
    setRouteId(id);
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
                amount={amountIn && amountIn}
                min={0}
                label={"Send"}
                onChange={handleAmountInChange}
              />
              <AmountInput
                amount={amountOut && amountOut}
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
              isRouteIdSelected={parseInt(routeId!) >= 0}
              isEth={!!asset && asset?.toString() === Asset.eth.toString()}
              amountIn={amountIn}
              onWalletConnect={onConnectWallet}
              onWalletApprove={onApproveWallet}
              onMoveAssets={onMoveAssets}
            />
          </Container>
        </TransferWrapper>
        <BridgeRoutes
          selectedRouteId={routeId}
          routes={bridgeRoutes}
          onClick={handleOnRouteClick}
        />
      </Wrapper>
    </Root>
  );
};

export default Home;
