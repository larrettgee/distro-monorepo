// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {IReceiver} from "./interfaces/IReceiver.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IDistroEscrow {
    function recordViews(uint256 id, address[] calldata recipients, uint256[] calldata views) external;
}

/**
 * @title EscrowViewsReporter
 * @notice CRE consumer that relays view reports into DistroEscrow.
 *
 * A Chainlink CRE workflow fetches cumulative video views, signs a report, and
 * submits it through a KeystoneForwarder. The forwarder calls `onReport` here;
 * this contract decodes the report and forwards it to `DistroEscrow.recordViews`.
 *
 * Multiple forwarders can be trusted, which lets one reporter serve both local
 * `cre simulate --broadcast` runs (mock forwarder) and the deployed DON
 * (production forwarder) without redeploying. On a real (mainnet) deployment,
 * trust only the production forwarder.
 *
 * Wiring: deploy this contract, then create the escrow job with this contract
 * as the `operator` (e.g. `createJobNative(reporter, pricePerThousandViews)`).
 * The escrow checks `msg.sender == job.operator`, so only reports relayed
 * through this contract — and only from a trusted forwarder — can record views.
 *
 * Report payload encoding — must match the workflow's `encodeAbiParameters`:
 *   abi.encode(uint256 jobId, address[] recipients, uint256[] cumulativeViews)
 */
contract EscrowViewsReporter is IReceiver, IERC165 {
    /// @notice Escrow this reporter feeds.
    IDistroEscrow public immutable escrow;

    /// @notice KeystoneForwarders authorized to deliver CRE reports.
    mapping(address => bool) public isForwarder;

    event ViewsReported(uint256 indexed jobId, uint256 recipientCount);

    error UnauthorizedForwarder(address caller);
    error InvalidAddress();
    error NoForwarders();

    constructor(address escrow_, address[] memory forwarders_) {
        if (escrow_ == address(0)) revert InvalidAddress();
        if (forwarders_.length == 0) revert NoForwarders();
        escrow = IDistroEscrow(escrow_);
        for (uint256 i = 0; i < forwarders_.length; i++) {
            if (forwarders_[i] == address(0)) revert InvalidAddress();
            isForwarder[forwarders_[i]] = true;
        }
    }

    /// @inheritdoc IReceiver
    function onReport(bytes calldata, bytes calldata report) external {
        if (!isForwarder[msg.sender]) revert UnauthorizedForwarder(msg.sender);

        (uint256 jobId, address[] memory recipients, uint256[] memory views) =
            abi.decode(report, (uint256, address[], uint256[]));

        escrow.recordViews(jobId, recipients, views);

        emit ViewsReported(jobId, recipients.length);
    }

    /// @notice ERC-165 — the KeystoneForwarder checks this before delivering a
    ///         report, so the receiver must advertise IReceiver + IERC165.
    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IReceiver).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}
