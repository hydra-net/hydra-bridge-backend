import { Asset } from "../common/enums";
require("dotenv").config();
const { REACT_APP_USDC_CONTRACT_GOERLI } = process.env;

export const getContractFromAsset = (asset?: Asset): string | undefined => {
  if (asset && asset.toString() === Asset.Usdc.toString()) {
    return REACT_APP_USDC_CONTRACT_GOERLI;
  }
  return undefined;
};
