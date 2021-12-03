import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { buildTx } from "../services/bridgeService";

export const buildTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await buildTx(req.body);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(createError(e.statusCode, e.message));
  }
};
