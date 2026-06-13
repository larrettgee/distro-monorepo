// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import "forge-std/Script.sol";
import {DistroEscrow} from "../contracts/DistroEscrow.sol";

/**
 * @notice Deploy the clipping-marketplace DistroEscrow contract to Arc testnet.
 *
 * The DistroEscrow takes no constructor arguments — brands create individual
 * jobs (each with its own budget, token, operator and CPM) after deployment.
 *
 * Required env vars:
 *   DEPLOYER_PRIVATE_KEY — private key of the deploying wallet
 *   ARC_RPC_URL          — Arc testnet RPC (https://rpc.testnet.arc.network)
 *
 * Deploy:
 *   npm run deploy:escrow
 *
 * Or directly:
 *   forge script script/DeployDistroEscrow.s.sol:DeployDistroEscrow \
 *     --rpc-url $ARC_RPC_URL --broadcast
 */
contract DeployDistroEscrow is Script {
    uint256 constant ARC_TESTNET_CHAIN_ID = 5042002;

    function run() external {
        require(
            block.chainid == ARC_TESTNET_CHAIN_ID, "DeployDistroEscrow: wrong network, expected Arc testnet (5042002)"
        );

        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console2.log("=== DistroEscrow Deploy ===");
        console2.log("Chain ID :", block.chainid);
        console2.log("Deployer :", deployer);
        console2.log("---");

        vm.startBroadcast(deployerKey);
        DistroEscrow escrow = new DistroEscrow();
        vm.stopBroadcast();

        console2.log("DistroEscrow deployed at:", address(escrow));
        _writeDeployment(address(escrow), deployer);
    }

    function _writeDeployment(address escrow, address deployer) internal {
        string memory obj = "deployment";
        vm.serializeString(obj, "contract", "DistroEscrow");
        vm.serializeUint(obj, "chainId", block.chainid);
        vm.serializeAddress(obj, "deployer", deployer);
        string memory json = vm.serializeAddress(obj, "escrow", escrow);

        string memory path = string.concat("./deployments/distro-escrow-arc-", vm.toString(block.timestamp), ".json");
        vm.writeJson(json, path);
        console2.log("Deployment written to", path);
    }
}
