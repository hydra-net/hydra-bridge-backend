import { query } from "express-validator";
import { validate } from "./expressValidate";
import web3 from "web3";
import { isEmpty } from "../helpers/stringHelper";

const isAddressValid = (value: string) => {
  try {
    return !web3.utils.isAddress(value) || isEmpty(value)
      ? Promise.reject("Invalid address")
      : Promise.resolve(true);
  } catch (e) {
    return Promise.reject("Invalid address");
  }
};

export const validateCommonTokens = validate([query("chainId").isNumeric()]);
export const validateCheckAllowance = validate([
  query("chainId").isNumeric(),
  query("owner").custom(isAddressValid),
  query("tokenAddress").custom(isAddressValid),
]);

export const validateBuildAllowanceTx = validate([
  query("chainId").isNumeric(),
  query("owner").custom(isAddressValid),
  query("amount").isNumeric(),
  query("tokenAddress").custom(isAddressValid),
]);

export const validateQuote = validate([
  query("recipient").custom(isAddressValid),
  query("fromAsset").isNumeric(),
  query("fromChainId").isNumeric(),
  query("toAsset").isNumeric(),
  query("toChainId").isNumeric(),
  query("amount").isNumeric(),
]);

export const validateBuildBridgeTx = validate([
  query("recipient").custom(isAddressValid),
  query("fromAsset").isNumeric(),
  query("fromChainId").isNumeric(),
  query("toAsset").isNumeric(),
  query("toChainId").isNumeric(),
  query("amount").isNumeric(),
  query("routeId").isNumeric(),
]);

export const validateUserBalances = validate([
  query("address").custom(isAddressValid),
  query("chainId").isNumeric(),
]);
