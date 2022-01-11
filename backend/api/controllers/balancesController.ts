import { handleResponse } from "../helpers/controllerHandler";
import { Request, Response } from "express";
import { getWalletBalances } from "../services/balancesService";

export const getUserBalances = async (req: Request, res: Response) => {
  const { address, chainId } : any = req.query;
  handleResponse(res, await getWalletBalances(address, chainId));
};
