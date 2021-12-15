import {
  BuildAllowanceRequestDto,
  BuildAllowanceResponseDto,
  CheckAllowanceDto,
} from "../common/dtos";
import { getProvider } from "../helpers/web3";
import { BigNumber, ethers } from "ethers";
import { erc20Abi } from "../common/abis/erc20Abi";
import { Interface } from "@ethersproject/abi";
import { Asset, ChainId } from "../common/enums";
import { parseUnits } from "ethers/lib/utils";
import { isNotEmpty } from "../helpers/stringHelper";
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

export const getAllowance = async (dto: CheckAllowanceDto) => {
  try {
    let response = {
      value: 0,
      tokenAddress: dto.tokenAddress,
    };
    if (isNotEmpty(dto.chainId) && isNotEmpty(dto.owner) && isNotEmpty(dto.spender) && isNotEmpty(dto.tokenAddress)) {
    
      if (dto.chainId === ChainId.goerli.toString()) {
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
    console.log("Allowance error", e);
    return e;
  }
};
