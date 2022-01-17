import { Interface } from "ethers/lib/utils";
import { hydraBridge } from "../services/contractInterfaces/contractInterfaces";

export const HYDRA_BRIDGE_INTERFACE = new Interface(hydraBridge);