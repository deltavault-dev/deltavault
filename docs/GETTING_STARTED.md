# Getting started

## Requirements

Node.js 22.13 or newer (CI covers 22 and 24), pnpm 11.25.0 and a browser. The production target is a Cloudflare Worker via Vinext and Vite.

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:5173`. A clean clone selects the portable execution profile automatically. Do not copy `.sites-runtime/` from another machine.

## Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Local development with hot reload. |
| `pnpm typecheck` | Strict TypeScript checks without generated incremental state. |
| `pnpm test` | All 21 behavior tests. |
| `pnpm test:markets` | Prices, freshness, history and browser fallback. |
| `pnpm test:risk` | Exposure math, capacity guards and scroll-stage selection. |
| `pnpm test:wallets` | Server-rendered wallet row behavior. |
| `pnpm test:api` | Server caching, cooldown, validation and credential routing. |
| `pnpm check:docs` | Local Markdown references and assets. |
| `pnpm check:integrity` | Required product files and CI policy. |
| `pnpm build` | Build the Worker and browser assets. |
| `pnpm start` | Serve the built Worker locally; use the printed address. |

## Market data

The server requests only allowlisted CoinGecko paths. Quotes cover ETH, BTC and SOL; historical data covers the selected market over one day. Public service limits may temporarily prevent fresh reads. The interface distinguishes unavailable or stale data and does not substitute fabricated prices.

Optional server bindings are `COINGECKO_API_KEY` (CoinGecko Demo key) and `COINGECKO_PRO_API_KEY`. A Pro key selects the Pro API host. They must remain server-only and must not be committed. For local Wrangler bindings use an ignored `.dev.vars` file. Consult your host's environment configuration when deploying.

## Hosting

The website build uses the included Worker entrypoint and `dist/server/wrangler.json`. This GitHub export has an empty `.openai/hosting.json`, deliberately without the production project's ID. Register your own project before publishing a copy through Sites. This repository's Actions build artifacts do not deploy the existing public site.

## Troubleshooting

- Use the pinned pnpm version and `--frozen-lockfile`; do not silently replace dependencies to make CI pass.
- Missing prices may reflect upstream availability or rate limits; inspect the response and timestamp.
- A wallet extension must expose a compatible provider to connect. Absent wallet rows link to their official sites.
- CI tests use deterministic fixtures, so a live CoinGecko outage should not fail them.
