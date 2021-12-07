import express from "express";
import {  } from "../controllers/bridgeController";
import { checkAllowance, buildAllowanceTx } from "../controllers/allowanceController";
import { buildTransaction } from "../controllers/bridgeController";

const routes = express.Router();

routes.get("/approval/build-tx", buildAllowanceTx);
routes.get("/approval/check-allowance", checkAllowance);
routes.get("/bridge/build-tx", buildTransaction);

export default routes;