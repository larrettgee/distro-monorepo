// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DistroEscrow
 * @notice Escrow for a clipping marketplace.
 *
 * A brand creates a job, funding it with an ERC-20 budget and setting a
 * price per thousand views (CPM). Clippers go and earn views; a trusted
 * operator/oracle reports those views on-chain. Reported view counts are
 * cumulative per recipient — each report credits only the new views since
 * the last report with `deltaViews * pricePerThousandViews / 1000`, drawing
 * down the job budget. Recipients (or anyone, on their behalf) then pull the
 * funds owed to them.
 *
 * Flow:
 *   1. createJob() — brand deposits the budget and sets the CPM.
 *   2. recordViews() — operator reports cumulative views; deltas are credited.
 *   3. claim() — anyone triggers payout of the amount owed to a recipient.
 *   4. closeJob() — brand reclaims any unallocated budget.
 *
 * Payouts use a pull pattern: recording views only updates balances, so a
 * single failing recipient can never block a batch, and claims are isolated.
 */
contract DistroEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ═══════════════════════════════════════════════════════════════════════════
    //  Types
    // ═══════════════════════════════════════════════════════════════════════════

    struct Job {
        address brand; // creator; funds the budget and can close the job
        address operator; // oracle allowed to record views
        address token; // ERC-20 used for the budget and payouts
        uint256 pricePerThousandViews; // CPM, in token units (per 1000 views)
        uint256 budget; // total tokens funded
        uint256 allocated; // total tokens credited to recipients
        bool closed; // once closed, no further views can be recorded
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  State
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice Divisor turning a view count into a budget draw (CPM basis).
    uint256 public constant VIEWS_PER_UNIT = 1000;

    /// @notice All jobs, keyed by id.
    mapping(uint256 => Job) public jobs;

    /// @notice Tokens claimable per recipient, keyed by job id then recipient.
    mapping(uint256 => mapping(address => uint256)) public owed;

    /// @notice Cumulative views recorded per recipient, keyed by job id then recipient.
    mapping(uint256 => mapping(address => uint256)) public recordedViews;

    /// @notice Id assigned to the next created job.
    uint256 public nextJobId;

    // ═══════════════════════════════════════════════════════════════════════════
    //  Events
    // ═══════════════════════════════════════════════════════════════════════════

    event JobCreated(
        uint256 indexed id,
        address indexed brand,
        address indexed operator,
        address token,
        uint256 pricePerThousandViews,
        uint256 budget
    );
    event ViewsRecorded(
        uint256 indexed id,
        address indexed recipient,
        uint256 totalViews,
        uint256 credited
    );
    event Claimed(
        uint256 indexed id,
        address indexed recipient,
        uint256 amount
    );
    event JobClosed(uint256 indexed id, uint256 refunded);

    // ═══════════════════════════════════════════════════════════════════════════
    //  Errors
    // ═══════════════════════════════════════════════════════════════════════════

    error InvalidAddress();
    error InvalidAmount();
    error UnknownJob();
    error JobIsClosed();
    error NotBrand();
    error NotOperator();
    error LengthMismatch();
    error NothingOwed();

    // ═══════════════════════════════════════════════════════════════════════════
    //  Views
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice Returns the full job for `id`.
    function getJob(uint256 id) external view returns (Job memory) {
        return jobs[id];
    }

    /// @notice Unallocated budget still available to credit on job `id`.
    function remaining(uint256 id) external view returns (uint256) {
        Job storage job = jobs[id];
        return job.budget - job.allocated;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  External Functions
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Create a job and fund its budget.
     * @dev    Caller (the brand) must have approved this contract for `budget`
     *         of `token`. The budget recorded is the balance actually received,
     *         so fee-on-transfer tokens are accounted for correctly.
     * @param operator               Address allowed to record views.
     * @param token                  ERC-20 used for budget and payouts.
     * @param pricePerThousandViews  Payout per 1000 views, in token units.
     * @param budget                 Tokens to pull from the caller.
     * @return id                    Identifier of the created job.
     */
    function createJob(
        address operator,
        address token,
        uint256 pricePerThousandViews,
        uint256 budget
    ) external nonReentrant returns (uint256 id) {
        if (operator == address(0) || token == address(0))
            revert InvalidAddress();
        if (pricePerThousandViews == 0 || budget == 0) revert InvalidAmount();

        uint256 preBalance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransferFrom(msg.sender, address(this), budget);
        uint256 received = IERC20(token).balanceOf(address(this)) - preBalance;
        if (received == 0) revert InvalidAmount();

        id = nextJobId++;
        jobs[id] = Job({
            brand: msg.sender,
            operator: operator,
            token: token,
            pricePerThousandViews: pricePerThousandViews,
            budget: received,
            allocated: 0,
            closed: false
        });

        emit JobCreated(
            id,
            msg.sender,
            operator,
            token,
            pricePerThousandViews,
            received
        );
    }

    /**
     * @notice Report cumulative views for one or more recipients and credit the
     *         payout for any new views since the last report.
     * @dev    Only the operator can record. `views[i]` is the recipient's
     *         lifetime view total for this job; the credit is
     *         `(views[i] - alreadyRecorded) * pricePerThousandViews / VIEWS_PER_UNIT`,
     *         capped by the job's remaining (unallocated) budget. A report at or
     *         below the recorded total credits nothing and is ignored.
     * @param id         Job identifier.
     * @param recipients Recipient addresses (e.g. clipper wallets).
     * @param views      Cumulative view counts, parallel to `recipients`.
     */
    function recordViews(
        uint256 id,
        address[] calldata recipients,
        uint256[] calldata views
    ) external {
        Job storage job = jobs[id];
        if (job.brand == address(0)) revert UnknownJob();
        if (job.closed) revert JobIsClosed();
        if (msg.sender != job.operator) revert NotOperator();
        if (recipients.length != views.length) revert LengthMismatch();
        if (recipients.length == 0) revert InvalidAmount();

        uint256 cpm = job.pricePerThousandViews;
        uint256 allocated = job.allocated;
        uint256 budget = job.budget;

        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            if (recipient == address(0)) revert InvalidAddress();

            uint256 total = views[i];
            uint256 prev = recordedViews[id][recipient];
            // Cumulative: ignore reports that don't advance the recipient's total.
            if (total <= prev) {
                emit ViewsRecorded(id, recipient, total, 0);
                continue;
            }
            recordedViews[id][recipient] = total;

            uint256 left = budget - allocated;
            if (left == 0) {
                emit ViewsRecorded(id, recipient, total, 0);
                continue;
            }

            uint256 credit = ((total - prev) * cpm) / VIEWS_PER_UNIT;
            if (credit > left) credit = left;

            allocated += credit;
            owed[id][recipient] += credit;

            emit ViewsRecorded(id, recipient, total, credit);
        }

        job.allocated = allocated;
    }

    /**
     * @notice Claim the tokens owed to a recipient for a job.
     * @dev    Permissionless — anyone may trigger the payout, which always
     *         goes to the recipient address itself.
     * @param id        Job identifier.
     * @param recipient Recipient whose balance is being claimed.
     */
    function claim(uint256 id, address recipient) external nonReentrant {
        uint256 amount = owed[id][recipient];
        if (amount == 0) revert NothingOwed();

        owed[id][recipient] = 0;
        IERC20(jobs[id].token).safeTransfer(recipient, amount);

        emit Claimed(id, recipient, amount);
    }

    /**
     * @notice Close a job and refund any unallocated budget to the brand.
     * @dev    Only the brand can close. Already-credited balances remain
     *         claimable; recording further views is disabled.
     * @param id Job identifier.
     */
    function closeJob(uint256 id) external nonReentrant {
        Job storage job = jobs[id];
        if (job.brand == address(0)) revert UnknownJob();
        if (job.closed) revert JobIsClosed();
        if (msg.sender != job.brand) revert NotBrand();

        job.closed = true;
        uint256 refund = job.budget - job.allocated;
        if (refund > 0) {
            job.budget = job.allocated;
            IERC20(job.token).safeTransfer(job.brand, refund);
        }

        emit JobClosed(id, refund);
    }
}
