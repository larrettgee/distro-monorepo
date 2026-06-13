// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

/**
 * @notice Minimal interface a contract must implement to receive Chainlink CRE
 *         reports delivered by the KeystoneForwarder.
 * @dev    `report` is the ABI-encoded payload produced by `runtime.report()` in
 *         the workflow. `metadata` carries workflow/DON execution context.
 */
interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}
