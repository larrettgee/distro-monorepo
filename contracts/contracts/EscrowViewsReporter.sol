// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {IReceiver} from "./interfaces/IReceiver.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IDistroEscrow {
    function recordViews(uint256 id, address[] calldata recipients, uint256[] calldata views) external;
}

/**
 * @title EscrowViewsReporter
 * @notice CRE consumer that relays YouTube view reports into DistroEscrow.
 *
 * A Chainlink CRE workflow fetches cumulative video views, signs a report, and
 * submits it through the KeystoneForwarder. The forwarder calls `onReport`
 * here; this contract decodes the report and forwards it to
 * `DistroEscrow.recordViews`.
 *
 * Wiring: deploy this contract, then have the brand create the escrow job with
 * this contract as the `operator`:
 *   DistroEscrow.createJob(reporterAddress, token, pricePerThousandViews, budget)
 * Because the escrow checks `msg.sender == job.operator`, only reports relayed
 * through this contract (and only from the trusted forwarder) can record views.
 *
 * Report payload encoding — must match the workflow's `encodeAbiParameters`:
 *   abi.encode(uint256 jobId, address[] recipients, uint256[] cumulativeViews)
 */
contract EscrowViewsReporter is IReceiver, IERC165 {
    /// @notice Escrow this reporter feeds.
    IDistroEscrow public immutable escrow;

    /// @notice KeystoneForwarder authorized to deliver CRE reports.
    address public immutable forwarder;

    event ViewsReported(uint256 indexed jobId, uint256 recipientCount);

    error UnauthorizedForwarder(address caller);

    constructor(address escrow_, address forwarder_) {
        escrow = IDistroEscrow(escrow_);
        forwarder = forwarder_;
    }

    /// @inheritdoc IReceiver
    function onReport(bytes calldata, bytes calldata report) external {
        if (msg.sender != forwarder) revert UnauthorizedForwarder(msg.sender);

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
