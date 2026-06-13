# distro-cre

Chainlink CRE workflow that acts as the **operator** for `DistroEscrow`. On a
daily cron it pulls the aggregated payout batch from the Distro API and records
cumulative views on-chain so clippers accrue payouts.

## How it fits together

```
daily cron tick
  └─ workflow GETs the Distro API /cre/batch  (DON identical-consensus on the body)
       │     (the API refreshes YouTube views + sums views per clipper wallet,
       │      and persists one snapshot per UTC day so every DON node sees the same data)
       └─ for each job: builds (jobId, recipients[], cumulativeViews[])
            └─ runtime.report() ──► KeystoneForwarder ──► EscrowViewsReporter.onReport()
                                                              └─ DistroEscrow.recordViews()
```

The API owns YouTube fetching + per-wallet aggregation; the CRE owns the
trustless on-chain write. View counts are **cumulative per recipient**, matching
`DistroEscrow.recordViews`, which credits only the per-recipient delta. Each
job's `reporterAddress` (its on-chain operator) comes from the batch, so one cron
run can settle many campaigns.

CRE writes can't call an arbitrary function directly — they deliver a signed
report to the `KeystoneForwarder`, which ERC-165-checks the receiver then calls
`onReport`. The receiver is the thin `EscrowViewsReporter` adapter (`../contracts`),
set as each job's `operator`.

## Target network

Arc testnet (Circle), chainId **5042002**, CRE selector `arc-testnet`
(numeric `3034092155422581607`). KeystoneForwarder:

- Production DON: `0x76c9cf548b4179F8901cda1f8623568b58215E62`
- Simulation (`--broadcast`): `0x6E9EE680ef59ef64Aa8C7371279c27E496b5eDc1`

The reporter trusts both forwarders, so one reporter serves prod + sim.

## Deployed (Arc testnet)

| Contract | Address |
| --- | --- |
| DistroEscrow | `0x85ea0a0843169f5BcfEafD295790179964cd5320` |
| EscrowViewsReporter (multi-forwarder) | `0x716f3b0b885Cf0Edd1Be17E1DF62560acbCE212F` |

A campaign's `operatorAddress` (set on `createJob`) must be this reporter. It
trusts both the production forwarder `0x76c9…` (deployed DON) and the mock
forwarder `0x6E9E…` (`cre simulate --broadcast`), so the same campaigns work for
the live demo and the deployed DON.

## Config

`config.{staging,production}.json`:

| field | meaning |
| --- | --- |
| `schedule` | cron (default `0 0 0 * * *`, daily 00:00 UTC) |
| `apiBaseUrl` | Distro API base (staging → `http://localhost:3001`) |
| `chainSelector` | `3034092155422581607` (Arc) |
| `gasLimit` | per-write gas |

Secret `DISTRO_API_KEY` (→ env `DISTRO_API_KEY_VAR`) is the `x-cre-api-key` value;
it must match `CRE_API_KEY` in `../api/.env`.

## Setup

```bash
cd youtube-views && bun install && cd ..   # runs cre-setup (WASM tooling)
cp .env.example .env                        # set CRE_ETH_PRIVATE_KEY + DISTRO_API_KEY_VAR
```

Requires the CRE CLI (≥ v1.0.7) and TS SDK ≥ v1.3.1.

## Simulate

Run from this directory (has `project.yaml`). The cron fires once immediately.

```bash
# Needs the Distro API reachable at apiBaseUrl with a matching CRE_API_KEY.
cre workflow simulate youtube-views --target staging-settings --broadcast \
  --non-interactive --trigger-index 0 -e .env
```

**Verified end-to-end:** with a stubbed `/cre/batch` returning job 6, a
`--broadcast` run executed GET batch → identical-consensus → signed report →
mock forwarder → `EscrowViewsReporter.onReport` → `DistroEscrow.recordViews(6, …)`,
landing `recordedViews=10000`, `owed=0.02` native on-chain.

## Deploy (testnet)

```bash
cre secrets create youtube-views --target production-settings   # upload DISTRO_API_KEY to Vault DON
cre workflow deploy youtube-views --target production-settings
```

> Note: the workflow directory is still named `youtube-views` (historical); it no
> longer calls YouTube directly. Registry names are `distro-record-views-*`.
