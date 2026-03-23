# CLAUDE.md

This file documents project conventions and guidelines for Claude Code. See also [AGENTS.md](./AGENTS.md) for shared repository guidelines.

## Project Overview

Apps Script + Vite starter template. Vite bundles the client into a single HTML file (via `vite-plugin-singlefile`) which is deployed to Google Apps Script as a web app using `clasp`.

## Directory Structure

```
src/
  index.html                    # Main UI
  style.css                     # Styles
  main.js                       # Client entry point
  lib/
    googleScriptRun.js          # google.script.run wrapper (mock + production)
    googleScriptRunMockData.js  # Mock data for local dev

apps-script/
  appsscript.json               # Apps Script manifest
  Code.js                       # Server-side functions (doGet, etc.)

scripts/
  lib/clasp-utils.js            # Shared deployment utilities
  deploy.js                     # Update/create production deployment
  deploy-new.js                 # Recreate production deployment from scratch
  open-prod.js                  # Open production URL in browser
  open-staging.js               # Open staging URL in browser
  setup-rootdir.js              # Ensure .clasp.json has rootDir: "dist"
  update-env.js                 # Sync deployment IDs to .env

dist/                           # Build output (clasp pushes this)
```

## Key Conventions

### Security

- Never use `innerHTML` with server-returned or user-supplied data. Use the `escapeHtml()` utility or set `textContent` directly.
- Mock data functions that return dynamic values (e.g., timestamps) must be functions, not plain values, so they stay in sync with server behaviour.

### Scripts

- All deployment scripts (`scripts/*.js`) must wrap top-level logic in an `async function main()` and call `main()` at the end. This makes future async changes safe and keeps the pattern consistent.
- The `.env` parser in `clasp-utils.js` must handle quoted values (e.g., `KEY="value"`).

### google.script.run wrapper

- `src/lib/googleScriptRun.js` exposes `googleScriptRun`, which works identically to `google.script.run` but adds Promise support and auto-switches to mocks locally.
- Mock data lives in `src/lib/googleScriptRunMockData.js`. Dynamic values (timestamps, random IDs) must be implemented as functions.

### Deployment

- Three environments: **dev** (Vite local), **staging** (`@HEAD` via `clasp push`), **prod** (versioned deployment).
- Only one production deployment is maintained. Use `npm run prod:new` to recreate it.
- Deployment IDs are cached in `.env` (git-ignored). Run `npm run update-env` after any structural deployment change.

## Commands Reference

See [AGENTS.md](./AGENTS.md) for the full command list.

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server with mock data |
| `npm run stg` | Build + push to @HEAD |
| `npm run prod` | Build + push + update versioned deployment |
| `npm run prod:new` | Recreate production deployment from scratch |
| `npm run update-env` | Sync deployment IDs to .env |
