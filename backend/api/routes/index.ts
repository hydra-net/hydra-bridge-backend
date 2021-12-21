import express from "express";
import { quote } from "../controllers/bridgeController";
import { checkAllowance, buildAllowanceTx } from "../controllers/allowanceController";
import { buildTransaction } from "../controllers/bridgeController";
import { getBridgeTokens, getCommonChains } from "../controllers/commonController";

const routes = express.Router();

routes.get("/approval/build-tx", buildAllowanceTx);
routes.get("/approval/check-allowance", checkAllowance);

routes.get("/bridge/build-tx", buildTransaction);
routes.get("/bridge/quote", quote);

routes.get("/common/tokens", getBridgeTokens);
routes.get("/common/chains", getCommonChains);

export default routes;