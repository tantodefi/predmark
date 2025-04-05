export const marketAbi = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_diaOracle", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "MarketCreated",
    "inputs": [
      { "name": "marketId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "cryptoPair", "type": "string", "indexed": false, "internalType": "string" },
      { "name": "strikePrice", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "endTime", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "resolutionTime", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketResolved",
    "inputs": [
      { "name": "marketId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "outcome", "type": "bool", "indexed": false, "internalType": "bool" },
      { "name": "resolutionPrice", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RewardsClaimed",
    "inputs": [
      { "name": "marketId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SharesBought",
    "inputs": [
      { "name": "marketId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "buyer", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "isYes", "type": "bool", "indexed": false, "internalType": "bool" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "function",
    "name": "MARKET_CREATION_FEE",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "buyShares",
    "inputs": [
      { "name": "_marketId", "type": "uint256", "internalType": "uint256" },
      { "name": "_isYes", "type": "bool", "internalType": "bool" },
      { "name": "_sharesAmount", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "claimRewards",
    "inputs": [{ "name": "_marketId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createMarket",
    "inputs": [
      { "name": "_cryptoPair", "type": "string", "internalType": "string" },
      { "name": "_strikePrice", "type": "uint256", "internalType": "uint256" },
      { "name": "_endTime", "type": "uint256", "internalType": "uint256" },
      { "name": "_resolutionTime", "type": "uint256", "internalType": "uint256" },
      { "name": "_diaOracleKey", "type": "string", "internalType": "string" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "diaOracleConsumer",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address", "internalType": "contract DIAPriceConsumer" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllMarkets",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct LuksoFutures.Market[]",
        "components": [
          { "name": "id", "type": "uint256", "internalType": "uint256" },
          { "name": "cryptoPair", "type": "string", "internalType": "string" },
          { "name": "strikePrice", "type": "uint256", "internalType": "uint256" },
          { "name": "endTime", "type": "uint256", "internalType": "uint256" },
          { "name": "resolutionTime", "type": "uint256", "internalType": "uint256" },
          { "name": "diaOracleKey", "type": "string", "internalType": "string" },
          { "name": "yesSharesToken", "type": "address", "internalType": "address" },
          { "name": "noSharesToken", "type": "address", "internalType": "address" },
          { "name": "totalPool", "type": "uint256", "internalType": "uint256" },
          { "name": "resolved", "type": "bool", "internalType": "bool" },
          { "name": "outcome", "type": "bool", "internalType": "bool" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMarketDetails",
    "inputs": [{ "name": "_marketId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "cryptoPair", "type": "string", "internalType": "string" },
      { "name": "strikePrice", "type": "uint256", "internalType": "uint256" },
      { "name": "endTime", "type": "uint256", "internalType": "uint256" },
      { "name": "resolutionTime", "type": "uint256", "internalType": "uint256" },
      { "name": "yesSharesToken", "type": "address", "internalType": "address" },
      { "name": "noSharesToken", "type": "address", "internalType": "address" },
      { "name": "totalPool", "type": "uint256", "internalType": "uint256" },
      { "name": "resolved", "type": "bool", "internalType": "bool" },
      { "name": "outcome", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "marketCount",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "markets",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "id", "type": "uint256", "internalType": "uint256" },
      { "name": "cryptoPair", "type": "string", "internalType": "string" },
      { "name": "strikePrice", "type": "uint256", "internalType": "uint256" },
      { "name": "endTime", "type": "uint256", "internalType": "uint256" },
      { "name": "resolutionTime", "type": "uint256", "internalType": "uint256" },
      { "name": "diaOracleKey", "type": "string", "internalType": "string" },
      { "name": "yesSharesToken", "type": "address", "internalType": "address" },
      { "name": "noSharesToken", "type": "address", "internalType": "address" },
      { "name": "totalPool", "type": "uint256", "internalType": "uint256" },
      { "name": "resolved", "type": "bool", "internalType": "bool" },
      { "name": "outcome", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "resolveMarket",
    "inputs": [{ "name": "_marketId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  }
] as const;