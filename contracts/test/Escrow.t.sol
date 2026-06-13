// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {Test} from "forge-std/Test.sol";
import {Escrow} from "../contracts/Escrow.sol";
import {MockERC20} from "./utils/MockERC20.sol";

contract EscrowTest is Test {
    Escrow internal escrow;
    MockERC20 internal token;

    address internal payer = makeAddr("payer");
    address internal payee = makeAddr("payee");
    address internal arbiter = makeAddr("arbiter");
    address internal stranger = makeAddr("stranger");

    uint256 internal constant AMOUNT = 1_000e6; // USDC-style 6 decimals

    function setUp() public {
        escrow = new Escrow();
        token = new MockERC20("USD Coin", "USDC", 6);
        token.mint(payer, AMOUNT);

        vm.prank(payer);
        token.approve(address(escrow), type(uint256).max);
    }

    function _deposit() internal returns (uint256 id) {
        vm.prank(payer);
        id = escrow.deposit(payee, arbiter, address(token), AMOUNT);
    }

    // ── deposit ────────────────────────────────────────────────────────────────

    function test_Deposit_HoldsFundsAndRecordsAgreement() public {
        uint256 id = _deposit();

        assertEq(id, 0);
        assertEq(token.balanceOf(address(escrow)), AMOUNT);
        assertEq(token.balanceOf(payer), 0);

        Escrow.Agreement memory a = escrow.getAgreement(id);
        assertEq(a.payer, payer);
        assertEq(a.payee, payee);
        assertEq(a.arbiter, arbiter);
        assertEq(a.token, address(token));
        assertEq(a.amount, AMOUNT);
        assertEq(uint8(a.state), uint8(Escrow.State.Funded));
    }

    function test_Deposit_IncrementsId() public {
        token.mint(payer, AMOUNT);
        uint256 first = _deposit();
        uint256 second = _deposit();
        assertEq(first, 0);
        assertEq(second, 1);
        assertEq(escrow.nextId(), 2);
    }

    function test_Deposit_RevertsOnZeroAmount() public {
        vm.prank(payer);
        vm.expectRevert(Escrow.InvalidAmount.selector);
        escrow.deposit(payee, arbiter, address(token), 0);
    }

    function test_Deposit_RevertsOnZeroAddress() public {
        vm.prank(payer);
        vm.expectRevert(Escrow.InvalidAddress.selector);
        escrow.deposit(address(0), arbiter, address(token), AMOUNT);
    }

    // ── release ──────────────────────────────────────────────────────────────────

    function test_Release_ByArbiter_PaysPayee() public {
        uint256 id = _deposit();
        vm.prank(arbiter);
        escrow.release(id);

        assertEq(token.balanceOf(payee), AMOUNT);
        assertEq(token.balanceOf(address(escrow)), 0);
        assertEq(uint8(escrow.getAgreement(id).state), uint8(Escrow.State.Released));
    }

    function test_Release_ByPayer_PaysPayee() public {
        uint256 id = _deposit();
        vm.prank(payer);
        escrow.release(id);
        assertEq(token.balanceOf(payee), AMOUNT);
    }

    function test_Release_RevertsForStranger() public {
        uint256 id = _deposit();
        vm.prank(stranger);
        vm.expectRevert(Escrow.Unauthorized.selector);
        escrow.release(id);
    }

    function test_Release_RevertsIfNotFunded() public {
        uint256 id = _deposit();
        vm.prank(arbiter);
        escrow.release(id);

        vm.prank(arbiter);
        vm.expectRevert(Escrow.NotFunded.selector);
        escrow.release(id);
    }

    // ── refund ───────────────────────────────────────────────────────────────────

    function test_Refund_ByArbiter_ReturnsToPayer() public {
        uint256 id = _deposit();
        vm.prank(arbiter);
        escrow.refund(id);

        assertEq(token.balanceOf(payer), AMOUNT);
        assertEq(token.balanceOf(address(escrow)), 0);
        assertEq(uint8(escrow.getAgreement(id).state), uint8(Escrow.State.Refunded));
    }

    function test_Refund_ByPayee_ReturnsToPayer() public {
        uint256 id = _deposit();
        vm.prank(payee);
        escrow.refund(id);
        assertEq(token.balanceOf(payer), AMOUNT);
    }

    function test_Refund_RevertsForStranger() public {
        uint256 id = _deposit();
        vm.prank(stranger);
        vm.expectRevert(Escrow.Unauthorized.selector);
        escrow.refund(id);
    }

    // ── fuzz ─────────────────────────────────────────────────────────────────────

    function testFuzz_DepositReleaseRoundTrips(uint256 amount) public {
        amount = bound(amount, 1, 1e30);
        token.mint(payer, amount);

        vm.prank(payer);
        uint256 id = escrow.deposit(payee, arbiter, address(token), amount);

        uint256 payeeBefore = token.balanceOf(payee);
        vm.prank(arbiter);
        escrow.release(id);

        assertEq(token.balanceOf(payee) - payeeBefore, amount);
    }
}
