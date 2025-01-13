// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@pythnetwork/IPyth.sol";
import "@pythnetwork/PythStructs.sol";

contract PythPriceConsumer {
    IPyth public pyth;
    bytes32 public priceId;

    constructor(address _pyth, bytes32 _priceId) {
        pyth = IPyth(_pyth);
        priceId = _priceId;
    }

    function getLatestPrice() public view returns (PythStructs.Price memory) {
        return pyth.getPrice(priceId);
    }

    function updatePrice(bytes[] calldata priceUpdateData) public payable {
        pyth.updatePriceFeeds{value: msg.value}(priceUpdateData);
    }
}