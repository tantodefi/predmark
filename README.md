# Prediction Markets on Lukso

This project implements a decentralized prediction market platform on the Lukso blockchain. Users can create markets based on crypto price predictions, and participants can buy YES or NO shares using LYX (Lukso's native token).

## ToDo

- test/deploy contracts
- fix dia price feed api on frontend or read from contract
- the create a market modal needs some revamping. the Market description field should be replaced with a radio select with the options 'higher' and 'lower' (the market description can be calculated and shown at the bottom with the submitted data (exp. "price pair < or > strike price") the select end time should be the only time selection field dispalyed and the resolution time should automatically happen some time / a few minutes after the market end time (make sure it works with the price updating frequency found/used elsewhere in the frontend/contracts)
- frontend should display the created markets (if any) below the price feeds (with relevant market data)
- only one market per price feed pair should be allowed to be created at any point of time
- the username and address of the UP that created the market should be saved in the contract and displayed on frontend next to market info

## Key Features

- Create prediction markets for crypto price outcomes
- Oracle integration with DIA for price feeds
- LSP7 tokens for YES/NO shares that are tradeable
- Reward distributions for correctly predicting outcomes
- Fully compatible with Lukso blockchain

## Technical Integrations

- **DIA Oracles**: Integrated with official DIA oracles on LUKSO mainnet
- **LSP7 Tokens**: Implemented a version of LSP7 tokens for YES/NO shares
- **LYX Payments**: All payments are made using LYX instead of ERC20 tokens
- **Market Creation Fee**: Added a 5 LYX fee for creating new markets
- **Redemption**: Automatic reward distribution after markets are resolved

## Supported Price Feeds

The project supports all available price feeds from the DIA + LUKSO integration:

- **Standard Feeds**:
  - ETH/USD
  - BTC/USD
  - DIA/USD
  - USDC/USD

- **Special Adapter Feeds**:
  - EUR/USD (via adapter: 0xbCfD839664B5Ad4D0C0C58db0c716D7a28dCd15E)
  - stETH/USD (via adapter: 0x2b94002cfFA638B37E4DDe54EDfcF6Efdcb29E6A)

The frontend includes a dropdown menu for selecting these price feeds when creating markets, and the contract is designed to work with all of them.

## Project Structure

- `/contracts/foundry/src`: Smart contracts
  - `Market.sol`: Main prediction market contract
  - `Token.sol`: LSP7 token implementation for shares
  - `DiaPriceConsumer.sol`: Oracle integration with DIA's price feeds

- `/frontend`: NextJS frontend application
  - `/constants`: Contract ABIs and addresses
  - `/components`: UI components including DIAPrice for real-time price feed display

## Getting Started

### Prerequisites

- Node.js and npm/yarn
- Foundry (for contract development and testing)
- Lukso wallet (Universal Profile)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/prediction-markets-lukso.git
cd prediction-markets-lukso
```

2. Install dependencies:
```bash
# For contracts
cd contracts/foundry
forge install

# For frontend
cd ../../frontend
yarn install
```

3. Deploy contracts:
```bash
cd contracts/foundry
forge script script/Deploy.s.sol --rpc-url <LUKSO_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast
```

4. Start the frontend:
```bash
cd frontend
yarn dev
```

## Contracts

### LuksoFutures Contract

The main contract handling markets, shares, and rewards.

- Create markets with specific price targets and timeframes
- Buy YES/NO shares using LYX
- Resolve markets using DIA oracle
- Claim rewards after markets are resolved

### PredictionMarketShares

LSP7-compatible token implementation for YES/NO shares.

## DIA Oracle Integration

This project uses DIA as the oracle provider for price feeds through their official LUKSO integration. The DIA oracle is located at `0x245ad685F4D89D30fD1a14682C030c6128d08d17` on LUKSO mainnet.

For more information about the LUKSO + DIA integration, see the [official announcement](https://www.diadata.org/blog/post/lukso-partners-with-dia-oracles-mainnet/).

## License

MIT 