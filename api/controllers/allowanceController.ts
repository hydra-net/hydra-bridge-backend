import { Response } from "express";
import { AllowanceRequestDto, BuildAllowanceRequestDto } from "../common/dtos";
import { ReqQuery } from "../common/interfaces";
import { handleResponse } from "../helpers/controllerHandler";
import { buildTx, getAllowance } from "../services/allowanceService";

export const checkAllowance = async (
  req: ReqQuery<AllowanceRequestDto>,
  res: Response
) => {
  const { chainId, owner, tokenAddress } = req.query;
  handleResponse(
    res,
    await getAllowance({
      chainId,
      owner,
      tokenAddress,
    })
  );
};

export const buildAllowanceTx = async (
  req: ReqQuery<BuildAllowanceRequestDto>,
  res: Response
) => {
  const { chainId, owner, amount, tokenAddress } = req.query;
  handleResponse(
    res,
    await buildTx({
      chainId,
      owner,
      amount,
      tokenAddress,
    })
  );
};
