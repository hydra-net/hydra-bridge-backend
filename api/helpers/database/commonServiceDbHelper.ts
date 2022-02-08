import { TokenResponseDto } from "../../common/dtos";
import prisma from "./db";
import { mapTokenToDto } from "../mappers/mapperDto";
import { Token } from "@prisma/client";
import { getChainByChainId } from "./chainsDbHelper";

export const getTokensByChainId = async (
  chainId: number
): Promise<TokenResponseDto[]> => {
  const chain = await getChainByChainId(chainId);

  const tokens: TokenResponseDto[] = [];
  if (chain) {
    const chainTokens = await prisma.chainsOnTokens.findMany({
      where: {
        chain_id: chain.id,
      },
      include: {
        token: {
          select: {
            id: true,
            name: true,
            address: true,
            decimals: true,
            symbol: true,
          },
        },
        chain: {
          select: {
            id: true,
            chainId: true,
          },
        },
      },
    });

    for (const chainToken of chainTokens) {
      const dto: TokenResponseDto = mapTokenToDto(
        chainToken.token as Token,
        chainToken.chain.chainId
      );
      tokens.push(dto);
    }
  }

  return tokens;
};
