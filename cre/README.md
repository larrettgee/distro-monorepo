# distro-cre

Chainlink CRE workflow that acts as the **operator** for `DistroEscrow`. On a
schedule it reads cumulative YouTube view counts and records them onchain so
clippers accrue payouts.

## How it fits together

```
cron tick
  └─ workflow fetches viewCount per video (YouTube Data API v3, DON-median consensus)
       └─ builds (jobId, recipients[], cumulativeViews[])
            └─ runtime.report()  ──►  KeystoneForwarder  ──►  EscrowViewsReporter.onReport()
                                                                   └─ DistroEscrow.recordViews()
```

CRE onchain writes can't call an arbitrary function directly — they deliver a
signed report to the `KeystoneForwarder`, which calls `onReport` on a receiver.
So the receiver is the thin `EscrowViewsReporter` adapter (in `../contracts`),
and it is set as the job's `operator`. View counts are reported **cumulatively**,
matching `DistroEscrow.recordViews`, which credits only the per-recipient delta.

## Target network

Arc testnet (Circle), chainId **5042002**, CRE selector `arc-testnet`
(numeric `3034092155422581607`). Forwarder addresses:

- Production: `0x76c9cf548b4179F8901cda1f8623568b58215E62`
- Simulation (`--broadcast`): `0x6E9EE680ef59ef64Aa8C7371279c27E496b5eDc1`

## Deployed (Arc testnet)

| Contract | Address |
| --- | --- |
| DistroEscrow | `0x85ea0a0843169f5BcfEafD295790179964cd5320` |
| EscrowViewsReporter — production (forwarder `0x76c9…`) | `0x78203f4Dd20968808cFD05A094e9cCfF4E781089` |
| EscrowViewsReporter — staging/sim (forwarder `0x6E9E…`) | `0xCE430789Ddf7c55cd7b99E8B2D596e75c140a74d` |

`config.staging.json` → staging reporter, dummy `jobId 2` (used in the verified
`--broadcast` simulation). `config.production.json` → production reporter, dummy
`jobId 3`. Set real `videos` entries to record actual views.

**Forwarder note:** the reporter trusts exactly one KeystoneForwarder. The
production DON uses `0x76c9cf548b4179F8901cda1f8623568b58215E62`; `cre workflow
simulate --broadcast` delivers via the mock forwarder
`0x6E9EE680ef59ef64Aa8C7371279c27E496b5eDc1`. That's why there are two reporters.

## Verified end-to-end (simulation)

`cre workflow simulate youtube-views --target staging-settings --broadcast` ran
the full path: fetch YouTube views → DON median consensus → signed report →
mock forwarder → `EscrowViewsReporter.onReport` → `DistroEscrow.recordViews`,
emitting `ViewsRecorded` on-chain (payout correctly capped at the job budget).

## One-time wiring

1. Deploy the adapter (from `../contracts`):
   ```bash
   ESCROW_ADDRESS=0x85ea0a0843169f5BcfEafD295790179964cd5320 \
   FORWARDER_ADDRESS=0x76c9cf548b4179F8901cda1f8623568b58215E62 \
   forge script script/DeployEscrowViewsReporter.s.sol:DeployEscrowViewsReporter \
     --rpc-url $ARC_RPC_URL --broadcast
   ```
2. Create the escrow job with the adapter as operator (native/USDC budget on Arc):
   `DistroEscrow.createJobNative{value: budget}(reporterAddress, pricePerThousandViews)`.
3. Fill `youtube-views/config.*.json`:
   - `reporterAddress` → the deployed adapter
   - `jobId` → the id returned by `createJobNative`
   - `videos` → `{ videoId, recipient }` pairs (recipient = clipper wallet)

## Setup

```bash
cd youtube-views && bun install && cd ..   # runs cre-setup (WASM tooling)
cp .env.example .env                        # add CRE_ETH_PRIVATE_KEY + YOUTUBE_API_KEY_VAR
```

Requires the CRE CLI (≥ v1.0.7) and TS SDK ≥ v1.3.1. Install the CLI per
https://docs.chain.link/cre/getting-started/cli-installation.

## Simulate

Run from this directory (where `project.yaml` lives):

```bash
cre workflow simulate youtube-views --target staging-settings
```

The cron trigger fires once immediately. To also execute the onchain write
against the mock forwarder (needs a funded wallet + the simulation forwarder in
the adapter):

```bash
cre workflow simulate youtube-views --target staging-settings --broadcast
```

## Deploy (testnet)

```bash
cre secrets create youtube-views --target production-settings   # upload YOUTUBE_API_KEY to Vault DON
cre workflow deploy youtube-views --target production-settings
```
