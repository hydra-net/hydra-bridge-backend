import Onboard from "bnc-onboard";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { API } from "bnc-onboard/dist/src/interfaces";
import { buildApprovalTx, checkAllowance } from "../../api/allowancesService";
import { buildBridgeTx } from "../../api/bridgeService";
import { Asset, ChainId, RouteId } from "../../common/enums";
require("dotenv").config();

const {
  REACT_APP_NETWORK_ID,
  REACT_APP_BLOCKNATIVE_KEY,
  REACT_APP_HYDRA_BRIDGE_CONTRACT,
} = process.env;

const wallets = [{ walletName: "metamask", preferred: true }];

let provider: any;

export default function useHome() {
  const [wallet, setWallet] = useState<any>();
  const [onboard, setOnboard] = useState<API | null>();
  const [buildApproveTx, setBuildApproveTx] = useState<any>();
  const [brideTx, setBridgeTx] = useState<any>();

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

  const handleWalletConnect = async () => {
    // Prompt user to select a wallet
    await onboard?.walletSelect();

    // Run wallet checks to make sure that user is ready to transact
    await onboard?.walletCheck();
  };

  const checkApprove = async () => {
    const { address } = onboard?.getState()!;
    const res = await checkAllowance(
      "5",
      address,
      REACT_APP_HYDRA_BRIDGE_CONTRACT!,
      "0x98339D8C260052B7ad81c28c16C0b98420f2B46a"
    );
    console.log(res.data);
  };

  const getApproveTxData = async () => {
    const { address } = onboard?.getState()!;
    const res = await buildApprovalTx(
      "5",
      address,
      REACT_APP_HYDRA_BRIDGE_CONTRACT!,
      "0x98339D8C260052B7ad81c28c16C0b98420f2B46a",
      "1000000",
      "0"
    );
    console.log(res.data);
    setBuildApproveTx(res.data);
  };

  const approveWallet = async () => {
    const signer = provider.getUncheckedSigner();

    signer
      .sendTransaction(buildApproveTx)
      .then((tx: any) => console.log(tx.hash));
  };

  const getBridgeTxData = async () => {
    const { address } = onboard?.getState()!;
    const res = await buildBridgeTx(
      address,
      Asset.Usdc,
      ChainId.Mainnet,
      Asset.Usdc,
      ChainId.Polygon,
      "1000000",
      RouteId.Hop
    );
    console.log(res.data);
    setBridgeTx(res.data);
  };

  const bridgeAsset = async () => {
    const signer = provider.getUncheckedSigner();
    const { data, to, from } = brideTx;
    signer
      .sendTransaction({ data, to, from })
      .then((tx: any) => console.log(tx.hash));
  };

  return {
    handleWalletConnect,
    checkApprove,
    getApproveTxData,
    approveWallet,
    getBridgeTxData,
    bridgeAsset,
  };
}

