import { useWeb3 } from "@chainsafe/web3-context";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { ISelectOption } from "../../common/commonTypes";
import ActionButtons from "../../common/components/ActionButtons/ActionButtons";
import AppMessage from "../../common/components/AppMessage";
import AssetSelect from "../../common/components/AssetSelect";
import BridgeRoutes from "../../common/components/BridgeRoutes/BridgeRoutes";
import Icon from "../../common/components/Icon/Icon";
import AmountInput from "../../common/components/Input";
import HydraModal from "../../common/components/Modal/HydraModal";
import TransferChainSelects from "../../common/components/TransferChain/TransferChainSelects";
import { BuildTxRequestDto, ChainResponseDto } from "../../common/dtos";
import { getFlexCenter, getVerticalGap } from "../../common/styles";
import useHome from "./useHome";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "ethers";
import _ from "lodash";

const Root = styled.div``;

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
  const {
    onConnectWallet,
    onApproveWallet,
    onReset,
    getBridgeTxData,
    onGetQuote,
    setChainFrom,
    setChainTo,
    setAsset,
    setAmountIn,
    setAmountOut,
    setRouteId,
    setIsErrorOpen,
    setInProgress,
    setTxHash,
    setIsModalOpen,
    setError,
    buildApproveTx,
    walletBalances,
    tokens,
    isEth,
    chains,
    amountIn,
    amountOut,
    routeId,
    asset,
    isErrorOpen,
    isApproved,
    inProgress,
    isModalOpen,
    bridgeTx,
    provider,
    bridgeRoutes,
    chainTo,
    chainFrom,
    txHash,
    error,
  } = useHome();
  const { address } = useWeb3();
  const isAbleToMove = isApproved || isEth;
  const isConnected = !!address;

  const [isNotEnoughBalance, setIsNotEnoughBalance] = useState<boolean>(false);

  const handleQuote = async (
    recipient: string,
    fromAsset: number,
    toAsset: number,
    fromChainId: number,
    toChainId: number,
    amount: number
  ) => {
    await onGetQuote({
      recipient: recipient,
      fromAsset: fromAsset,
      fromChainId: fromChainId,
      toAsset: toAsset,
      toChainId: toChainId,
      amount: amount,
    });
  };

  const debouncedQuote = useCallback(_.debounce(handleQuote, 1000), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function getMoveTxData() {
      const dto: BuildTxRequestDto = {
        amount: amountIn!,
        fromAsset: asset!,
        toAsset: asset!,
        fromChainId: chainFrom!,
        toChainId: chainTo!,
        routeId: routeId!,
        recipient: address!,
      };

      await getBridgeTxData(dto);
    }

    if (address && amountIn && (isApproved || (isEth && routeId > 0))) {
      getMoveTxData();
    }
  }, [isApproved, routeId, amountIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAmountInChange = (e: any) => {
    const { value } = e.target;
    let regEx = new RegExp(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/); //eslint-disable-line no-useless-escape
    if (regEx.test(value)) {
        setAmountIn(value);
        setAmountOut(value);
        checkBalance(value,asset);
        debouncedQuote(address!, asset, asset, chainFrom, chainTo, value);
    } else {
      const parsedValue = value.replace(/\D/, "");
      setAmountIn(parsedValue);
      setAmountOut(parsedValue);
    }
  };

  const checkBalance = (value: number, asset : number) => {
    try {
      const tokenBalanceDto = walletBalances?.find(
        (tokenBalance) => tokenBalance.tokenId === asset
      );
      if (tokenBalanceDto && value) {
        const units = tokenBalanceDto.symbol.toLocaleLowerCase() !== "eth" ? 6 : 18;
        const parsedAmountToSpend = parseUnits(value.toString(), units);
        const amountInBig = ethers.BigNumber.from(parsedAmountToSpend);
        const balanceBig = ethers.BigNumber.from(tokenBalanceDto?.amount!);
        setIsNotEnoughBalance(amountInBig.gt(balanceBig));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleMoveAssets = async () => {
    try {
      const signer = provider!.getUncheckedSigner();
      const { data, to, from, value } = bridgeTx;
      console.log("bridge tx move:", bridgeTx);
      let dto: any = { data, to, from };
      if (isEth) {
        dto.value = value;
      }

      const tx = await signer.sendTransaction(dto);
      setInProgress(true);
      setTxHash(tx.hash);
      setIsModalOpen(true);
      console.log("Move tx", tx);
      const receipt = await tx.wait();
      if (receipt.logs) {
        onReset();
        console.log("Move receipt logs", receipt.logs);
      }
    } catch (e: any) {
      console.log(e);
      setError("Something went wrong!");
      setIsErrorOpen(true);
    }
  };

  const handleSelectChainFrom = (option: any) => {
    const { value } = option;
    if (value !== chainTo) {
      setChainFrom(option ? value : null);
      debouncedQuote(address!, asset, asset, value, chainTo, amountIn!);
    }
  };

  const handleSelectChainTo = (option: any) => {
    const { value } = option;
    if (option.value !== chainFrom) {
      setChainTo(option ? option.value : null);
      debouncedQuote(address!, asset, asset, chainFrom, value, amountIn!);
    }
  };

  const handleSelectAsset = (option: any) => {
    const { value } = option;
    setAsset(option ? value : null);
    if(amountIn && amountIn > 0)
    {
      checkBalance(amountIn,value)
      debouncedQuote(address!, value, value, chainFrom, chainTo, amountIn!);
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

  const chainsFrom: ISelectOption[] = chains
    ? chains
        .filter((item) => item.chainId === 5)
        .map((chain: ChainResponseDto) => {
          return {
            label: chain.name,
            value: chain.chainId,
            icon: <Icon name={"eth"} size="20px" />,
          };
        })
    : [];

  const chainsTo: ISelectOption[] = chains
    ? chains
        .filter((item) => item.chainId === 80001)
        .map((chain: ChainResponseDto) => {
          return {
            label: chain.name,
            value: chain.chainId,
            icon: <Icon name={"polygon"} size="20px" />,
          };
        })
    : [];

  return (
    <>
      <Root>
        <Wrapper>
          <SendWrapper>
            <AssetSelect
              selectedTokenId={asset}
              tokens={tokens}
              onSelectAsset={handleSelectAsset}
              isLoading={inProgress}
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
                chainsFrom={chainsFrom}
                chainsTo={chainsTo}
                chainFrom={chainFrom}
                chainTo={chainTo}
                onSelectChainFrom={handleSelectChainFrom}
                onSelectChainTo={handleSelectChainTo}
                isDisabled={inProgress}
              />
              <AmountsContainer>
                <AmountInput
                  amount={amountIn}
                  label={"Send"}
                  min={0}
                  placeholder={"0.0"}
                  disabled={inProgress}
                  onChange={handleAmountInChange}
                />
                <AmountInput
                  amount={amountOut}
                  placeholder={"0.0"}
                  label={"Receive"}
                  disabled={true}
                />
              </AmountsContainer>
              <ActionButtons
                isConnected={isConnected}
                isApproved={isApproved}
                inProgress={inProgress}
                isRouteIdSelected={routeId > 0}
                isEth={isEth}
                isAmountSet={!!amountIn}
                isAbleToMove={isAbleToMove}
                isNotEnoughBalance={isNotEnoughBalance}
                isApproveReady={!!buildApproveTx}
                onWalletConnect={onConnectWallet}
                onWalletApprove={onApproveWallet}
                onMoveAssets={handleMoveAssets}
              />
            </Container>
          </TransferWrapper>
          {isAbleToMove && !!amountIn && amountIn > 0 && isConnected && !isNotEnoughBalance && (
            <BridgeRoutes
              inProgress={inProgress}
              selectedRouteId={routeId}
              routes={bridgeRoutes}
              onRouteSelect={handleOnRouteClick}
            />
          )}
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
