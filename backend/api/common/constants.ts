import { Interface } from "ethers/lib/utils";
import { hydraBridge } from "../services/contractInterfaces/contractInterfaces";
import "dotenv/config";

const { NODE_ENV } = process.env;

export const isTestnet = NODE_ENV === "dev" ? true : false;
export const HYDRA_BRIDGE_INTERFACE = new Interface(hydraBridge);
