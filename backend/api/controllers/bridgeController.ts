import { Request, Response } from "express";
import { handleResponse } from "../helpers/controllerHandler";
import { buildTx, getQuote } from "../services/bridgeService";

export const quote = async (req: Request, res: Response) => {
  const { fromAsset, fromChainId, toAsset, toChainId, amount }: any = req.query;
  handleResponse(
    res,
    await getQuote({
      fromAsset,
      fromChainId,
      toAsset,
      toChainId,
      amount,
    })
  );
};

export const buildTransaction = async (req: Request, res: Response) => {
  const {
    recipient,
    fromAsset,
    fromChainId,
    toAsset,
    toChainId,
    amount,
    routeId,
  }: any = req.query;
  handleResponse(
    res,
    await buildTx({
      recipient,
      fromAsset,
      fromChainId,
      toAsset,
      toChainId,
      amount,
      routeId,
    })
  );
};
