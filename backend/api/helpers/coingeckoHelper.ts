export const getGeckoToTokenSymbol = (geckoSymbol: string) => {
  if (geckoSymbol === "usd-coin") {
    return "usdc";
  }

  return "eth";
};
