export const priceConsumerAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_pyth", type: "address", internalType: "address" },
      { name: "_priceId", type: "bytes32", internalType: "bytes32" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getLatestPrice",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct PythStructs.Price",
        components: [
          { name: "price", type: "int64", internalType: "int64" },
          { name: "conf", type: "uint64", internalType: "uint64" },
          { name: "expo", type: "int32", internalType: "int32" },
          {
            name: "publishTime",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "priceId",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pyth",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IPyth" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updatePrice",
    inputs: [
      {
        name: "priceUpdateData",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
];
