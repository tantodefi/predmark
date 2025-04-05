// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Token.sol";
import "./DiaPriceConsumer.sol";

// Simple ReentrancyGuard implementation
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract LuksoFutures is ReentrancyGuard {
    struct Market {
        uint256 id;
        string cryptoPair;
        uint256 strikePrice;
        uint256 endTime;
        uint256 resolutionTime;
        string diaOracleKey;
        address yesSharesToken;
        address noSharesToken;
        uint256 totalPool;
        bool resolved;
        bool outcome;
    }

    DIAPriceConsumer public diaOracleConsumer;
    uint256 public marketCount;
    uint256 public constant MARKET_CREATION_FEE = 5 ether; // 5 LYX
    uint256 public constant FEE_PERCENTAGE = 1; // 1% fee

    mapping(uint256 => Market) public markets;

    event MarketCreated(uint256 indexed marketId, string cryptoPair, uint256 strikePrice, uint256 endTime, uint256 resolutionTime);
    event SharesBought(uint256 indexed marketId, address indexed buyer, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome, uint256 resolutionPrice);
    event RewardsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    constructor(address _diaOracle) {
        diaOracleConsumer = new DIAPriceConsumer(_diaOracle, "ETH/USD");
    }

    function createMarket(
        string memory _cryptoPair,
        uint256 _strikePrice,
        uint256 _endTime,
        uint256 _resolutionTime,
        string memory _diaOracleKey
    ) external payable {
        require(msg.value >= MARKET_CREATION_FEE, "Market creation fee required");
        require(_endTime > block.timestamp, "End time must be in the future");
        require(_resolutionTime > _endTime, "Resolution time must be after end time");
        require(_strikePrice > 0, "Strike price must be greater than 0");

        // Create LSP7 tokens for Yes and No shares
        PredictionMarketShares yesShares = new PredictionMarketShares(
            string.concat(_cryptoPair, " YES"),
            string.concat("YES-", _cryptoPair)
        );
        
        PredictionMarketShares noShares = new PredictionMarketShares(
            string.concat(_cryptoPair, " NO"),
            string.concat("NO-", _cryptoPair)
        );

        marketCount++;
        markets[marketCount] = Market({
            id: marketCount,
            cryptoPair: _cryptoPair,
            strikePrice: _strikePrice,
            endTime: _endTime,
            resolutionTime: _resolutionTime,
            diaOracleKey: _diaOracleKey,
            yesSharesToken: address(yesShares),
            noSharesToken: address(noShares),
            totalPool: 0,
            resolved: false,
            outcome: false
        });

        emit MarketCreated(marketCount, _cryptoPair, _strikePrice, _endTime, _resolutionTime);
    }

    function buyShares(uint256 _marketId, bool _isYes, uint256 _sharesAmount) external payable nonReentrant {
        Market storage market = markets[_marketId];
        require(block.timestamp < market.endTime, "Market has ended");
        require(!market.resolved, "Market already resolved");
        require(_sharesAmount > 0, "Amount must be greater than 0");
        require(msg.value >= _sharesAmount, "Send enough LYX to cover shares");

        uint256 fee = (_sharesAmount * FEE_PERCENTAGE) / 100;
        uint256 shareAmount = _sharesAmount - fee;

        market.totalPool += shareAmount;

        if (_isYes) {
            PredictionMarketShares(market.yesSharesToken).mint(msg.sender, shareAmount, true, "");
        } else {
            PredictionMarketShares(market.noSharesToken).mint(msg.sender, shareAmount, true, "");
        }

        // Return excess LYX
        if (msg.value > _sharesAmount) {
            payable(msg.sender).transfer(msg.value - _sharesAmount);
        }

        emit SharesBought(_marketId, msg.sender, _isYes, shareAmount);
    }

    function resolveMarket(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(block.timestamp >= market.resolutionTime, "Too early to resolve");
        require(!market.resolved, "Market already resolved");

        (uint128 price, uint128 timestamp) = getMarketPrice(market.diaOracleKey);
        require(timestamp > 0, "Invalid price data");

        // Convert price to match strikePrice format
        uint256 resolutionPrice = uint256(price);

        market.outcome = resolutionPrice >= market.strikePrice;
        market.resolved = true;

        emit MarketResolved(_marketId, market.outcome, resolutionPrice);
    }
    
    // Helper function to get price data from appropriate source
    function getMarketPrice(string memory _priceKey) internal returns (uint128, uint128) {
        // Check if we need to use a specific adapter
        address adapter = diaOracleConsumer.adapterAddresses(_priceKey);
        
        if (adapter != address(0)) {
            // Use the specific adapter for this price feed
            return diaOracleConsumer.getPriceFromAdapter(adapter, _priceKey);
        } else {
            // Use the default oracle with the price key
            DIAPriceConsumer tempConsumer;
            if (keccak256(bytes(_priceKey)) == keccak256(bytes("ETH/USD"))) {
                tempConsumer = diaOracleConsumer;
            } else {
                tempConsumer = new DIAPriceConsumer(address(diaOracleConsumer.diaOracle()), _priceKey);
            }
            return tempConsumer.getLatestPrice();
        }
    }

    function claimRewards(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved yet");

        uint256 winningShares;
        if (market.outcome) {
            winningShares = PredictionMarketShares(market.yesSharesToken).balanceOf(msg.sender);
            PredictionMarketShares(market.yesSharesToken).burn(msg.sender, winningShares, "");
        } else {
            winningShares = PredictionMarketShares(market.noSharesToken).balanceOf(msg.sender);
            PredictionMarketShares(market.noSharesToken).burn(msg.sender, winningShares, "");
        }

        require(winningShares > 0, "No winning shares to claim");

        // Calculate proportional reward from the total pool
        uint256 totalWinningShares;
        if (market.outcome) {
            totalWinningShares = PredictionMarketShares(market.yesSharesToken).totalSupply();
        } else {
            totalWinningShares = PredictionMarketShares(market.noSharesToken).totalSupply();
        }

        uint256 reward = (winningShares * market.totalPool) / totalWinningShares;
        
        // Transfer reward in LYX
        payable(msg.sender).transfer(reward);

        emit RewardsClaimed(_marketId, msg.sender, reward);
    }

    function getMarketDetails(uint256 _marketId) external view returns (
        string memory cryptoPair,
        uint256 strikePrice,
        uint256 endTime,
        uint256 resolutionTime,
        address yesSharesToken,
        address noSharesToken,
        uint256 totalPool,
        bool resolved,
        bool outcome
    ) {
        Market storage market = markets[_marketId];
        return (
            market.cryptoPair,
            market.strikePrice,
            market.endTime,
            market.resolutionTime,
            market.yesSharesToken,
            market.noSharesToken,
            market.totalPool,
            market.resolved,
            market.outcome
        );
    }

    function getAllMarkets() external view returns (Market[] memory) {
        Market[] memory allMarkets = new Market[](marketCount);
        for (uint256 i = 1; i <= marketCount; i++) {
            allMarkets[i - 1] = markets[i];
        }
        return allMarkets;
    }

    // To receive LYX
    receive() external payable {}
}