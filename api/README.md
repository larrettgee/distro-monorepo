# distro-api

The Distro backend — the off-chain brain for the [onchain clipping marketplace](../README.md).
It owns accounts, campaigns, clip submissions, and the leaderboard, and it produces the
daily payout batch the [CRE operator](../cre) records on-chain.

## Stack

- **NestJS 10** · **MongoDB** (Mongoose)
- **Privy** (`@privy-io/server-auth`) verifies the caller's access token → wallet identity
- **World ID** server-side proof verification (one-person-one-account)
- **YouTube Data API** for channel-ownership checks and view counts
- **viem** reads `DistroEscrow` on **Arc testnet** (budget / allocated / owed / remaining)

## Modules

| Module | Responsibility |
| --- | --- |
| `auth` | Privy token guard, role + verification guards |
| `accounts` | Register as brand/clipper, username, World ID verification, account overview |
| `campaigns` | Create (draft) → confirm on-chain → browse; performance + payout progress |
| `clippers` | Connect & verify YouTube channels (bio-code), manage multiple socials |
| `submissions` | Submit clips, validate they belong to a connected channel |
| `leaderboard` | Aggregate views / estimated earnings per clipper |
| `youtube` | YouTube Data API client (channels, videos) |
| `worldid` | Signed `rp_context` issuance + proof verification |
| `blockchain` | viem escrow reads |
| `cre` | `/cre/batch` — the daily per-wallet view batch the CRE workflow consumes |

## Develop

```bash
yarn install
cp .env.example .env      # fill in the values below
yarn start:dev           # http://localhost:3001  ·  Swagger UI at /docs
```

Requires a reachable **MongoDB** (`MONGODB_URI`).

## Environment

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port (default `3001`) |
| `MONGODB_URI` | MongoDB connection string |
| `PRIVY_APP_ID`, `PRIVY_APP_SECRET` | Verify Privy access tokens |
| `WORLD_ID_*` | App id, action, signing key, verifier base URL, TTLs |
| `YOUTUBE_API_KEY` | YouTube Data API key |
| `ARC_RPC_URL`, `CHAIN_ID` | Arc RPC + chain id (`5042002`) |
| `ESCROW_ADDRESS`, `ESCROW_OPERATOR_ADDRESS` | `DistroEscrow` + the CRE reporter operator |
| `USDC_ADDRESS`, `USDC_DECIMALS` | Settlement token metadata |
| `CRE_API_KEY` | Shared secret guarding `/cre/batch` (must match the CRE workflow's `DISTRO_API_KEY`) |

See [`.env.example`](.env.example) for the full list and defaults.

## Scripts

| Command | Description |
| --- | --- |
| `yarn start:dev` | Watch-mode dev server |
| `yarn build` | Compile to `dist/` |
| `yarn start` | Run the compiled server |
| `yarn test` | Jest unit tests |
| `yarn lint` | ESLint (autofix) |
