# distro-app

The Distro web app — the marketplace UI for the [onchain clipping marketplace](../README.md).
Brands browse and fund campaigns; clippers connect socials, submit clips, and claim payouts.

## Stack

- **Next.js 16** (App Router) · **React 19** · **Tailwind v4**
- **Privy** for auth + embedded wallets, **wagmi/viem** for on-chain calls (fund a campaign, claim payouts) on **Arc testnet**
- **@tanstack/react-query** for server state, **@worldcoin/idkit** for World ID verification
- **Cloudflare Stream** for source-content upload, playback, and thumbnails

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

The app talks to the NestJS API through a same-origin proxy: requests to
`/api/backend/*` are rewritten to the backend (`API_URL`, default
`http://localhost:3001`) in [`next.config.ts`](next.config.ts), so **the API must be
running** (see [`../api`](../api)).

## Environment

Public (browser-exposed) vars in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy app id for auth + embedded wallets |
| `NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN` | Optional — customer subdomain for direct MP4 downloads |
| `API_URL` | Backend origin for the `/api/backend/*` rewrite (default `http://localhost:3001`) |

Server-only Cloudflare Stream credentials (`CLOUDFLARE_ACCOUNT_ID`,
`CLOUDFLARE_STREAM_API_TOKEN`) power the upload/download API routes under
`app/api/stream` and `app/api/uploads`.

## Layout

```
app/            App Router routes (/, /trending, /leaderboard, /account,
                /socials, /dashboard, /campaign/[id]) + stream/upload API routes
components/     UI — marketplace, campaign, clipper, account, brand, create flow
lib/            api client + hooks, wagmi/chain config, escrow ABI, stream helpers
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
