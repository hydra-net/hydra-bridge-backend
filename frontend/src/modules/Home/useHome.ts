import Onboard from "bnc-onboard";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { API } from "bnc-onboard/dist/src/interfaces";
import { buildApprovalTx, checkAllowance } from "../../api/allowancesService";
import { buildBridgeTx, getQuote } from "../../api/bridgeService";
import {
  BuildTxRequestDto,
  ChainResponseDto,
  QuoteRequestDto,
  TokenResponseDto,
} from "../../common/dtos";
import { parseUnits } from "ethers/lib/utils";
import { getAllChains, getBridgeTokens } from "../../api/commonService";
require("dotenv").config();

const {
  REACT_APP_NETWORK_ID,
  REACT_APP_BLOCKNATIVE_KEY,
  REACT_APP_HYDRA_BRIDGE_CONTRACT,
  REACT_APP_USDC_CONTRACT_GOERLI,
} = process.env;

const wallets = [{ walletName: "metamask", preferred: true }];

let provider: any;

export default function useHome() {
  //wallet
  const [wallet, setWallet] = useState<any>();
  const [onBoard, setOnboard] = useState<API | null>();

  //transaction actions
  const [bridgeRoutes, setBridgeRoutes] = useState<any>();
  const [buildApproveTx, setBuildApproveTx] = useState<any>();
  const [bridgeTx, setBridgeTx] = useState<any>();
  const [txHash, setTxHash] = useState<string>();

  //errors
  const [error, setError] = useState<any>(undefined);

  //checks
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isErrorOpen, setIsErrorOpen] = useState<boolean>(false);
  const [inProgress, setInProgress] = useState<boolean>(false);

  //tokens
  const [tokens, setTokens] = useState<TokenResponseDto[]>([]);
  const [chains, setChains] = useState<ChainResponseDto[]>([]);
  const [chainFrom, setChainFrom] = useState<number>(5);
  const [chainTo, setChainTo] = useState<number>(80001);

  //modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const onboard = Onboard({
      dappId: REACT_APP_BLOCKNATIVE_KEY,
      networkId: Number.parseInt(REACT_APP_NETWORK_ID || "5"),
      subscriptions: {
        wallet: (webWallet) => {
          if (webWallet.provider) {
            setWallet(wallet);

            provider = new ethers.providers.Web3Provider(
              webWallet.provider,
              "any"
            );

            window.localStorage.setItem("selectedWallet", webWallet.name!);
          } else {
            provider = null;
            setWallet({});
          }
        },
      },
      walletSelect: {
        wallets,
      },
    });

    setOnboard(onboard);
  }, [wallet]);

  useEffect(() => {
    async function getTokens() {
      setInProgress(true);
      const result = await getBridgeTokens(chainFrom);
      if (result && result.success) {
        setTokens(result.results);
      }

      setInProgress(false);
    }
    getTokens();
  }, [chainFrom]);

  useEffect(() => {
    async function getChains() {
      setInProgress(true);
      const result = await getAllChains();
      if (result && result.success) {
        setChains(result.results);
      }
      setInProgress(false);
    }
    getChains();
  }, []);

  const onConnectWallet = async () => {
    // Prompt user to select a wallet
    await onBoard?.walletSelect();

    // Run wallet checks to make sure that user is ready to transact
    const isReady = await onBoard?.walletCheck();
    setIsConnected(isReady!);
  };

  const onCheckAllowance = async (
    amountIn: number,
    chainId: string,
    tokenAddress: string
  ) => {
    try {
      const { address } = onBoard?.getState()!;
      const res = await checkAllowance(
        chainId,
        address,
        REACT_APP_HYDRA_BRIDGE_CONTRACT!,
        tokenAddress
      );
      const units = tokenAddress === REACT_APP_USDC_CONTRACT_GOERLI ? 6 : 18;
      const parsedAmountToSpend = parseUnits(amountIn.toString(), units);
      const amountToSpend = ethers.BigNumber.from(parsedAmountToSpend);
      const amountAllowed = ethers.BigNumber.from(res.result?.value.toString());

      setIsApproved(amountAllowed.gte(amountToSpend));
    } catch (e) {
      console.log(e);
      setError(e);
      setIsErrorOpen(true);
    }
  };

  const onGetQuote = async (dto: QuoteRequestDto) => {
    try {
      const res = await getQuote(dto);
      setBridgeRoutes(res.results);
    } catch (e) {
      console.log(e);
      setError(e);
      setIsErrorOpen(true);
    }
  };

  const onBuildApproveTxData = async (
    chainId: string,
    tokenAddress: string,
    amount: string
  ) => {
    try {
      const { address } = onBoard?.getState()!;
      if (!isApproved) {
        const res = await buildApprovalTx(
          chainId,
          address,
          REACT_APP_HYDRA_BRIDGE_CONTRACT!,
          tokenAddress,
          amount
        );
        console.log("Build approve data", res.result);
        setBuildApproveTx(res.result);
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
    try {
      const res = await buildBridgeTx(dto);
      console.log("bridge tx data res", res);
      setBridgeTx(res.result);
    } catch (e) {
      console.log(e);
      setError(e);
      setIsErrorOpen(true);
    }
  };

  return {
    onConnectWallet,
    onGetQuote,
    onCheckAllowance,
    onBuildApproveTxData,
    onApproveWallet,
    getBridgeTxData,
    setChainFrom,
    setChainTo,
    setInProgress,
    setIsModalOpen,
    setIsErrorOpen,
    setTxHash,
    setError,
    setIsApproved,
    chains,
    tokens,
    isConnected,
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
    onBoard,
  };
}
