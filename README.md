# Houdini monorepo test

Setting up:

- `pnpm i`
- `pnpm build`

Then, inside of the `packages/ui` folder, link the houdini projects on the `static-runtimes` branch:

- `pnpm link /path/to/houdini/packages/houdini`
- `pnpm link /path/to/houdini/packages/houdini-svelte`

The main sveltekit app lives in `apps/web`, which is using a ui library in `packages/ui`.

Run the app with `pnpm dev`, or the ui library sandbox with `pnpm sandbox`
