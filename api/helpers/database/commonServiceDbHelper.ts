import { TokenResponseDto } from "../../common/dtos";
import prisma from "./db";
import { mapTokenToDto } from "../mappers/mapperDto";
import { Token } from "@prisma/client";

export const getTokensByChainId = async (
  id: number
): Promise<TokenResponseDto[]> => {
  const tokens: TokenResponseDto[] = [];
  if (id && id > 0) {
    const chainTokens = await prisma.chainsOnTokens.findMany({
      where: {
        chain_id: id,
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
            name: true,
          },
        },
      },
    });

    for (const chainToken of chainTokens) {
      const dto: TokenResponseDto = mapTokenToDto(
        chainToken.token as Token,
        chainToken.chain.chainId,
        chainToken.chain.name
      );
      tokens.push(dto);
    }
  }

  return tokens;
};
