// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {Test} from "forge-std/Test.sol";
import {DistroEscrow} from "../contracts/DistroEscrow.sol";
import {MockERC20} from "./utils/MockERC20.sol";

contract DistroEscrowTest is Test {
    DistroEscrow internal escrow;
    MockERC20 internal token;

    address internal brand = makeAddr("brand");
    address internal operator = makeAddr("operator");
    address internal clipperA = makeAddr("clipperA");
    address internal clipperB = makeAddr("clipperB");
    address internal stranger = makeAddr("stranger");

    uint256 internal constant BUDGET = 1_000e6; // USDC-style 6 decimals
    uint256 internal constant CPM = 2e6; // 2 USDC per 1000 views

    function setUp() public {
        escrow = new DistroEscrow();
        token = new MockERC20("USD Coin", "USDC", 6);
        token.mint(brand, BUDGET);

        vm.prank(brand);
        token.approve(address(escrow), type(uint256).max);
    }

    function _createJob() internal returns (uint256 id) {
        vm.prank(brand);
        id = escrow.createJob(operator, address(token), CPM, BUDGET);
    }

    function _record(uint256 id, address recipient, uint256 totalViews) internal {
        address[] memory recipients = new address[](1);
        uint256[] memory v = new uint256[](1);
        recipients[0] = recipient;
        v[0] = totalViews;
        vm.prank(operator);
        escrow.recordViews(id, recipients, v);
    }

    // ── createJob ────────────────────────────────────────────────────────────────

    function test_CreateJob_HoldsBudgetAndRecordsJob() public {
        uint256 id = _createJob();

        assertEq(id, 0);
        assertEq(token.balanceOf(address(escrow)), BUDGET);
        assertEq(token.balanceOf(brand), 0);

        DistroEscrow.Job memory job = escrow.getJob(id);
        assertEq(job.brand, brand);
        assertEq(job.operator, operator);
        assertEq(job.token, address(token));
        assertEq(job.pricePerThousandViews, CPM);
        assertEq(job.budget, BUDGET);
        assertEq(job.allocated, 0);
        assertEq(job.closed, false);
        assertEq(escrow.remaining(id), BUDGET);
    }

    function test_CreateJob_IncrementsId() public {
        token.mint(brand, BUDGET);
        uint256 first = _createJob();
        uint256 second = _createJob();
        assertEq(first, 0);
        assertEq(second, 1);
        assertEq(escrow.nextJobId(), 2);
    }

    function test_CreateJob_RevertsOnZeroBudget() public {
        vm.prank(brand);
        vm.expectRevert(DistroEscrow.InvalidAmount.selector);
        escrow.createJob(operator, address(token), CPM, 0);
    }

    function test_CreateJob_RevertsOnZeroCpm() public {
        vm.prank(brand);
        vm.expectRevert(DistroEscrow.InvalidAmount.selector);
        escrow.createJob(operator, address(token), 0, BUDGET);
    }

    function test_CreateJob_RevertsOnZeroOperator() public {
        vm.prank(brand);
        vm.expectRevert(DistroEscrow.InvalidAddress.selector);
        escrow.createJob(address(0), address(token), CPM, BUDGET);
    }

    // ── recordViews (cumulative) ─────────────────────────────────────────────────

    function test_RecordViews_CreditsByCpm() public {
        uint256 id = _createJob();
        _record(id, clipperA, 100_000); // 100k views * 2/1000 = 200 USDC

        uint256 expected = (100_000 * CPM) / escrow.VIEWS_PER_UNIT();
        assertEq(expected, 200e6);
        assertEq(escrow.owed(id, clipperA), 200e6);
        assertEq(escrow.recordedViews(id, clipperA), 100_000);
        assertEq(escrow.getJob(id).allocated, 200e6);
        assertEq(escrow.remaining(id), BUDGET - 200e6);
    }

    function test_RecordViews_OnlyCreditsDelta() public {
        uint256 id = _createJob();
        _record(id, clipperA, 50_000); // 100 USDC
        _record(id, clipperA, 120_000); // delta 70k -> +140 USDC

        assertEq(escrow.recordedViews(id, clipperA), 120_000);
        assertEq(escrow.owed(id, clipperA), 240e6); // 100 + 140
        assertEq(escrow.getJob(id).allocated, 240e6);
    }

    function test_RecordViews_IgnoresNonIncreasingReport() public {
        uint256 id = _createJob();
        _record(id, clipperA, 100_000); // 200 USDC
        _record(id, clipperA, 80_000); // lower than recorded -> ignored
        _record(id, clipperA, 100_000); // equal to recorded -> ignored

        assertEq(escrow.recordedViews(id, clipperA), 100_000);
        assertEq(escrow.owed(id, clipperA), 200e6);
    }

    function test_RecordViews_BatchCreditsEachRecipient() public {
        uint256 id = _createJob();

        address[] memory recipients = new address[](2);
        uint256[] memory v = new uint256[](2);
        recipients[0] = clipperA;
        recipients[1] = clipperB;
        v[0] = 50_000; // 100 USDC
        v[1] = 25_000; // 50 USDC

        vm.prank(operator);
        escrow.recordViews(id, recipients, v);

        assertEq(escrow.owed(id, clipperA), 100e6);
        assertEq(escrow.owed(id, clipperB), 50e6);
        assertEq(escrow.getJob(id).allocated, 150e6);
    }

    function test_RecordViews_CapsAtRemainingBudget() public {
        uint256 id = _createJob();
        // 10,000,000 views * 2/1000 = 20,000 USDC, far over the 1,000 budget.
        _record(id, clipperA, 10_000_000);

        assertEq(escrow.owed(id, clipperA), BUDGET);
        assertEq(escrow.remaining(id), 0);

        // Further views for a new recipient credit nothing once exhausted.
        _record(id, clipperB, 1_000_000);
        assertEq(escrow.owed(id, clipperB), 0);
    }

    function test_RecordViews_RevertsForNonOperator() public {
        uint256 id = _createJob();
        address[] memory recipients = new address[](1);
        uint256[] memory v = new uint256[](1);
        recipients[0] = clipperA;
        v[0] = 1;
        vm.prank(stranger);
        vm.expectRevert(DistroEscrow.NotOperator.selector);
        escrow.recordViews(id, recipients, v);
    }

    function test_RecordViews_RevertsOnLengthMismatch() public {
        uint256 id = _createJob();
        address[] memory recipients = new address[](2);
        uint256[] memory v = new uint256[](1);
        vm.prank(operator);
        vm.expectRevert(DistroEscrow.LengthMismatch.selector);
        escrow.recordViews(id, recipients, v);
    }

    // ── claim ────────────────────────────────────────────────────────────────────

    function test_Claim_PaysRecipient() public {
        uint256 id = _createJob();
        _record(id, clipperA, 100_000); // 200 USDC

        // Anyone can trigger the claim; funds always go to the recipient.
        vm.prank(stranger);
        escrow.claim(id, clipperA);

        assertEq(token.balanceOf(clipperA), 200e6);
        assertEq(escrow.owed(id, clipperA), 0);
    }

    function test_Claim_RevertsWhenNothingOwed() public {
        uint256 id = _createJob();
        vm.expectRevert(DistroEscrow.NothingOwed.selector);
        escrow.claim(id, clipperA);
    }

    function test_Claim_CannotDoubleClaim() public {
        uint256 id = _createJob();
        _record(id, clipperA, 100_000);
        escrow.claim(id, clipperA);

        vm.expectRevert(DistroEscrow.NothingOwed.selector);
        escrow.claim(id, clipperA);
    }

    function test_Claim_ThenMoreViewsAccrueAgain() public {
        uint256 id = _createJob();
        _record(id, clipperA, 50_000); // 100 USDC
        escrow.claim(id, clipperA);
        assertEq(token.balanceOf(clipperA), 100e6);

        _record(id, clipperA, 100_000); // delta 50k -> +100 USDC
        escrow.claim(id, clipperA);
        assertEq(token.balanceOf(clipperA), 200e6);
    }

    // ── closeJob ─────────────────────────────────────────────────────────────────

    function test_CloseJob_RefundsUnallocatedToBrand() public {
        uint256 id = _createJob();
        _record(id, clipperA, 100_000); // allocate 200 USDC

        vm.prank(brand);
        escrow.closeJob(id);

        assertEq(token.balanceOf(brand), BUDGET - 200e6); // 800 USDC back
        assertTrue(escrow.getJob(id).closed);
        assertEq(escrow.remaining(id), 0);
    }

    function test_CloseJob_LeavesAllocatedFundsClaimable() public {
        uint256 id = _createJob();
        _record(id, clipperA, 100_000); // 200 USDC

        vm.prank(brand);
        escrow.closeJob(id);

        // Recipient can still pull what was credited before close.
        escrow.claim(id, clipperA);
        assertEq(token.balanceOf(clipperA), 200e6);
    }

    function test_CloseJob_BlocksFurtherViews() public {
        uint256 id = _createJob();
        vm.prank(brand);
        escrow.closeJob(id);

        address[] memory recipients = new address[](1);
        uint256[] memory v = new uint256[](1);
        recipients[0] = clipperA;
        v[0] = 1;
        vm.prank(operator);
        vm.expectRevert(DistroEscrow.JobIsClosed.selector);
        escrow.recordViews(id, recipients, v);
    }

    function test_CloseJob_RevertsForNonBrand() public {
        uint256 id = _createJob();
        vm.prank(stranger);
        vm.expectRevert(DistroEscrow.NotBrand.selector);
        escrow.closeJob(id);
    }

    // ── fuzz ─────────────────────────────────────────────────────────────────────

    function testFuzz_RecordAndClaim(uint256 views) public {
        uint256 id = _createJob();
        views = bound(views, 0, 400_000); // stay under the budget cap

        _record(id, clipperA, views);
        uint256 expected = (views * CPM) / escrow.VIEWS_PER_UNIT();
        assertEq(escrow.owed(id, clipperA), expected);

        if (expected > 0) {
            escrow.claim(id, clipperA);
            assertEq(token.balanceOf(clipperA), expected);
        }
    }

    function testFuzz_NeverPaysMoreThanBudget(uint256 views) public {
        uint256 id = _createJob();
        views = bound(views, 0, type(uint128).max);

        _record(id, clipperA, views);
        assertLe(escrow.owed(id, clipperA), BUDGET);
        assertLe(escrow.getJob(id).allocated, BUDGET);
    }
}
