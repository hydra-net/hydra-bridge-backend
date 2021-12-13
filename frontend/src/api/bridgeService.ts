import { IApiResponse } from "../common/commonTypes";
import { BuildTxRequestDto, QuoteRequestDto } from "../common/dtos";
import { fetchWrapper } from "../helpers/fetchWrapper";

require("dotenv").config();
const { REACT_APP_API_URL } = process.env;

export const buildBridgeTx = async (dto: BuildTxRequestDto): Promise<any> => {
  const response: IApiResponse = await fetchWrapper.get(
    `${REACT_APP_API_URL}/bridge/build-tx?recipient=${dto.recipient}&fromAsset=${dto.fromAsset}&fromChainId=${dto.fromChainId}&toAsset=${dto.toAsset}&toChainId=${dto.toChainId}&amount=${dto.amount}&routeId=${dto.routeId}`
  );
  return response.data;
};

export const getQuote = async (
  dto : QuoteRequestDto
): Promise<any> => {
  const response: IApiResponse = await fetchWrapper.get(
    `${REACT_APP_API_URL}/bridge/quote?fromAsset=${dto.fromAsset}&fromChainId=${dto.fromChainId}&toAsset=${dto.toAsset}&toChainId=${dto.toChainId}&amount=${dto.amount}`
  );
  return response.data;
};
