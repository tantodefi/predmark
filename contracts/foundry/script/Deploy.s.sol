// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Market.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // DIA Oracle address on Lukso mainnet
        address diaOracleAddress = 0x245ad685F4D89D30fD1a14682C030c6128d08d17; // Official DIA Oracle on LUKSO mainnet
        
        // Deploy the main contract
        LuksoFutures market = new LuksoFutures(diaOracleAddress);
        
        console.log("LuksoFutures deployed at:", address(market));
        
        vm.stopBroadcast();
    }
} 