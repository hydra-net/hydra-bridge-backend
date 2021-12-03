import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { buildTx, getAllowance } from "../services/allowanceService";

export const checkAllowance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chainId, owner, spender, tokenAddress }: any = req.query;
    const result = await getAllowance({
      chainId,
      owner,
      spender,
      tokenAddress,
    });
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(createError(e.statusCode, e.message));
  }
};

export const buildTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chainId, owner, spender, amount, tokenAddress }: any = req.query;
    const result = await buildTx({
      chainId,
      owner,
      spender,
      amount,
      tokenAddress,
    });
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(createError(e.statusCode, e.message));
  }
};
