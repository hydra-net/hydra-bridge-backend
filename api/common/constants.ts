import { Interface } from "ethers/lib/utils";
import { hydraBridge } from "../helpers/contractInterfaces/contractInterfaces";

export const HYDRA_BRIDGE_INTERFACE = new Interface(hydraBridge);
export const ETHEREUM_NAME = "ethereum";
export const ETHEREUM_NETWORK_NAME = "mainnet";
export const HOP_RELAYER = "0x0000000000000000000000000000000000000000";
export const HOP_RELAYER_FEE = "0";
