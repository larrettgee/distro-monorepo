# distro-contracts

EVM smart contracts for Distro, built with [Foundry](https://book.getfoundry.sh/).

## DistroEscrow

Escrow for a clipping marketplace. One deployment holds many independent jobs.

- **Brand** calls `createJob(operator, token, pricePerThousandViews, budget)` —
  deposits an ERC-20 budget and sets the CPM (payout per 1000 views). Can later
  `closeJob` to reclaim any unallocated budget.
- **Operator / oracle** calls `recordViews(id, recipients[], views[])` — `views`
  is each recipient's _cumulative_ total, so only the new views since the last
  report are credited (`deltaViews * pricePerThousandViews / 1000`), capped by the
  remaining budget.
- **Anyone** calls `claim(id, recipient)` — pays out the amount owed; funds always
  go to the recipient address. (Pull payments, so one bad recipient can't block a
  batch.)

## Deployments

| Network      | Address                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| Arc testnet  | [`0xdaabE932B36bbabd9017Cc9e03E8633C42Fe7a12`](https://testnet.arcscan.app/address/0xdaabE932B36bbabd9017Cc9e03E8633C42Fe7a12) |

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
