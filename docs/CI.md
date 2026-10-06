# Continuous integration

Seven workflows validate distinct parts of DeltaVault. All run on push, pull_request and workflow_dispatch, with read-only repository permissions, bounded timeouts and cancellation of obsolete runs. TypeScript and production builds cover Node.js 22 and 24. Other checks use Node.js 24.

The production workflow uploads built Worker/browser assets for inspection. It does not deploy the site. Unit tests run without API keys using controlled responses and restore mocked globals after each test.

## Verify the first GitHub runs

1. Publish the prepared source to the chosen repository's main branch.
2. Open Actions and confirm all seven workflows executed for that exact commit.
3. Inspect every job, including both versions in the build/typecheck matrices.
4. If a job fails, fix the cause and rerun the affected checks. A local pass is not a GitHub run.
5. Add status badges only after the actual owner/repository and workflow paths are known.

Use the repository's Actions page to copy each workflow's official status badge. Do not substitute static green badges. Available files are `types.yml`, `markets.yml`, `risk.yml`, `wallets.yml`, `api.yml`, `integrity.yml` and `build.yml`.

## Local evidence

Tests can be run independently through the package scripts listed in [Getting started](GETTING_STARTED.md). Documentation/integrity checks validate local links, required brand assets, Whitepaper anchors and fail-propagating workflow rules. Test code bundles the project's TypeScript modules with the esbuild dependency supplied by Wrangler; the Worker environment is replaced with an explicit fixture only inside API tests.
