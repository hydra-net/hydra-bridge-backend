import { Request, Response } from "express";
import { handleResponse } from "../helpers/controllerHandler";
import { getChains, getTokens } from "../services/commonService/commonService";
import { BridgeTokenRequestDto } from "../common/dtos";
import { ReqQuery } from "../common/interfaces";

export const getBridgeTokens = async (
  req: ReqQuery<BridgeTokenRequestDto>,
  res: Response
) => {
  const { chainId } = req.query;
  handleResponse(res, await getTokens(chainId));
};

export const getCommonChains = async (req: Request, res: Response) => {
  handleResponse(res, await getChains());
};
