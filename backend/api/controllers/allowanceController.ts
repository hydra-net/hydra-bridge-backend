import { Request, Response } from "express";
import { handleResponse } from "../helpers/controllerHandler";
import { buildTx, getAllowance } from "../services/allowanceService";

export const checkAllowance = async (req: Request, res: Response) => {
  const { chainId, owner, spender, tokenAddress }: any = req.query;
  handleResponse(
    res,
    await getAllowance({
      chainId,
      owner,
      spender,
      tokenAddress,
    })
  );
};

export const buildAllowanceTx = async (req: Request, res: Response) => {
  const { chainId, owner, spender, amount, tokenAddress }: any = req.query;
  handleResponse(
    res,
    await buildTx({
      chainId,
      owner,
      spender,
      amount,
      tokenAddress,
    })
  );
};
