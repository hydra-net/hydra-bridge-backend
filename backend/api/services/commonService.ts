import {
  BaseListResponseDto,
  ChainResponseDto,
  TokenResponseDto,
} from "../common/dtos";
import prisma from "../helpers/db";

require("dotenv").config();
var environment = process.env.NODE_ENV || 'dev';

export const getTokens = async (chainId: string) => {
  let response: BaseListResponseDto<TokenResponseDto> = {
    success: true,
    results: [],
  };

  try {
    const parsedChainId = Number.parseInt(chainId);
    const chain = await prisma.chain.findFirst({
      where: {
        chainId: parsedChainId,
      },
    });

    if (chain) {
      const chainTokens = await prisma.chainsOnTokens.findMany({
        where: {
          chain_id: chain.id,
        },
        include: {
          token: {
            select: {
              name: true,
              address: true,
              decimals: true,
              symbol: true,
            },
          },
          chain: {
            select: {
              chainId: true,
            },
          },
        },
      });
      const tokens: TokenResponseDto[] = [];
      for (let i = 0; i < chainTokens.length; i++) {
        const item = chainTokens[i];
        const dto: TokenResponseDto = {
          name: item.token.name,
          chainId: item.chain.chainId,
          address: item.token.address,
          decimals: item.token.decimals,
          symbol: item.token.symbol,
        };
        tokens.push(dto);
      }
      response.results = tokens;
    }
    return response;
  } catch (e) {
    console.log(e);
    response.success = false;
    return response;
  }
};

export const getChains = async () => {
  let response: BaseListResponseDto<ChainResponseDto> = {
    success: true,
    results: [],
  };

  try {
    const chains = await prisma.chain.findMany({
      where: {
        is_testnet: environment === "dev" ? true : false,
      },
      include: {
        token: {
          select: {
            name: true,
            address: true,
            decimals: true,
            symbol: true,
          },
        },
      },
    });

    if (chains) {
      const chainsResponse: ChainResponseDto[] = [];
      for (let i = 0; i < chains.length; i++) {
        const item = chains[i];
        const dto: ChainResponseDto = {
          chainId: item.chainId,
          name: item.name,
          isL1: item.is_l1,
          isTestnet: item.is_testnet,
          isReceivingEnabled: item.is_receiving_enabled,
          isSendingEnabled: item.is_sending_enabled,
          currency: {
            name: item.token.name,
            chainId: item.chainId,
            address: item.token.address,
            decimals: item.token.decimals,
            symbol: item.token.symbol,
          },
          explorers: item.explorers,
        };
        chainsResponse.push(dto);
      }
      response.results = chainsResponse;
    }
    return response;
  } catch (e) {
    console.log(e);
    response.success = false;
    return response;
  }
};
