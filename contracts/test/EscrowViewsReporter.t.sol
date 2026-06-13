// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {Test} from "forge-std/Test.sol";
import {DistroEscrow} from "../contracts/DistroEscrow.sol";
import {EscrowViewsReporter} from "../contracts/EscrowViewsReporter.sol";
import {MockERC20} from "./utils/MockERC20.sol";

contract EscrowViewsReporterTest is Test {
    DistroEscrow internal escrow;
    EscrowViewsReporter internal reporter;
    MockERC20 internal token;

    address internal brand = makeAddr("brand");
    address internal forwarder = makeAddr("forwarder"); // primary (e.g. prod) forwarder
    address internal forwarder2 = makeAddr("forwarder2"); // secondary (e.g. sim) forwarder
    address internal clipperA = makeAddr("clipperA");
    address internal clipperB = makeAddr("clipperB");

    uint256 internal constant BUDGET = 1_000e6; // USDC-style 6 decimals
    uint256 internal constant CPM = 2e6; // 2 USDC per 1000 views
    uint256 internal jobId;

    function setUp() public {
        escrow = new DistroEscrow();
        token = new MockERC20("USD Coin", "USDC", 6);
        address[] memory forwarders = new address[](2);
        forwarders[0] = forwarder;
        forwarders[1] = forwarder2;
        reporter = new EscrowViewsReporter(address(escrow), forwarders);

        token.mint(brand, BUDGET);
        vm.startPrank(brand);
        token.approve(address(escrow), type(uint256).max);
        // The reporter contract is the job operator.
        jobId = escrow.createJob(address(reporter), address(token), CPM, BUDGET);
        vm.stopPrank();
    }

    function _onReport(address[] memory recipients, uint256[] memory views) internal {
        vm.prank(forwarder);
        reporter.onReport("", abi.encode(jobId, recipients, views));
    }

    function test_OnReport_RecordsViewsIntoEscrow() public {
        address[] memory recipients = new address[](2);
        uint256[] memory views = new uint256[](2);
        recipients[0] = clipperA;
        recipients[1] = clipperB;
        views[0] = 100_000; // 200 USDC
        views[1] = 50_000; // 100 USDC

        _onReport(recipients, views);

        assertEq(escrow.owed(jobId, clipperA), 200e6);
        assertEq(escrow.owed(jobId, clipperB), 100e6);
        assertEq(escrow.recordedViews(jobId, clipperA), 100_000);
    }

    function test_OnReport_CumulativeAcrossReports() public {
        address[] memory recipients = new address[](1);
        uint256[] memory views = new uint256[](1);
        recipients[0] = clipperA;

        views[0] = 50_000; // 100 USDC
        _onReport(recipients, views);

        views[0] = 120_000; // cumulative; delta 70k -> +140 USDC
        _onReport(recipients, views);

        assertEq(escrow.owed(jobId, clipperA), 240e6);
        assertEq(escrow.recordedViews(jobId, clipperA), 120_000);
    }

    function test_OnReport_AcceptsEitherForwarder() public {
        assertTrue(reporter.isForwarder(forwarder));
        assertTrue(reporter.isForwarder(forwarder2));

        address[] memory recipients = new address[](1);
        uint256[] memory views = new uint256[](1);
        recipients[0] = clipperA;
        views[0] = 100_000;

        // Delivered via the secondary (e.g. sim) forwarder — also accepted.
        vm.prank(forwarder2);
        reporter.onReport("", abi.encode(jobId, recipients, views));

        assertEq(escrow.owed(jobId, clipperA), 200e6);
    }

    function test_SupportsInterface() public view {
        // ERC-165 self id and the IReceiver id must be advertised (the
        // KeystoneForwarder checks this before delivering a report).
        assertTrue(reporter.supportsInterface(0x01ffc9a7)); // type(IERC165).interfaceId
        assertTrue(reporter.supportsInterface(EscrowViewsReporter.onReport.selector));
        assertFalse(reporter.supportsInterface(0xdeadbeef));
    }

    function test_OnReport_RevertsForNonForwarder() public {
        address[] memory recipients = new address[](1);
        uint256[] memory views = new uint256[](1);
        recipients[0] = clipperA;
        views[0] = 1;

        vm.expectRevert(abi.encodeWithSelector(EscrowViewsReporter.UnauthorizedForwarder.selector, address(this)));
        reporter.onReport("", abi.encode(jobId, recipients, views));
    }
}
