// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// DIA Oracle interface for LUKSO integration
interface IDIAOracleV2 {
    function getValue(string memory key) external view returns (uint128, uint128);
}

contract DIAPriceConsumer {
    IDIAOracleV2 public diaOracle;
    string public priceKey;
    
    // Mapping to store specific adapters for different price feeds if needed
    mapping(string => address) public adapterAddresses;

    constructor(address _diaOracle, string memory _priceKey) {
        diaOracle = IDIAOracleV2(_diaOracle);
        priceKey = _priceKey;
        
        // Initialize with known adapter addresses from the LUKSO integration
        adapterAddresses["EUR/USD"] = 0xbCfD839664B5Ad4D0C0C58db0c716D7a28dCd15E;
        adapterAddresses["stETH/USD"] = 0x2b94002cfFA638B37E4DDe54EDfcF6Efdcb29E6A;
    }

    function getLatestPrice() public view returns (uint128, uint128) {
        return diaOracle.getValue(priceKey);
    }
    
    // Function to get price using a specific adapter if needed
    function getPriceFromAdapter(address adapter, string memory key) public view returns (uint128, uint128) {
        return IDIAOracleV2(adapter).getValue(key);
    }
}