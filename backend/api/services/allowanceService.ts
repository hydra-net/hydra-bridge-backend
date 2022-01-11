import {
  BuildAllowanceRequestDto,
  AllowanceRequestDto,
  ApiResponseDto,
  ServiceResponseDto,
} from "../common/dtos";
import { getProvider } from "../helpers/web3";
import { ethers } from "ethers";
import { erc20Abi } from "../common/abis/erc20Abi";
import { Interface } from "@ethersproject/abi";
import { parseUnits } from "ethers/lib/utils";
import { isEmpty } from "../helpers/stringHelper";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import prisma from "../helpers/db";
import {
  BadRequest,
  NotFound,
  ServerError,
} from "../helpers/serviceErrorHelper";
require("dotenv").config();

const { USDC_GOERLI } = process.env;

const ERC20_INTERFACE = new Interface(erc20Abi)

export const getAllowance = async (dto: AllowanceRequestDto) => {
  let allowanceResp: ApiResponseDto = {
    success: true,
    result: {
      value: 0,
      tokenAddress: "",
    },
  };
  let response: ServiceResponseDto = {
    status: 200,
    data: null,
  };

  try {
    if (
      isEmpty(dto.chainId) ||
      isEmpty(dto.owner) ||
      isEmpty(dto.spender) ||
      isEmpty(dto.tokenAddress)
    ) {
      return BadRequest();
    }
    const chain = await prisma.chain.findFirst({
      where: { chainId: Number.parseInt(dto.chainId) },
    });

    const token = await prisma.token.findFirst({
      where: { address:  dto.tokenAddress },
    });

    if (!chain || !token) {
      return NotFound();
    }

    const rootToken = new ethers.Contract(
      token.address,
      erc20Abi,
      getProvider()
    );

    const res = await rootToken.functions.allowance(dto.owner, dto.spender);
    allowanceResp.result.tokenAddress = token.address;
    allowanceResp.result.value = res.toString()
    response.data = allowanceResp;
    return response;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError();
  }
};

export const buildTx = async (
  dto: BuildAllowanceRequestDto
): Promise<ServiceResponseDto> => {
  let buildAllowanceResp: ApiResponseDto = {
    success: true,
    result: {
      data: "",
      to: "",
      from: "",
    },
  };

  let response: ServiceResponseDto = {
    status: 200,
    data: buildAllowanceResp,
  };

  try {
    if (
      isEmpty(dto.chainId) ||
      isEmpty(dto.owner) ||
      isEmpty(dto.spender) ||
      isEmpty(dto.tokenAddress) ||
      isEmpty(dto.amount)
    ) {
      return BadRequest();
    }

    const chain = await prisma.chain.findFirst({
      where: { chainId: Number.parseInt(dto.chainId) },
    });

    const token = await prisma.token.findFirst({
      where: { address:  dto.tokenAddress },
    });

    if (!chain || !token) {
      return NotFound();
    }
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
      buildAllowanceResp.result = {
        data: approveData,
        to: dto.tokenAddress,
        from: dto.owner,
      };
      response.data = buildAllowanceResp;
    }
    return response;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError();
  }
};
