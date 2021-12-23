import {
  BaseResponseDto,
  BuildAllowanceResponseDto,
  CheckAllowanceResponseDto,
} from "../common/dtos";
import { fetchWrapper } from "../helpers/fetchWrapper";

require("dotenv").config();
const { REACT_APP_API_URL } = process.env;

export const checkAllowance = async (
  chainId: number,
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
  chainId: number,
  owner: string,
  spender: string,
  tokenAddress: string,
  amount: number
): Promise<BaseResponseDto<BuildAllowanceResponseDto>> => {
  const response: any =
    await fetchWrapper.get(
      `${REACT_APP_API_URL}/approval/build-tx?chainId=${chainId}&owner=${owner}&spender=${spender}&tokenAddress=${tokenAddress}&amount=${amount}`
    );
  return response.result.data;
};
