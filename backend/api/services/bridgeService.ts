import { BuildTxRequestDto, PolygonBridgeDto } from "../common/dtos";
import { Asset, ChainId } from "../common/enums";
import { getProviderUrl } from "../helpers/web3";
import { Interface } from "@ethersproject/abi";

import Web3 from "web3";
import { getContractFromAsset } from "../helpers/assetHelper";
import { ethers } from "ethers";
import { formatUnits } from "@ethersproject/units";

require("dotenv").config();
const {
  USDC_GOERLI,
  ETH_CONTRACT,
  ROOT_CHAIN_MANAGER_PROXY,
  ERC20_PREDICATE_PROXY,
} = process.env;

const HYDRA_BRIDGE_INTERFACE = new Interface([
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "address",
        name: "rootToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "depositData",
        type: "bytes",
      },
    ],
    name: "sendToPolygon",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "sendEthToPolygon",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
]);

export const buildTx = async (dto: BuildTxRequestDto) => {
  try {
    if (
      dto.fromChainId.toString() === ChainId.Mainnet.toString() &&
      dto.toChainId.toString() === ChainId.Polygon.toString()
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

  if (
    dto.fromAsset.toString() === Asset.Usdc.toString() &&
    dto.toAsset.toString() === Asset.Usdc.toString()
  ) {
    const sendToPolygonData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendToPolygon",
      [
        dto.recipient,
        getContractFromAsset(dto.fromAsset),
        dto.amount,
        depositData,
      ]
    );

    return {
      data: sendToPolygonData,
      to: ETH_CONTRACT,
      from: dto.recipient,
    };
  }

  if (
    dto.fromAsset.toString() === Asset.Eth.toString() &&
    dto.toAsset.toString() === Asset.Eth.toString()
  ) {
    const sendEthToPolygonData = HYDRA_BRIDGE_INTERFACE.encodeFunctionData(
      "sendEthToPolygon",
      [dto.recipient]
    );
    return {
      data: sendEthToPolygonData,
      to: ETH_CONTRACT,
      from: dto.recipient,
      value: ethers.utils
        .parseEther(ethers.utils.formatEther(dto.amount))
        .toHexString(),
    };
  }

  return {
    data: "",
    to: "",
    from: "",
  };
};
