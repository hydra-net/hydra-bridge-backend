import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { buildApprovalTx, checkAllowance } from "../../api/allowancesService";
import { buildBridgeTx, getQuote } from "../../api/bridgeService";
import {
  BuildTxRequestDto,
  ChainResponseDto,
  QuoteRequestDto,
  RouteDto,
  TokenResponseDto,
} from "../../common/dtos";
import { parseUnits } from "ethers/lib/utils";
import { getAllChains, getBridgeTokens } from "../../api/commonService";
import { Asset } from "../../common/enums";
import { fetchEthUsdPrice } from "../../api/coingeckoService";
import { useWeb3 } from "@chainsafe/web3-context";
require("dotenv").config();

const {
  REACT_APP_HYDRA_BRIDGE_CONTRACT,
} = process.env;

export const CHAIN_FROM_DEFAULT = 5;
export const CHAIN_TO_DEFAULT = 80001;

let provider: any;

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
  const [asset, setAsset] = useState<number>(4);
  const [amountIn, setAmountIn] = useState<number>(0);
  const [amountOut, setAmountOut] = useState<number>(0.0);
  const [routeId, setRouteId] = useState<number>(0);
  const [ethPrice, setEthPrice] = useState<number>(0);

  //modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const token = tokens.find((t) => t.id === asset);
  const isEth = token?.symbol.toString().toLowerCase() === Asset[Asset.eth];

  const { onboard, address } = useWeb3();

  useEffect(() => {
    async function getEthPrice() {
      const ethPriceApi = await fetchEthUsdPrice();
      setEthPrice(ethPriceApi);
    }
    getEthPrice();
  }, []);

  useEffect(() => {
    async function getTokens() {
      setInProgress(true);
      const res = await getBridgeTokens(chainFrom);
      if (res && res.success) {
        setTokens(res.result);
      }

      setInProgress(false);
    }
    getTokens();
  }, [chainFrom]);

  useEffect(() => {
    async function getChains() {
      setInProgress(true);
      const res = await getAllChains();
      if (res && res.success) {
        setChains(res.result);
      }
      setInProgress(false);
    }
    getChains();
  }, []);

  const onConnectWallet = async () => {
    // Prompt user to select a wallet
    await onboard?.walletSelect();

    // Run wallet checks to make sure that user is ready to transact
   await onboard?.walletCheck();
  };

  const onCheckAllowance = async (
    amountIn: number,
    chainId: number,
    tokenAddress: string
  ) => {
    setInProgress(true);
    try {
      if (amountIn > 0) {
        const { address } = onboard?.getState()!;
        const res = await checkAllowance(
          chainId,
          address,
          REACT_APP_HYDRA_BRIDGE_CONTRACT!,
          tokenAddress
        );
        if (res.success) {
          const units = !isEth ? 6 : 18;
          const parsedAmountToSpend = parseUnits(amountIn.toString(), units);
          const amountToSpend = ethers.BigNumber.from(parsedAmountToSpend);
          const amountAllowed = ethers.BigNumber.from(
            res.result?.value.toString()
          );
          setIsApproved(amountAllowed.gte(amountToSpend));
        }
      }
    } catch (e) {
      console.log(e);
      setError(e);
      setIsErrorOpen(true);
    } finally {
      setInProgress(false);
    }
  };

  const onGetQuote = async (dto: QuoteRequestDto) => {
    try {
      setInProgress(true);
      const res = await getQuote(dto);
      if (res.success) {
        setBridgeRoutes(res.result ? res.result.routes : []);
      }
    } catch (e) {
      console.log(e);
      setError(e);
      setIsErrorOpen(true);
    } finally {
      setInProgress(false);
    }
  };

  const onBuildApproveTxData = async (
    chainId: number,
    tokenAddress: string,
    amount: number
  ) => {
    setInProgress(true);
    try {
      if (!isApproved && address) {
        const res = await buildApprovalTx(
          chainId,
          address,
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
    } finally {
      setInProgress(false);
    }
  };

  const onApproveWallet = async () => {
    try {
      if (buildApproveTx) {
        const signer = provider.getUncheckedSigner();
        const tx = await signer.sendTransaction(buildApproveTx);
        if (tx) {
          console.log("Approve tx hash:", tx.hash);
          setInProgress(true);
          setTxHash(tx.hash);
          setIsModalOpen(true);
          const receipt = await tx.wait();
          if (receipt.logs) {
            setIsApproved(true);
            setInProgress(false);
            console.log("Approve receipt logs", receipt.logs);
          }
        }
      }
    } catch (e: any) {
      console.log(e);
      setError(e);
      setIsErrorOpen(true);
    }
  };

  const getBridgeTxData = async (dto: BuildTxRequestDto) => {
    setInProgress(true);
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
    } finally {
      setInProgress(false);
    }
  };

  const onReset = () => {
    setInProgress(false);
    setAmountOut(0.0);
    setAmountIn(0);
    setIsApproved(false);
    setRouteId(0);
  };

  return {
    onConnectWallet,
    onGetQuote,
    onCheckAllowance,
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
    error
  };
}
