import {  Request, Response } from "express";
import { handleResponse } from "../helpers/controllerHandler";
import { getChains, getTokens } from "../services/commonService/commonService";

export const getBridgeTokens = async (
  req: Request,
  res: Response
) => {
  const { chainId }: any = req.query;
  handleResponse(res, await getTokens(chainId));
};

export const getCommonChains = async (
  req: Request,
  res: Response
) => {
  handleResponse(res, await getChains());
};
