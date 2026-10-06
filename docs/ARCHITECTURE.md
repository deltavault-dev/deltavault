# Architecture

DeltaVault combines a React interface, server data routes and pure financial calculations. Vinext/Vite builds the application into browser assets and a Cloudflare Worker.

## Data path

The market route requests three allowlisted assets from CoinGecko. The history route accepts only ETH, BTC or SOL and maps that identifier to an approved CoinGecko asset. Server responses include source and fetch time. Successful normalized responses are held in memory for 120 seconds and may use the edge cache; downstream headers allow 30 seconds of browser caching and 120 seconds of shared caching. Upstream failures trigger a 60-second cooldown and a 503 response with no-store caching.

The browser first tries the local data route, then the public CoinGecko API. A quote is stale after five minutes or when its timestamp is over one minute in the future. Malformed and nonpositive values are rejected. History samples are filtered, deduplicated, sorted and capped at 600 points.

## Position model

| Quantity | Rule |
| --- | --- |
| Notional | Collateral × leverage. |
| Gross PnL | Notional × price move percentage × direction sign. |
| Equity | Collateral + PnL. |
| Maintenance | 25% of initial collateral in this workspace model. |
| Capacity | Max(0, liquidity × (80 − utilization) / 100). |

Position validation rejects missing/stale prices, invalid collateral, unsupported leverage and exposure beyond available capacity. These rules are interface calculations and must not be described as deployed contract enforcement.

## Wallet boundary

EIP-6963 announcements and legacy injected providers are discovered in the browser. A selected provider receives `eth_requestAccounts`; account and disconnect events are bound to that selected provider. There is no transaction signing or token approval pipeline. Announced icon data is rendered through image elements; absent wallets link to their official download pages.

## Motion and reading

Landing sections use finite entry animations and CSS transitions with a global motion toggle and OS reduced-motion support. The mechanics stage is selected from all step positions at a 42% viewport marker, coalescing scroll reads with requestAnimationFrame. The Whitepaper is an HTML reader sourced from `lib/whitepaper.json`, with 26 linked sections.

## Implementation boundaries

- CoinGecko quotes/history are real upstream data; vault liquidity and utilization are configured assumptions.
- Current source does not include a deployed contract, onchain order routing, deposits, withdrawals or settlement.
- Transaction attempts open a coming-soon dialog and do not move funds.
- The protocol described in the Whitepaper is broader than the implemented interface.
- Tests cover math, data behavior, API resilience and wallet rendering. They do not claim an audit, funded transaction validation or device animation smoothness.
- Browser/API metadata remains visible to relevant service providers. Wallet discovery is not proof of wallet authenticity.
