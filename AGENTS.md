# Repository Guidelines

## Project Structure & Module Organization
- `src/server` houses the Apps Script entry points. Expose functions through `src/server/index.ts` and keep helper utilities in `src/server/lib/`.
- `src/client` contains the Vite bundle; `src/client/main.ts` bootstraps the UI and imports shared modules.
- `src/shared` collects logic reused on both sides (e.g., validation or constants) to avoid duplicated code.
- `appsscript.json` tracks deployment settings; edit only the human-readable fields such as `timeZone` or `exceptionLogging`.
- `public/` stores static assets copied verbatim into the final deployment bundle.

## Build, Test, and Development Commands
- `npm install` initializes dependencies and prepares clasp for Apps Script sync.
- `npm run dev` starts the Vite dev server and type-checks server code in watch mode.
- `npm run build` emits production bundles to `dist/` and compiled `.gs` files to `build/`.
- `npm run push` builds and pushes the compiled bundle to the bound Apps Script project via clasp.
- `npm run test` executes Vitest in CI mode; pair with `npm run lint` before opening a PR.

## Coding Style & Naming Conventions
- TypeScript is linted by ESLint and formatted by Prettier (2-space indent, single quotes, trailing commas). Use `npm run lint -- --fix` to auto-correct.
- Export Google-exposed functions in PascalCase to map cleanly onto Apps Script menus; keep internal helpers camelCase.
- Name React/Svelte/Vue components in PascalCase and place them inside `src/client/components/`.
- Keep environment variables in `.env.local`, prefixed with `VITE_` (e.g., `VITE_API_BASE_URL=https://...`).

## Testing Guidelines
- Co-locate unit tests as `*.test.ts` beside the source or within `tests/` when shared fixtures are needed.
- Run `npm run test -- --coverage` and target ≥80% statements; document gaps in the PR if coverage dips.
- Use the stubs in `tests/mocks/appsScript.ts` when code touches Apps Script globals like `SpreadsheetApp`.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`) to keep the changelog script-friendly.
- PRs must summarize behaviour changes, reference related issues, and list manual verification steps (e.g., `npm run push` to staging).
- Attach screenshots or GIFs for UI updates and include the clasp deployment ID when relevant.

## Deployment & Access
- Store the target Apps Script `scriptId` in `.clasp.json`; never commit alternate IDs for personal sandboxes.
- Use `npm run deploy` for production rollouts; it runs `build`, pushes via clasp, and logs the deployment URL.
- Rotate OAuth credentials in `appsscript.json` through Google Cloud and document the change in the PR description.
