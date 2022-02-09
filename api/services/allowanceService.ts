import {
  BuildAllowanceRequestDto,
  AllowanceRequestDto,
  ServiceResponseDto,
  BuildAllowanceResponseDto,
  AllowanceResponseDto,
} from "../common/dtos";
import { consoleLogger, hydraLogger } from "../helpers/hydraLogger";
import {
  BadRequest,
  NotFound,
  ServerError,
} from "../helpers/serviceErrorHelper";
import {
  getAlowanceAmounts,
  getEncodedApproveFunction,
  getErc20AllowanceAmount,
} from "../helpers/contractHelper";
import { getChainByChainId } from "../helpers/database/chainsDbHelper";
import { getTokenByAddress } from "../helpers/database/tokensDbHelper";

export const getAllowance = async (
  dto: AllowanceRequestDto
): Promise<ServiceResponseDto<AllowanceResponseDto>> => {
  try {
    const chain = await getChainByChainId(parseInt(dto.chainId));

    if (!chain) {
      return NotFound("Chain not found!");
    }

    const token = await getTokenByAddress(dto.tokenAddress);

    if (!token) {
      return NotFound("Token not found!");
    }

    const allowanceAmount = await getErc20AllowanceAmount(
      dto.tokenAddress,
      dto.owner,
      chain.chainId,
      chain.name
    );

    return {
      status: 200,
      data: {
        tokenAddress: token.address,
        value: allowanceAmount.toString(),
      },
    };
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError();
  }
};

export const buildTx = async (
  dto: BuildAllowanceRequestDto
): Promise<ServiceResponseDto<BuildAllowanceResponseDto>> => {
  try {
    const chain = await getChainByChainId(parseInt(dto.chainId));

    if (!chain) {
      return NotFound("Chain not found!");
    }

    const token = await getTokenByAddress(dto.tokenAddress);

    if (!token) {
      return NotFound("Token not found!");
    }

    const { amountToSpend, amountAllowed } = await getAlowanceAmounts(
      dto.tokenAddress,
      dto.owner,
      dto.amount,
      token.decimals,
      chain.chainId,
      chain.name
    );

    if (amountToSpend.gt(amountAllowed)) {
      return {
        status: 200,
        data: {
          data: getEncodedApproveFunction(amountToSpend, chain.chainId),
          to: dto.tokenAddress,
          from: dto.owner,
        },
      };
    }
    return BadRequest("Amount allowed bigger than amount to spend");
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
    return ServerError();
  }
};
