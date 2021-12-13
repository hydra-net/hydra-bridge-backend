import { ChainId } from "../common/enums";
require("dotenv").config();
const { REACT_APP_POLYGON_CHAIN_ID, REACT_APP_NETWORK_ID } = process.env;

export const getChainFromId = (id?: number): string | undefined => {
  if (id && id.toString() === ChainId.polygoMumbai.toString()) {
    return REACT_APP_POLYGON_CHAIN_ID;
  }

  if (id && id.toString() === ChainId.goerli.toString()) {
    return REACT_APP_NETWORK_ID;
  }

  return undefined;
};
