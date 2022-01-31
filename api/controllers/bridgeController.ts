import { Response } from "express";
import { BuildBridgeTxRequestDto, QuoteRequestDto } from "../common/dtos";
import { ReqQuery } from "../common/interfaces";
import { handleResponse } from "../helpers/controllerHandler";
import { buildTx, getQuote } from "../services/bridgeService";

export const quote = async (req: ReqQuery<QuoteRequestDto>, res: Response) => {
  const { recipient, fromAsset, fromChainId, toAsset, toChainId, amount } =
    req.query;
  handleResponse(
    res,
    await getQuote({
      recipient,
      fromAsset,
      fromChainId,
      toAsset,
      toChainId,
      amount,
    })
  );
};

export const buildBridgeTransaction = async (
  req: ReqQuery<BuildBridgeTxRequestDto>,
  res: Response
) => {
  const {
    recipient,
    fromAsset,
    fromChainId,
    toAsset,
    toChainId,
    amount,
    routeId,
  } = req.query;
  handleResponse(
    res,
    await buildTx({
      recipient,
      fromAsset,
      fromChainId,
      toAsset,
      toChainId,
      amount,
      routeId,
    })
  );
};
