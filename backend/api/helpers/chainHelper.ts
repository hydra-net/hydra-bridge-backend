import { ChainId } from "../common/enums";
require("dotenv").config();
const { POLYGON_CHAIN_ID } = process.env;

export const getChainFromId = (id: string): string | undefined => {
  console.log("tu sam!")
  if (ChainId[id] === ChainId.polygonMumbai) {
    console.log("tu nisam!")
    return POLYGON_CHAIN_ID;

  }
  return undefined;
};
