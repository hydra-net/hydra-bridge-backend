import express from "express";
import { buildTransaction } from "../controllers/bridgeController";
import { checkAllowance } from "../controllers/allowanceController";

const routes = express.Router();

routes.get("/build-tx", buildTransaction);
routes.get(`/approval/check-allowance`, checkAllowance);

export default routes;