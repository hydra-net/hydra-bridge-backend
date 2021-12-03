import {
  BuildAllowanceRequestDto,
  BuildAllowanceResponseDto,
  CheckAllowanceDto,
} from "../common/dtos";
import { getProvider } from "../helpers/web3";
import { ethers } from "ethers";
import { erc20Abi } from "../common/abis/erc20Abi";
require("dotenv").config();
const { ETH_CHAIN_ID } = process.env;

export const getAllowance = async (dto: CheckAllowanceDto) => {
  try {
    let response = {
      value: 0,
      tokenAddress: dto.tokenAddress,
    };
    if (dto.chainId && dto.owner && dto.spender && dto.tokenAddress) {
      if (dto.chainId === ETH_CHAIN_ID) {
        const rootToken = new ethers.Contract(
          dto.tokenAddress,
          erc20Abi,
          getProvider()
        );

        const res = await rootToken.functions.allowance(dto.owner, dto.spender);
        response.value = res.toString();
      }
    }

    return response;
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const buildTx = async (
  dto: BuildAllowanceRequestDto
): Promise<BuildAllowanceResponseDto> => {
  try {
    let response: BuildAllowanceResponseDto = {
      data: "",
      to: "",
      from: "",
    };
    if (
      dto.chainId &&
      dto.owner &&
      dto.spender &&
      dto.tokenAddress &&
      dto.amount
    ) {
      if (dto.chainId === ETH_CHAIN_ID) {
        const rootToken = new ethers.Contract(
          dto.tokenAddress,
          erc20Abi,
          getProvider()
        );

        const amountAllowed = await rootToken.functions.allowance(
          dto.owner,
          dto.spender
        );
        if (dto.amount === amountAllowed.toString()) {
          return {
            data: dto.amount,
            to: dto.tokenAddress,
            from: dto.owner,
          };
        }
      }
    }

    return response;
  } catch (e) {
    console.log(e);
    return e;
  }
};
