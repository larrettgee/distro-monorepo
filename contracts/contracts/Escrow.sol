// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Escrow
 * @notice Minimal ERC-20 escrow with an arbiter.
 *
 * A payer deposits ERC-20 tokens earmarked for a payee. The funds are held by
 * this contract until either:
 *   - release() — the payer or the arbiter sends the funds to the payee, or
 *   - refund()  — the payee or the arbiter returns the funds to the payer.
 *
 * Each deposit creates an independent, single-shot escrow identified by an
 * incrementing id, so one deployment can hold many escrows at once.
 */
contract Escrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ═══════════════════════════════════════════════════════════════════════════
    //  Types
    // ═══════════════════════════════════════════════════════════════════════════

    enum State {
        None, // 0: does not exist
        Funded, // 1: tokens held, awaiting resolution
        Released, // 2: tokens sent to payee
        Refunded // 3: tokens returned to payer
    }

    struct Agreement {
        address payer; // funds the escrow, receives a refund
        address payee; // receives the funds on release
        address arbiter; // may release or refund at any time
        address token; // ERC-20 being escrowed
        uint256 amount; // amount held (net of any transfer fees)
        State state;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  State
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice All escrows, keyed by id.
    mapping(uint256 => Agreement) public agreements;

    /// @notice Id assigned to the next created escrow.
    uint256 public nextId;

    // ═══════════════════════════════════════════════════════════════════════════
    //  Events
    // ═══════════════════════════════════════════════════════════════════════════

    event Deposited(
        uint256 indexed id,
        address indexed payer,
        address indexed payee,
        address arbiter,
        address token,
        uint256 amount
    );
    event Released(uint256 indexed id, address indexed payee, uint256 amount);
    event Refunded(uint256 indexed id, address indexed payer, uint256 amount);

    // ═══════════════════════════════════════════════════════════════════════════
    //  Errors
    // ═══════════════════════════════════════════════════════════════════════════

    error InvalidAddress();
    error InvalidAmount();
    error NotFunded();
    error Unauthorized();

    // ═══════════════════════════════════════════════════════════════════════════
    //  External Functions
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Deposit ERC-20 tokens into a new escrow.
     * @dev    Caller must have approved this contract for `amount` of `token`.
     *         The amount recorded is the balance actually received, so
     *         fee-on-transfer tokens are handled correctly.
     * @param payee   Address that receives the funds on release.
     * @param arbiter Address allowed to release or refund.
     * @param token   ERC-20 token to escrow.
     * @param amount  Amount to pull from the caller.
     * @return id     Identifier of the created escrow.
     */
    function deposit(address payee, address arbiter, address token, uint256 amount)
        external
        nonReentrant
        returns (uint256 id)
    {
        if (payee == address(0) || arbiter == address(0) || token == address(0)) {
            revert InvalidAddress();
        }
        if (amount == 0) revert InvalidAmount();

        uint256 preBalance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = IERC20(token).balanceOf(address(this)) - preBalance;
        if (received == 0) revert InvalidAmount();

        id = nextId++;
        agreements[id] = Agreement({
            payer: msg.sender,
            payee: payee,
            arbiter: arbiter,
            token: token,
            amount: received,
            state: State.Funded
        });

        emit Deposited(id, msg.sender, payee, arbiter, token, received);
    }

    /**
     * @notice Release escrowed funds to the payee.
     * @dev    Callable by the payer or the arbiter.
     * @param id Escrow identifier.
     */
    function release(uint256 id) external nonReentrant {
        Agreement storage a = agreements[id];
        if (a.state != State.Funded) revert NotFunded();
        if (msg.sender != a.payer && msg.sender != a.arbiter) revert Unauthorized();

        a.state = State.Released;
        uint256 amount = a.amount;
        IERC20(a.token).safeTransfer(a.payee, amount);

        emit Released(id, a.payee, amount);
    }

    /**
     * @notice Refund escrowed funds to the payer.
     * @dev    Callable by the payee or the arbiter.
     * @param id Escrow identifier.
     */
    function refund(uint256 id) external nonReentrant {
        Agreement storage a = agreements[id];
        if (a.state != State.Funded) revert NotFunded();
        if (msg.sender != a.payee && msg.sender != a.arbiter) revert Unauthorized();

        a.state = State.Refunded;
        uint256 amount = a.amount;
        IERC20(a.token).safeTransfer(a.payer, amount);

        emit Refunded(id, a.payer, amount);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Views
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice Returns the full agreement for `id`.
    function getAgreement(uint256 id) external view returns (Agreement memory) {
        return agreements[id];
    }
}
