// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import "forge-std/Script.sol";
import {EscrowViewsReporter} from "../contracts/EscrowViewsReporter.sol";

/**
 * @notice Deploy EscrowViewsReporter (the CRE operator adapter) to Arc testnet.
 *
 * Required env vars:
 *   DEPLOYER_PRIVATE_KEY — deploying wallet
 *   ESCROW_ADDRESS       — deployed DistroEscrow
 * Optional:
 *   FORWARDER_ADDRESSES  — comma-separated KeystoneForwarders to trust. Defaults
 *                          to both Arc forwarders so one reporter serves local
 *                          `cre simulate --broadcast` AND the deployed DON:
 *       production : 0x76c9cf548b4179F8901cda1f8623568b58215E62
 *       simulation : 0x6E9EE680ef59ef64Aa8C7371279c27E496b5eDc1
 *
 * After deploy, create the job with this contract as the operator:
 *   DistroEscrow.createJobNative(reporter, pricePerThousandViews)
 *
 * Deploy:
 *   forge script script/DeployEscrowViewsReporter.s.sol:DeployEscrowViewsReporter \
 *     --rpc-url $ARC_RPC_URL --broadcast
 */
contract DeployEscrowViewsReporter is Script {
    uint256 constant ARC_TESTNET_CHAIN_ID = 5042002;
    address constant ARC_PROD_FORWARDER = 0x76c9cf548b4179F8901cda1f8623568b58215E62;
    address constant ARC_SIM_FORWARDER = 0x6E9EE680ef59ef64Aa8C7371279c27E496b5eDc1;

    function run() external {
        require(
            block.chainid == ARC_TESTNET_CHAIN_ID,
            "DeployEscrowViewsReporter: wrong network, expected Arc testnet (5042002)"
        );

        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address escrow = vm.envAddress("ESCROW_ADDRESS");

        address[] memory def = new address[](2);
        def[0] = ARC_PROD_FORWARDER;
        def[1] = ARC_SIM_FORWARDER;
        address[] memory forwarders = vm.envOr("FORWARDER_ADDRESSES", ",", def);

        console2.log("=== EscrowViewsReporter Deploy ===");
        console2.log("Escrow     :", escrow);
        for (uint256 i = 0; i < forwarders.length; i++) {
            console2.log("Forwarder  :", forwarders[i]);
        }
        console2.log("---");

        vm.startBroadcast(deployerKey);
        EscrowViewsReporter reporter = new EscrowViewsReporter(escrow, forwarders);
        vm.stopBroadcast();

        console2.log("EscrowViewsReporter deployed at:", address(reporter));
        console2.log("Set this address as the job operator (ESCROW_OPERATOR_ADDRESS).");
    }
}
