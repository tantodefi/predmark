// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PythPriceConsumer} from "../src/PythPriceConsumer.sol";




contract DeployerScript is Script {
    function setUp() public {}

   function run() public returns (PythPriceConsumer)  {
        vm.startBroadcast();
        // pyth deployment on morph - 0x2880aB155794e7179c9eE2e38200202908C17B43
        // eth/usd price feed id - 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
        PythPriceConsumer priceConsumer = new PythPriceConsumer(0x2880aB155794e7179c9eE2e38200202908C17B43, bytes32(0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace));
 
        vm.stopBroadcast();

         return priceConsumer;

    }
}

// To deploy, run
// source .env
// forge script script/Deployer.s.sol --rpc-url $RPC_URL --broadcast --legacy --private-key $PRIVATE_KEY