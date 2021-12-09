import { IApiResponse } from "../common/commonTypes";
import { Asset, ChainId } from "../common/enums";
import { fetchWrapper } from "../helpers/fetchWrapper";

require("dotenv").config();
const { REACT_APP_API_URL } = process.env;

export const buildBridgeTx = async (
  recipient: string,
  fromAsset: Asset,
  fromChainId: ChainId,
  toAsset: Asset,
  toChainId: ChainId,
  amount: string
): Promise<any> => {
  const response: IApiResponse = await fetchWrapper.get(
    `${REACT_APP_API_URL}/bridge/build-tx?recipient=${recipient}&fromAsset=${fromAsset}&fromChainId=${fromChainId}&toAsset=${toAsset}&toChainId=${toChainId}&amount=${amount}`
  );
  return response.data;
};