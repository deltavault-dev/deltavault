# Contributing

Describe the user-visible problem and the intended behavior before proposing a change. Keep changes focused and preserve DeltaVault's existing style and functionality.

Run `pnpm typecheck`, `pnpm test`, `pnpm check:docs`, `pnpm check:integrity` and `pnpm build`. Add meaningful behavior coverage when changing market data, position calculations, wallet interaction or server responses. Do not weaken assertions or suppress CI failures to produce green runs.

Never commit secrets, wallet credentials, local environment files or generated build/runtime state. Changes involving a transaction integration must state contract addresses, network, approval behavior and validation evidence explicitly.

A project-wide license has not yet been selected. Contributors should coordinate rights and permission with the repository owner.
