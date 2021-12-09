import { ChainId } from "../common/enums";
require("dotenv").config();
const { POLYGON_CHAIN_ID } = process.env;

export const getChainFromId = (id: ChainId): string | undefined => {
  if (id.toString() === ChainId.Polygon.toString()) {
    return POLYGON_CHAIN_ID;
  }
  return undefined;
};
