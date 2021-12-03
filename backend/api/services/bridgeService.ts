import {
  BuildTxRequestDto,
  PolygonBridgeDto,
} from "../common/dtos";
import { Asset, ChainId } from "../common/enums";
import { getProviderUrl } from "../helpers/web3";
import Web3 from "web3";

require("dotenv").config();
const {  USDC_GOERLI, ROOT_CHAIN_MANAGER_PROXY, ERC20_PREDICATE_PROXY } =
  process.env;


export const buildTx = async (dto: BuildTxRequestDto) => {
  try {
    if (
      dto.fromChainId === ChainId.Mainnet &&
      dto.toChainId === ChainId.Polygon
    ) {
      return getPolygonRoute(dto);
    }
  } catch (e) {
    throw new Error(e.message);
  }
};

const getPolygonRoute = (dto: BuildTxRequestDto): PolygonBridgeDto => {
  const web3 = new Web3(getProviderUrl());
  const depositData = web3.eth.abi.encodeParameter("uint256", dto.amount);

  if (dto.fromAsset === Asset.Usdc && dto.toAsset === Asset.Usdc) {
    return {
      contractAddr: ROOT_CHAIN_MANAGER_PROXY,
      depositData: depositData,
      erc20Predicate: ERC20_PREDICATE_PROXY,
      rootToken: USDC_GOERLI,
      amount: dto.amount,
    };
  }

  if (dto.fromAsset === Asset.Eth && dto.toAsset === Asset.Eth) {
    return {
      contractAddr: ROOT_CHAIN_MANAGER_PROXY,
      amount: dto.amount,
    };
  }
};

