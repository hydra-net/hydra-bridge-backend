import { Asset } from "../common/enums";
require("dotenv").config();
const { USDC_GOERLI } = process.env;

export const getContractFromAsset = (asset: string): string | undefined => {
  if (asset === Asset.usdc.toString()) {
    return USDC_GOERLI;
  }
  return undefined;
};
