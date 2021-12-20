import { IApiResponse } from "../common/commonTypes";
import { fetchWrapper } from "../helpers/fetchWrapper";

require("dotenv").config();
const { REACT_APP_API_URL } = process.env;

export const getBridgeTokens = async (chainId: number): Promise<any> => {
  const response: IApiResponse = await fetchWrapper.get(
    `${REACT_APP_API_URL}/common/tokens?chainId=${chainId}`
  );
  return response.data;
};