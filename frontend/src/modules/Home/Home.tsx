import { useEffect, useState } from "react";
import styled from "styled-components";
import ActionButtons from "../../common/components/ActionButtons/ActionButtons";
import AppMessage from "../../common/components/AppMessage";
import AssetSelect from "../../common/components/AssetSelect";
import BridgeRoutes from "../../common/components/BridgeRoutes/BridgeRoutes";
import AmountInput from "../../common/components/Input";
import HydraModal from "../../common/components/Modal/HydraModal";
import TransferChainSelects from "../../common/components/TransferChain/TransferChainSelects";
import { BuildTxRequestDto } from "../../common/dtos";
import { Asset } from "../../common/enums";
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

const ErrorContainer = styled.div`
  margin-bottom: 10px;
`;

const Home = () => {
  const [chainFrom, setChainFrom] = useState<number>();
  const [chainTo, setChainTo] = useState<number>();
  const [asset, setAsset] = useState<number>();
  const [amountIn, setAmountIn] = useState<number>(0);
  const [amountOut, setAmountOut] = useState<number>(0.0);
  const [routeId, setRouteId] = useState<number>();

  const {
    onConnectWallet,
    onCheckAllowance,
    onBuildApproveTxData,
    onApproveWallet,
    getBridgeTxData,
    onGetQuote,
    setIsErrorOpen,
    setInProgress,
    setTxHash,
    setIsModalOpen,
    setIsApproved,
    setError,
    isErrorOpen,
    isConnected,
    isApproved,
    inProgress,
    isModalOpen,
    bridgeTx,
    provider,
    bridgeRoutes,
    txHash,
    error,
    onBoard,
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
      !!amountIn &&
      !!chainFrom &&
      asset?.toString() === Asset.usdc.toString()
    ) {
      checkAllowance();
    }
  }, [isConnected, asset, amountIn, chainFrom]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!!asset && !!chainFrom && !!chainTo && !!amountIn) {
      getBridgesQuote();
    }
  }, [asset, chainFrom, chainTo, amountIn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function getApproveTxData() {
      await onBuildApproveTxData(
        getChainFromId(chainFrom!)!,
        getContractFromAsset(asset!)!,
        amountIn?.toString()!
      );
    }

    if (
      isConnected &&
      !!amountIn &&
      !!chainFrom &&
      !!asset &&
      routeId! >= 0 &&
      asset?.toString() === Asset.usdc.toString()
    ) {
      getApproveTxData();
    }
  }, [isConnected, amountIn, chainFrom, asset, routeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function getMoveTxData() {
      const { address } = onBoard?.getState()!;
      const dto: BuildTxRequestDto = {
        amount: amountIn,
        fromAsset: asset!,
        toAsset: asset!,
        fromChainId: chainFrom!,
        toChainId: chainTo!,
        routeId: routeId!,
        recipient: address,
      };

      await getBridgeTxData(dto);
    }

    if ((isApproved || asset?.toString() === Asset.eth.toString()) && routeId! >= 0) {
      getMoveTxData();
    }
  }, [isApproved, routeId, amountIn]);  // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleOnRouteClick = (id: number) => {
    if (!inProgress) {
      setRouteId(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleMoveAssets = async () => {
    try {
      const signer = provider.getUncheckedSigner();
      const { data, to, from, value } = bridgeTx;
      console.log("bridge tx move:", bridgeTx);
      let dto: any = { data, to, from };
      if (asset?.toString() === Asset.eth.toString()) {
        dto.value = value;
      }
      const tx = await signer.sendTransaction(dto);
      setInProgress(true);
      setTxHash(tx.hash);
      setIsModalOpen(true);
      console.log("Move tx", tx);
      const receipt = await tx.wait();
      if (receipt.logs) {
        setInProgress(false);
        setChainTo(undefined);
        setChainFrom(undefined);
        setAmountOut(0.0);
        setAmountIn(0);
        setAsset(undefined);
        setIsApproved(false);
        setRouteId(undefined);
        console.log("Move receipt logs", receipt.logs);
      }
    } catch (e: any) {
      console.log(e);
      setError("Something went wrong!");
      setIsErrorOpen(true);
    }
  };

  return (
    <>
      <Root>
        <TitleContainer>
          <Title>Hydra bridge</Title>
        </TitleContainer>
        <Wrapper>
          <SendWrapper>
            <AssetSelect
              isDisabled={inProgress}
              onSelectAsset={handleSelectAsset}
            />
          </SendWrapper>
          {error && (
            <ErrorContainer>
              <AppMessage
                isOpen={isErrorOpen}
                message={error}
                onClose={() => setIsErrorOpen(false)}
              />
            </ErrorContainer>
          )}
          <TransferWrapper>
            <Container>
              <TransferChainSelects
                chainFrom={chainFrom!}
                chainTo={chainTo!}
                onSelectChainFrom={handleSelectChainFrom}
                onSelectChainTo={handleSelectChainTo}
                isDisabled={inProgress}
              />
              <AmountsContainer>
                <AmountInput
                  amount={amountIn && amountIn}
                  min={0}
                  label={"Send"}
                  onChange={handleAmountInChange}
                  disabled={inProgress}
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
                inProgress={inProgress}
                isRouteIdSelected={routeId! >= 0}
                isEth={!!asset && asset?.toString() === Asset.eth.toString()}
                amountIn={!!amountIn}
                onWalletConnect={onConnectWallet}
                onWalletApprove={onApproveWallet}
                onMoveAssets={handleMoveAssets}
              />
            </Container>
          </TransferWrapper>
          <BridgeRoutes
            selectedRouteId={routeId!}
            routes={bridgeRoutes}
            onClick={handleOnRouteClick}
          />
        </Wrapper>
      </Root>

      <HydraModal
        subtitle="Transaction"
        onClose={handleCloseModal}
        isOpen={isModalOpen}
        tx={txHash!}
      />
    </>
  );
};

export default Home;
