import { PrismaClient } from "@prisma/client";
import { TokenResponseDto, TokensResponseDto } from "../common/dtos";
import prisma from "../helpers/db";


export const getTokens = async (chainId: string) => {
  let response: TokensResponseDto = {
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
