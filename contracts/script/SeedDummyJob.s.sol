// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import "forge-std/Script.sol";
import {DistroEscrow} from "../contracts/DistroEscrow.sol";

/**
 * @notice Seed a dummy native-funded job on a deployed DistroEscrow.
 *
 * On Arc the native gas token is USDC, so the budget is sent as msg.value.
 *
 * Required env vars:
 *   DEPLOYER_PRIVATE_KEY — brand wallet
 *   ESCROW_ADDRESS       — deployed DistroEscrow
 *   REPORTER_ADDRESS     — deployed EscrowViewsReporter (job operator)
 */
contract SeedDummyJob is Script {
    function run() external {
        uint256 key = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address escrowAddr = vm.envAddress("ESCROW_ADDRESS");
        address operator = vm.envAddress("REPORTER_ADDRESS");
        address brand = vm.addr(key);

        uint256 cpm = 0.002 ether; // native (USDC) per 1000 views
        uint256 budget = 0.1 ether; // native (USDC) budget

        vm.startBroadcast(key);
        uint256 jobId = DistroEscrow(escrowAddr).createJobNative{value: budget}(operator, cpm);
        vm.stopBroadcast();

        console2.log("=== Dummy Native Job Seeded ===");
        console2.log("Escrow         :", escrowAddr);
        console2.log("Brand          :", brand);
        console2.log("Operator       :", operator);
        console2.log("CPM (per 1k)   :", cpm);
        console2.log("Budget (native):", budget);
        console2.log("Job id         :", jobId);
    }
}
