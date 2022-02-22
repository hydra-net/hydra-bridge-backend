import express from "express";
import { quote } from "../controllers/bridgeController";
import {
  checkAllowance,
  buildAllowanceTx,
} from "../controllers/allowanceController";
import { buildBridgeTransaction } from "../controllers/bridgeController";
import {
  getBridgeTokens,
  getCommonChains,
} from "../controllers/commonController";
import { getUserBalances } from "../controllers/balancesController";
import {
  validateBuildAllowanceTx,
  validateBuildBridgeTx,
  validateCheckAllowance,
  validateCommonTokens,
  validateQuote,
  validateUserBalances,
} from "../validators/apiValidators";

const routes = express.Router();

routes.get("/approval/check-allowance", validateCheckAllowance, checkAllowance);
routes.get("/approval/build-tx", validateBuildAllowanceTx, buildAllowanceTx);

routes.get("/bridge/quote", validateQuote, quote);
routes.get("/bridge/build-tx", validateBuildBridgeTx, buildBridgeTransaction);

routes.get("/common/tokens", validateCommonTokens, getBridgeTokens);
routes.get("/common/chains", getCommonChains);

routes.get("/balances", validateUserBalances, getUserBalances);

export default routes;
