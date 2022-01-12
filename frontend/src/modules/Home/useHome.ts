import { useEffect, useState } from "react";
import { buildApprovalTx } from "../../api/allowancesService";
import { buildBridgeTx, getQuote } from "../../api/bridgeService";
import {
  BuildTxRequestDto,
  ChainResponseDto,
  QuoteRequestDto,
  RouteDto,
  TokenBalanceDto,
  TokenResponseDto,
} from "../../common/dtos";
import { getAllChains, getBridgeTokens } from "../../api/commonService";
import { fetchEthUsdPrice } from "../../api/coingeckoService";
import { useWeb3 } from "@chainsafe/web3-context";
import { getUserAddressBalances } from "../../api/balancesService";
import { isEmpty } from "../../helpers/stringHelper";
require("dotenv").config();

const { REACT_APP_HYDRA_BRIDGE_CONTRACT } = process.env;

export const CHAIN_FROM_DEFAULT = 5;
export const CHAIN_TO_DEFAULT = 80001;

export default function useHome() {
  //transaction actions
  const [bridgeRoutes, setBridgeRoutes] = useState<RouteDto[]>([]);
  const [buildApproveTx, setBuildApproveTx] = useState<any>();
  const [bridgeTx, setBridgeTx] = useState<any>();
  const [txHash, setTxHash] = useState<string>();

  //errors
  const [error, setError] = useState<any>(undefined);

  //checks
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isErrorOpen, setIsErrorOpen] = useState<boolean>(false);
  const [inProgress, setInProgress] = useState<boolean>(false);

  //state
  const [tokens, setTokens] = useState<TokenResponseDto[]>([]);
  const [chains, setChains] = useState<ChainResponseDto[]>([]);
  const [chainFrom, setChainFrom] = useState<number>(CHAIN_FROM_DEFAULT);
  const [chainTo, setChainTo] = useState<number>(CHAIN_TO_DEFAULT);
  const [walletBalances, setWalletBalances] = useState<TokenBalanceDto[]>();
  const [asset, setAsset] = useState<number>(4);
  const [amountIn, setAmountIn] = useState<number>(0.0);
  const [amountOut, setAmountOut] = useState<number>(0.0);
  const [routeId, setRouteId] = useState<number>(0);
  const [ethPrice, setEthPrice] = useState<number>(0);

  //modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const token = tokens.find((t) => t.id === asset);
  const isEth = token?.symbol.toString().toLowerCase() === "eth";

  const { onboard, address, provider } = useWeb3();

  useEffect(() => {
    async function getEthPrice() {
      const ethPriceApi = await fetchEthUsdPrice();
      setEthPrice(ethPriceApi);
    }
    getEthPrice();
  }, []);

  useEffect(() => {
    async function getWalletBalances() {
      try {
        if (address) {
          const res = await getUserAddressBalances(address, chainFrom);
          if (res && res.success) {
            setWalletBalances(res.result);
          }
        }
      } catch (e) {
        console.log(e);
        setError(e);
        setIsErrorOpen(true);
      }
    }
    getWalletBalances();
  }, [address, chainFrom, setWalletBalances]);

  useEffect(() => {
    async function getTokens() {
      const res = await getBridgeTokens(chainFrom);
      if (res && res.success) {
        setTokens(res.result);
      }
    }
    getTokens();
  }, [chainFrom]);

  useEffect(() => {
    async function getChains() {
      const res = await getAllChains();
      if (res && res.success) {
        setChains(res.result);
      }
    }
    getChains();
  }, []);

  const onConnectWallet = async () => {
    // Prompt user to select a wallet
    await onboard?.walletSelect();

    // Run wallet checks to make sure that user is ready to transact
    await onboard?.walletCheck();
  };

  const onGetQuote = async (dto: QuoteRequestDto) => {
    setInProgress(true);
    if (
      dto.amount &&
      dto.fromAsset &&
      dto.toAsset &&
      dto.toChainId &&
      dto.fromChainId &&
      dto.recipient
    ) {
      try {
        const res = await getQuote(dto);
        if (res.success) {
          if (res.result) {
            const isEther = res.result.fromAsset.symbol.toLowerCase() === "eth";
            if (res.result.routes.length > 0) {
              let filteredRoutes = res.result.routes;

              if (isEther) {
                filteredRoutes = res.result.routes.filter(
                  (route: RouteDto) =>
                    route.bridgeRoute.bridgeName !== "hop-bridge-goerli"
                );
              }
              const cheapestRoute = filteredRoutes[0];
              setRouteId(cheapestRoute.id);
              setBridgeRoutes(filteredRoutes);
            }

            if (res.result.isApproved) {
              setIsApproved(true);
            } else {
              setIsApproved(false);

              if (!isEther) {
                await onBuildApproveTxData(
                  dto.recipient,
                  res.result.isApproved,
                  dto.toChainId,
                  dto.amount,
                  res.result.fromAsset.address
                );
              }
            }
          }
        }
      } catch (e) {
        console.log(e);
        setError(e);
        setIsErrorOpen(true);
      } finally {
        setInProgress(false);
      }
    }
  };

  const onBuildApproveTxData = async (
    walletAddress: string,
    isApproved: boolean,
    chainId: number,
    amount: number,
    tokenAddress: string
  ) => {
    try {
      if (
        !isApproved &&
        walletAddress &&
        !isEmpty(amount.toString()) &&
        tokenAddress &&
        !isEth
      ) {
        const res = await buildApprovalTx(
          chainId,
          walletAddress,
          REACT_APP_HYDRA_BRIDGE_CONTRACT!,
          tokenAddress,
          amount
        );
        if (res.success) {
          console.log("Build approve data", res);
          setBuildApproveTx(res.result);
        }
      }
    } catch (e) {
      console.log(e);
      setError(e);
      setIsErrorOpen(true);
    }
  };

  const onApproveWallet = async () => {
    try {
      if (buildApproveTx) {
        const signer = provider!.getUncheckedSigner();
        const tx = await signer.sendTransaction(buildApproveTx);
        if (tx) {
          console.log("Approve tx hash:", tx.hash);
          setInProgress(true);
          setTxHash(tx.hash);
          setIsModalOpen(true);
          const receipt = await tx.wait();
          if (receipt.logs) {
            setIsApproved(true);
            console.log("Approve receipt logs", receipt.logs);
            await onGetQuote({
              recipient: address!,
              fromAsset: asset,
              fromChainId: chainFrom,
              toAsset: asset,
              toChainId: chainTo,
              amount: amountIn,
            });
          }
        }
      }
    } catch (e: any) {
      console.log(e);
      setError(e);
      setIsErrorOpen(true);
    } finally {
      setInProgress(false);
    }
  };

  const getBridgeTxData = async (dto: BuildTxRequestDto) => {
    try {
      const res = await buildBridgeTx(dto);
      if (res.success) {
        console.log("bridge tx data res", res.result);
        setBridgeTx(res.result);
      }
    } catch (e) {
      console.log(e);
      setError(e);
      setIsErrorOpen(true);
    }
  };

  const onReset = () => {
    setInProgress(false);
    setAmountOut(0.0);
    setAmountIn(0.0);
    setIsApproved(false);
    setRouteId(0);
  };

  return {
    onConnectWallet,
    onGetQuote,
    onBuildApproveTxData,
    onApproveWallet,
    onReset,
    getBridgeTxData,
    setChainFrom,
    setChainTo,
    setAsset,
    setAmountIn,
    setAmountOut,
    setRouteId,
    setInProgress,
    setIsModalOpen,
    setIsErrorOpen,
    setTxHash,
    setError,
    setIsApproved,
    walletBalances,
    token,
    chains,
    tokens,
    asset,
    ethPrice,
    amountIn,
    amountOut,
    routeId,
    isEth,
    isApproved,
    isErrorOpen,
    inProgress,
    isModalOpen,
    provider,
    chainFrom,
    chainTo,
    bridgeTx,
    buildApproveTx,
    txHash,
    bridgeRoutes,
    error,
  };
}
