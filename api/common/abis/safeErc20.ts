export const safeERC20 = [
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "safeIncreaseAllowance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
