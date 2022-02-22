import { handleResponse } from "../helpers/controllerHandler";
import { Response } from "express";
import { getWalletBalances } from "../services/balancesService";
import { ReqQuery } from "../common/interfaces";
import { TokenBalanceRequest } from "../common/dtos";

export const getUserBalances = async (
  req: ReqQuery<TokenBalanceRequest>,
  res: Response
) => {
  const { address, chainId } = req.query;
  handleResponse(res, await getWalletBalances(address, chainId));
};
