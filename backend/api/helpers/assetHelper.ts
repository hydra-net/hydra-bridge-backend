import { Asset } from "../common/enums";
require("dotenv").config();
const { USDC_GOERLI } = process.env;

export const getContractFromAsset = (asset: Asset): string | undefined => {
  if (asset.toString() === Asset.Usdc.toString()) {
    return USDC_GOERLI;
  }
  return undefined;
};
