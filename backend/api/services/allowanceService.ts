import {
  BuildAllowanceRequestDto,
  BuildAllowanceResponseDto,
  CheckAllowanceDto,
} from "../common/dtos";
import { getProvider } from "../helpers/web3";
import { ethers } from "ethers";
import { erc20Abi } from "../common/abis/erc20Abi";
import { Interface } from "@ethersproject/abi";
require("dotenv").config();
const { ETH_CHAIN_ID } = process.env;

const ERC20_INTERFACE = new Interface([
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
])


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
        const amountToSpend = ethers.BigNumber.from(dto.amount);
        if (amountAllowed >= amountToSpend) {
          const approveData = ERC20_INTERFACE.encodeFunctionData('approve', [dto.spender, ethers.utils.hexlify(amountToSpend)])
          return {
            data: approveData,
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
