// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import "forge-std/Script.sol";
import {EscrowViewsReporter} from "../contracts/EscrowViewsReporter.sol";

/**
 * @notice Deploy EscrowViewsReporter (the CRE operator adapter) to Arc testnet.
 *
 * Required env vars:
 *   DEPLOYER_PRIVATE_KEY — deploying wallet
 *   ESCROW_ADDRESS       — deployed DistroEscrow (e.g. 0xdaabE932B36bbabd9017Cc9e03E8633C42Fe7a12)
 *   FORWARDER_ADDRESS    — CRE KeystoneForwarder for the target environment:
 *       Arc testnet production : 0x76c9cf548b4179F8901cda1f8623568b58215E62
 *       Arc testnet simulation : 0x6E9EE680ef59ef64Aa8C7371279c27E496b5eDc1
 *
 * After deploy, the brand creates the job with this contract as the operator:
 *   DistroEscrow.createJob(reporter, token, pricePerThousandViews, budget)
 *
 * Deploy:
 *   forge script script/DeployEscrowViewsReporter.s.sol:DeployEscrowViewsReporter \
 *     --rpc-url $ARC_RPC_URL --broadcast
 */
contract DeployEscrowViewsReporter is Script {
    uint256 constant ARC_TESTNET_CHAIN_ID = 5042002;

    function run() external {
        require(
            block.chainid == ARC_TESTNET_CHAIN_ID,
            "DeployEscrowViewsReporter: wrong network, expected Arc testnet (5042002)"
        );

        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address escrow = vm.envAddress("ESCROW_ADDRESS");
        address forwarder = vm.envAddress("FORWARDER_ADDRESS");

        console2.log("=== EscrowViewsReporter Deploy ===");
        console2.log("Escrow    :", escrow);
        console2.log("Forwarder :", forwarder);
        console2.log("---");

        vm.startBroadcast(deployerKey);
        EscrowViewsReporter reporter = new EscrowViewsReporter(escrow, forwarder);
        vm.stopBroadcast();

        console2.log("EscrowViewsReporter deployed at:", address(reporter));
        console2.log("Set this address as the job operator when calling createJob.");
    }
}
