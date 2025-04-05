// Contract addresses for Lukso mainnet and testnet
export const CONTRACTS = {
  // Replace with actual deployed contract address after deployment
  LUKSO_TESTNET: {
    MARKET_CONTRACT: "0x0000000000000000000000000000000000000000",
    DIA_ORACLE: "0xA42217338614B7e67D022C52D1CD38e02D619bb0" // DIA Oracle address on testnet from docs
  },
  LUKSO_MAINNET: {
    MARKET_CONTRACT: "0x0000000000000000000000000000000000000000",
    DIA_ORACLE: "0x245ad685F4D89D30fD1a14682C030c6128d08d17" // Official DIA Oracle on LUKSO mainnet
  }
};

// Lukso network configuration
export const LUKSO_NETWORKS = {
  TESTNET: {
    chainId: '0x33',
    chainName: 'Lukso Testnet',
    nativeCurrency: {
      name: 'LYX',
      symbol: 'LYX',
      decimals: 18
    },
    rpcUrls: ['https://rpc.testnet.lukso.sigmacore.io'],
    blockExplorerUrls: ['https://explorer.testnet.lukso.network']
  },
  MAINNET: {
    chainId: '0x2B',
    chainName: 'Lukso Mainnet',
    nativeCurrency: {
      name: 'LYX',
      symbol: 'LYX',
      decimals: 18
    },
    rpcUrls: ['https://rpc.lukso.sigmacore.io'],
    blockExplorerUrls: ['https://explorer.lukso.network']
  }
};

// DIA Oracle asset keys and adapter addresses
export const DIA_PRICE_FEEDS = {
  ETH_USD: "ETH/USD",
  BTC_USD: "BTC/USD",
  DIA_USD: "DIA/USD",
  USDC_USD: "USDC/USD",
  EUR_USD: "EUR/USD",
  STETH_USD: "stETH/USD"
};

// Specific adapter addresses for certain price feeds
export const DIA_ADAPTERS = {
  EUR_USD: "0xbCfD839664B5Ad4D0C0C58db0c716D7a28dCd15E",
  STETH_USD: "0x2b94002cfFA638B37E4DDe54EDfcF6Efdcb29E6A"
}; 