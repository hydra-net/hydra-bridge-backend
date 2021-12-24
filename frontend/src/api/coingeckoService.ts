import { fetchWrapper } from "../helpers/fetchWrapper";

export const fetchEthUsdPrice = async () : Promise<number> => {
  try {
    const response: any = await fetchWrapper.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
    );
   
    return response.result.ethereum.usd;
  } catch (e) {
    console.log(e);
    return 0;
  }
};
