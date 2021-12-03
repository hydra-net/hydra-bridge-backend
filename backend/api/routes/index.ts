import express from "express";
import {  } from "../controllers/bridgeController";
import { checkAllowance, buildAllowanceTx } from "../controllers/allowanceController";

const routes = express.Router();

routes.get("/approval/build-tx", buildAllowanceTx);
routes.get("/approval/check-allowance", checkAllowance);

export default routes;