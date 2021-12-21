import {
  BuildAllowanceRequestDto,
  BuildAllowanceResponseDto,
  AllowanceRequestDto,
  AllowanceResponseDto,
  BaseResponseDto,
} from "../common/dtos";
import { getProvider } from "../helpers/web3";
import { ethers } from "ethers";
import { erc20Abi } from "../common/abis/erc20Abi";
import { Interface } from "@ethersproject/abi";
import {  ChainId } from "../common/enums";
import { parseUnits } from "ethers/lib/utils";
import { isNotEmpty } from "../helpers/stringHelper";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
require("dotenv").config();

const { USDC_GOERLI } = process.env;

const ERC20_INTERFACE = new Interface([
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
]);

export const getAllowance = async (dto: AllowanceRequestDto) => {
  let response: BaseResponseDto<AllowanceResponseDto> = {
    success: true,
    result: {
      value: 0,
      tokenAddress: dto.tokenAddress,
    },
  };
  try {
    if (
      isNotEmpty(dto.chainId) &&
      isNotEmpty(dto.owner) &&
      isNotEmpty(dto.spender) &&
      isNotEmpty(dto.tokenAddress)
    ) {
      if (dto.chainId === ChainId.goerli.toString()) {
        const rootToken = new ethers.Contract(
          dto.tokenAddress,
          erc20Abi,
          getProvider()
        );

        const res = await rootToken.functions.allowance(dto.owner, dto.spender);
        response.result = res.toString();
      }
    }

    return response;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    response.success = false;
    return e;
  }
};

export const buildTx = async (
  dto: BuildAllowanceRequestDto
): Promise<BaseResponseDto<BuildAllowanceResponseDto>> => {
  let response: BaseResponseDto<BuildAllowanceResponseDto> = {
    success: true,
    result: {
      data: "",
      to: "",
      from: "",
    },
  };

  try {
    if (
      isNotEmpty(dto.chainId) &&
      isNotEmpty(dto.owner) &&
      isNotEmpty(dto.spender) &&
      isNotEmpty(dto.tokenAddress) &&
      isNotEmpty(dto.amount)
    ) {
      if (dto.chainId === ChainId.goerli.toString()) {
        const rootToken = new ethers.Contract(
          dto.tokenAddress,
          erc20Abi,
          getProvider()
        );

        const allwanceRes = await rootToken.functions.allowance(
          dto.owner,
          dto.spender
        );

        const units = dto.tokenAddress === USDC_GOERLI ? 6 : 18;
        const parsedAmount = parseUnits(dto.amount, units);
        const amountToSpend = ethers.BigNumber.from(parsedAmount.toString());
        const amountAllowed = ethers.BigNumber.from(allwanceRes.toString());
        if (amountToSpend.gt(amountAllowed)) {
          const approveData = ERC20_INTERFACE.encodeFunctionData("approve", [
            dto.spender,
            ethers.utils.hexlify(amountToSpend),
          ]);
          response.result = {
            data: approveData,
            to: dto.tokenAddress,
            from: dto.owner,
          };
        }
      }
    }

    return response;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    response.success = false;
    return e;
  }
};
