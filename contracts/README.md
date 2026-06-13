# distro-contracts

EVM smart contracts for Distro, built with [Foundry](https://book.getfoundry.sh/).

## DistroEscrow

Escrow for a clipping marketplace. One deployment holds many independent jobs.

- **Brand** funds a job and sets the CPM (payout per 1000 views), then can later
  `closeJob` to reclaim any unallocated budget. Two funding paths:
  - `createJob(operator, token, pricePerThousandViews, budget)` — ERC-20 budget.
  - `createJobNative(operator, pricePerThousandViews)` `payable` — native budget
    (`msg.value`). On Arc the native gas token is USDC, so this is the USDC path.
    Internally the job's `token` is `address(0)` (the `NATIVE` sentinel) and
    payouts are sent as native transfers.
- **Operator / oracle** calls `recordViews(id, recipients[], views[])` — `views`
  is each recipient's _cumulative_ total, so only the new views since the last
  report are credited (`deltaViews * pricePerThousandViews / 1000`), capped by the
  remaining budget.
- **Anyone** calls `claim(id, recipient)` — pays out the amount owed; funds always
  go to the recipient address. (Pull payments, so one bad recipient can't block a
  batch.)

## Deployments (Arc testnet, chainId 5042002)

| Contract | Address |
| --- | --- |
| DistroEscrow | [`0x85ea0a0843169f5BcfEafD295790179964cd5320`](https://testnet.arcscan.app/address/0x85ea0a0843169f5BcfEafD295790179964cd5320) |
| EscrowViewsReporter (multi-forwarder) | [`0x716f3b0b885Cf0Edd1Be17E1DF62560acbCE212F`](https://testnet.arcscan.app/address/0x716f3b0b885Cf0Edd1Be17E1DF62560acbCE212F) |

`EscrowViewsReporter` is the CRE operator adapter (set as a job's `operator`). It trusts a **set** of KeystoneForwarders, so one reporter serves both the deployed DON (production forwarder `0x76c9cf548b4179F8901cda1f8623568b58215E62`) and local `cre workflow simulate --broadcast` (mock forwarder `0x6E9EE680ef59ef64Aa8C7371279c27E496b5eDc1`). The forwarder ERC-165-checks the receiver before delivering, so the reporter implements `supportsInterface`. On mainnet, trust only the production forwarder.

> Earlier single-forwarder reporters (`0x78203f…` prod, `0xCE43…` sim) are superseded by the multi-forwarder one above.

## Setup

```bash
npm install        # OpenZeppelin contracts
forge build
forge test
```

## Deploy

Copy `.env.example` to `.env` and fill it in, then:

```bash
npm run deploy:escrow   # deploys DistroEscrow to Arc testnet
```
