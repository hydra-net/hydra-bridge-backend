import {
  BaseResponseDto,
  BuildAllowanceResponseDto,
  CheckAllowanceResponseDto,
} from "../common/dtos";
import { fetchWrapper } from "../helpers/fetchWrapper";

require("dotenv").config();
const { REACT_APP_API_URL } = process.env;

export const checkAllowance = async (
  chainId: string,
  owner: string,
  spender: string,
  tokenAddress: string
): Promise<BaseResponseDto<CheckAllowanceResponseDto>> => {
  const response: any = await fetchWrapper.get(
    `${REACT_APP_API_URL}/approval/check-allowance?chainId=${chainId}&owner=${owner}&spender=${spender}&tokenAddress=${tokenAddress}`
  );
  return response.result.data;
};

export const buildApprovalTx = async (
  chainId: string,
  owner: string,
  spender: string,
  tokenAddress: string,
  amount: string
): Promise<BaseResponseDto<BuildAllowanceResponseDto>> => {
  const response: any =
    await fetchWrapper.get(
      `${REACT_APP_API_URL}/approval/build-tx?chainId=${chainId}&owner=${owner}&spender=${spender}&tokenAddress=${tokenAddress}&amount=${amount}`
    );
  return response.result.data;
};
