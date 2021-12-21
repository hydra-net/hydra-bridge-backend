import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { hydraLogger } from "../helpers/hydraLogger";
import { getChains, getTokens } from "../services/commonService";

export const getBridgeTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
)  => {
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

export const getCommonChains = async (
  req: Request,
  res: Response,
  next: NextFunction
)  => {
  try {
    const result = await getChains();
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(createError(e.statusCode, e.message));
  }
};