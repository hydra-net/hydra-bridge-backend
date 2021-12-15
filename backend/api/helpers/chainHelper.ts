import { ChainId } from "../common/enums";
require("dotenv").config();
const { POLYGON_CHAIN_ID } = process.env;

export const getChainFromId = (id: string): string | undefined => {
  if (id === ChainId.polygonMumbai.toString()) {
    return POLYGON_CHAIN_ID;

  }
  return undefined;
};
