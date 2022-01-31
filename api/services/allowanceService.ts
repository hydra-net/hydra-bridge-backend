import {
  BuildAllowanceRequestDto,
  AllowanceRequestDto,
  ApiResponseDto,
  ServiceResponseDto,
  AllowanceResponseDto,
  BuildAllowanceResponseDto,
} from "../common/dtos";
import { getProvider } from "../helpers/web3";
import { BigNumber, ethers } from "ethers";
import { erc20Abi } from "../common/abis/erc20Abi";
import { Interface } from "@ethersproject/abi";
import { parseUnits } from "ethers/lib/utils";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import prisma from "../helpers/db";
import { NotFound, ServerError } from "../helpers/serviceErrorHelper";

const ERC20_INTERFACE = new Interface(erc20Abi);

export const getAllowance = async (dto: AllowanceRequestDto) => {
  const allowanceResp: ApiResponseDto<AllowanceResponseDto> = {
    success: true,
    result: {
      value: "0",
      tokenAddress: "",
    },
  };
  const response: ServiceResponseDto<AllowanceResponseDto> = {
    status: 200,
    data: allowanceResp,
  };

  try {
    const chain = await prisma.chain.findFirst({
      where: { chainId: Number.parseInt(dto.chainId) },
    });

    const token = await prisma.token.findFirst({
      where: { address: dto.tokenAddress },
    });

    if (!chain || !token) {
      return NotFound();
    }

    const rootToken = new ethers.Contract(
      token.address,
      erc20Abi,
      getProvider()
    );

    const res: BigNumber = await rootToken.functions.allowance(
      dto.owner,
      dto.spender
    );
    allowanceResp.result.tokenAddress = token.address;
    allowanceResp.result.value = res.toString();
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
): Promise<ServiceResponseDto<BuildAllowanceResponseDto>> => {
  const buildAllowanceResp: ApiResponseDto<BuildAllowanceResponseDto> = {
    success: true,
    result: {
      data: "",
      to: "",
      from: "",
    },
  };

  const response: ServiceResponseDto<BuildAllowanceResponseDto> = {
    status: 200,
    data: buildAllowanceResp,
  };

  try {
    const chain = await prisma.chain.findFirst({
      where: { chainId: Number.parseInt(dto.chainId) },
    });

    const token = await prisma.token.findFirst({
      where: { address: dto.tokenAddress },
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

    const parsedAmount = parseUnits(dto.amount, token.decimals);
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
