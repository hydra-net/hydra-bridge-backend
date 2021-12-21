import { BaseListResponseDto, BaseResponseDto, BuildTxRequestDto, BuildTxResponseDto, QuoteRequestDto, QuoteResponseDto } from "../common/dtos";
import { fetchWrapper } from "../helpers/fetchWrapper";

require("dotenv").config();
const { REACT_APP_API_URL } = process.env;

export const buildBridgeTx = async (dto: BuildTxRequestDto): Promise<BaseResponseDto<BuildTxResponseDto>> => {
  const response: any = await fetchWrapper.get(
    `${REACT_APP_API_URL}/bridge/build-tx?recipient=${dto.recipient}&fromAsset=${dto.fromAsset}&fromChainId=${dto.fromChainId}&toAsset=${dto.toAsset}&toChainId=${dto.toChainId}&amount=${dto.amount}&routeId=${dto.routeId}`
  );
  return response.result.data;
};

export const getQuote = async (
  dto : QuoteRequestDto
): Promise<BaseListResponseDto<QuoteResponseDto>> => {
  const response: any = await fetchWrapper.get(
    `${REACT_APP_API_URL}/bridge/quote?fromAsset=${dto.fromAsset}&fromChainId=${dto.fromChainId}&toAsset=${dto.toAsset}&toChainId=${dto.toChainId}&amount=${dto.amount}`
  );
  return response.result.data;
};
