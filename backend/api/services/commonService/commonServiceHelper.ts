import { TokenResponseDto } from "../../common/dtos";
import prisma from "../../helpers/db";
import { mapTokenToDto } from "../../helpers/mappers/mapperDto";

export const getTokensByChainId = async (
  chainId: number
): Promise<TokenResponseDto[]> => {
  const chain = await prisma.chain.findFirst({
    where: {
      chainId: chainId,
    },
  });

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
        chainToken.token,
        chainToken.chain.id
      );
      tokens.push(dto);
    }
  }

  return tokens;
};
