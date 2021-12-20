import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { getTokens } from "../services/commonService";

export const getBridgeTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chainId }: any = req.query;
    const result = await getTokens(chainId);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(createError(e.statusCode, e.message));
  }
};
