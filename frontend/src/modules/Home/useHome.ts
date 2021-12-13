import Onboard from "bnc-onboard";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { API } from "bnc-onboard/dist/src/interfaces";
import { buildApprovalTx, checkAllowance } from "../../api/allowancesService";
import { buildBridgeTx, getQuote } from "../../api/bridgeService";
import { Asset, ChainId, RouteId } from "../../common/enums";
import { getRouteFromId } from "../../helpers/routeHelper";
import { BuildTxRequestDto, QuoteRequestDto } from "../../common/dtos";
require("dotenv").config();

const {
  REACT_APP_NETWORK_ID,
  REACT_APP_BLOCKNATIVE_KEY,
  REACT_APP_HYDRA_BRIDGE_CONTRACT,
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
  const [brideTx, setBridgeTx] = useState<any>();
  const [approveTxHash, setApproveTxHash] = useState<string>();
  const [moveTxHash, setMoveTxHash] = useState<string>();

  //errors
  const [isError, setIsError] = useState<any>();

  //checks
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

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
      const amountToSpend = ethers.BigNumber.from(amountIn.toString());
      const amountAllowed = ethers.BigNumber.from(res.toString());
      setIsAllowed(amountToSpend.gte(amountAllowed));
    } catch (e) {
      console.log(e);
      setIsError(e);
    }
  };

  const onGetQuote = async (dto: QuoteRequestDto) => {
    try {
      const res = await getQuote(dto);
      setBridgeRoutes(res.data);
    } catch (e) {
      console.log(e);
      setIsError(e);
    }
  };

  const onBuildApproveTxData = async (
    chainId: string,
    tokenAddress: string,
    amount: string,
    routeId: string
  ) => {
    try {
      const { address } = onBoard?.getState()!;
      if (isAllowed) {
        const res = await buildApprovalTx(
          chainId,
          address,
          REACT_APP_HYDRA_BRIDGE_CONTRACT!,
          tokenAddress,
          amount,
          getRouteFromId(routeId)!
        );
        setBuildApproveTx(res.data);
      }
    } catch (e) {
      console.log(e);
      setIsError(e);
    }
  };

  const onApproveWallet = async () => {
    try {
      const signer = provider.getUncheckedSigner();
      const res = await signer.sendTransaction(buildApproveTx);
      setApproveTxHash(res.hash);
    } catch (e) {
      setIsError(e);
      console.log(e);
    }
  };

  const getBridgeTxData = async (dto: BuildTxRequestDto) => {
    try {
      const { address } = onBoard?.getState()!;
      dto.recipient = address;
      const res = await buildBridgeTx(dto);
      setBridgeTx(res.data);
    } catch (e) {
      console.log(e);
      setIsError(e);
    }
  };

  const onMoveAssets = async () => {
    try {
      const signer = provider.getUncheckedSigner();
      const { data, to, from } = brideTx;
      const res = await signer.sendTransaction({ data, to, from });
      setMoveTxHash(res.hash);
    } catch (e) {
      console.log(e);
      setIsError(e);
    }
  };

  return {
    onConnectWallet,
    onGetQuote,
    onCheckAllowance,
    onBuildApproveTxData,
    onApproveWallet,
    getBridgeTxData,
    onMoveAssets,
    isConnected,
    isApproved,
    isAllowed,
    setIsAllowed,
    approveTxHash,
    buildApproveTx,
    moveTxHash,
    bridgeRoutes,
    isError,
  };
}
