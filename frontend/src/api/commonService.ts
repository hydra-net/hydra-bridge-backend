import {
  BaseListResponseDto,
  ChainResponseDto,
  TokenResponseDto,
} from "../common/dtos";
import { fetchWrapper } from "../helpers/fetchWrapper";

require("dotenv").config();
const { REACT_APP_API_URL } = process.env;

export const getBridgeTokens = async (
  chainId: number
): Promise<BaseListResponseDto<TokenResponseDto>> => {
  const response: any = await fetchWrapper.get(
    `${REACT_APP_API_URL}/common/tokens?chainId=${chainId}`
  );

  return response.result.data;
};

export const getAllChains = async (): Promise<
  BaseListResponseDto<ChainResponseDto>
> => {
  const response: any = await fetchWrapper.get(
    `${REACT_APP_API_URL}/common/chains`
  );
  return response.result.data;
};
