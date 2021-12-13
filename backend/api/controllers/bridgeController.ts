import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { buildTx, getQuote} from "../services/bridgeService";


export const buildTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      recipient,
      fromAsset,
      fromChainId,
      toAsset,
      toChainId,
      amount,
      routeId
    }: any = req.query;
    const result = await buildTx({
      recipient,
      fromAsset,
      fromChainId,
      toAsset,
      toChainId,
      amount,
      routeId
    });
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(createError(e.statusCode, e.message));
  }
};

export const quote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      fromAsset,
      fromChainId,
      toAsset,
      toChainId,
      amount
    }: any = req.query;
    const result = await getQuote({
      fromAsset,
      fromChainId,
      toAsset,
      toChainId,
      amount
    });
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(createError(e.statusCode, e.message));
  }
};
