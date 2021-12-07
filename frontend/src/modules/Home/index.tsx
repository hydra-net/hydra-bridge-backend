import Onboard from "bnc-onboard";
import { useEffect, useState } from "react";
// import HydraBRidge from "../../contracts/HydraBridge/HydraBridge.json";
// import Erc20 from "../../contracts/Erc20/Erc20.json";
import { ethers } from "ethers";
import { API } from "bnc-onboard/dist/src/interfaces";
import { buildApprovalTx, checkAllowance } from "../../api/allowancesService";
import { buildBridgeTx } from "../../api/bridgeService";
import { Asset, ChainId } from "../../common/enums";
require("dotenv").config();

const {
  REACT_APP_NETWORK_ID,
  REACT_APP_BLOCKNATIVE_KEY,
  // REACT_APP_HYDRA_BRIDGE_CONTRACT,
  // REACT_APP_USDC_CONTRACT,
} = process.env;

const wallets = [{ walletName: "metamask", preferred: true }];

let provider: any;
// let hydraBridgeContract;
// let erc20Contract: ethers.Contract;
const Home = () => {
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

            // hydraBridgeContract = new ethers.Contract(
            //   REACT_APP_HYDRA_BRIDGE_CONTRACT as string,
            //   HydraBRidge.abi,
            //   provider.getUncheckedSigner()
            // );

            // erc20Contract = new ethers.Contract(
            //   REACT_APP_USDC_CONTRACT as string,
            //   Erc20.abi,
            //   provider.getUncheckedSigner()
            // );

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
      "0x34649a77abb2fc8f7652dd174b5f110347fda697",
      "0x98339D8C260052B7ad81c28c16C0b98420f2B46a"
    );
    console.log(res.data);
  };

  const getApproveTxData = async () => {
    const { address } = onboard?.getState()!;
    const res = await buildApprovalTx(
      "5",
      address,
      "0x34649a77abb2fc8f7652dd174b5f110347fda697",
      "0x98339D8C260052B7ad81c28c16C0b98420f2B46a",
      "1000000"
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
    const res = await buildBridgeTx(address, Asset.Eth, ChainId.Mainnet, Asset.Eth, ChainId.Polygon, "100000000000000000");
    console.log(res.data)
    setBridgeTx(res.data);
  };

  const bridgeAsset = async () => {
    const signer = provider.getUncheckedSigner();

    signer.sendTransaction(brideTx).then((tx: any) => console.log(tx.hash));
  };

  return (
    <div>
      <div>Home</div>
      <button onClick={handleWalletConnect}>Connect wallet</button>
      <button onClick={checkApprove}>Check approval</button>
      <button onClick={getApproveTxData}>Get approve data</button>
      <button onClick={approveWallet}>Approve wallet</button>
      <button onClick={getBridgeTxData}>Get bridge data</button>
      <button onClick={bridgeAsset}>Bridge asset</button>
    </div>
  );
};

export default Home;
