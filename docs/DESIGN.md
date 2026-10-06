# Redesign of apps-script-vite-starter

- **Status:** the design was agreed in discussion with the owner on 2026-10-05. Implementation has **not** started.
- **Purpose of this document:** it is self-contained. A person or an AI agent should be able to continue the work from here without the original conversation.
- **Evidence:** the facts below come from a research pass. It covered Google's served client JS, official docs, the clasp 3.4.1 source, and hands-on experiments with Vite 8.3.2, TypeScript 7.0.2 and Node 24.20. Nothing was deployed to Apps Script yet.

Confidence labels used throughout:

| Label | Meaning |
|---|---|
| **V** | Verified locally: we ran it. |
| **D** | Documented: official docs, Google's served JS, or library source code. |
| **I** | Inferred. |
| **U** | Unverified on a real Apps Script deployment; must be checked live (see §10). |

---

## 0. Handoff summary

**Decided with the owner**

1. **New purpose (§1).** The starter exists so that people and AI agents can build internal Google Workspace web apps that they can verify before deploying and that are safe by default.
2. **No mocks of server logic.** Locally, the **real server code** runs in Node. Only Google services (SpreadsheetApp, Session, …) are replaced, by tiny, strict in-memory fakes holding seed data. Local development never touches real spreadsheet data.
3. **Three environments: local, staging and production.** Staging and production are **separate Apps Script projects**, each bound to its own spreadsheet, with the same code. Stakeholders test on the staging `/exec` URL. Production may only receive a commit that has already been deployed to staging.
4. **Command names follow well-known conventions (§6).** The commands are `dev`, `build`, `test`, `push`, `deploy` and `deploy:prod`.
5. **Design doc in English.**

**Pending owner decisions (§11):** whether to include a dev mode that runs against real staging data; where to do the work; permission for a live smoke test on the owner's Google account; README/AGENTS.md language; per-environment `access`.

**Next steps:** see §12. The first step is a live smoke test (§10), which is a release blocker, then implementation in the order given.

---

## 1. Purpose (redefined)

> A minimal Apps Script starter for people in Google Workspace organizations who, together with AI coding agents (Claude Code, Codex, Gemini CLI, …), turn small spreadsheet-driven business processes (requests and approvals, ledgers, lending, …) into web apps that are safe to use inside the organization.
> It closes the Apps Script traps of the form "works locally, breaks in production", and the "dangerous publishing" traps. It does so with build checks, types and tests rather than prose. A single command, `npm test`, verifies everything without a Google account.

### Why this should exist now

- **The bottleneck is verification, not writing code.** Agents write the code. But an agent cannot call `google.script.run`. When a mock diverges from the server, the agent reports "done" while production is broken. This repo has two real examples:
  - Upstream PR #4 fixed a Date-marshalling bug that the mock data could never reveal.
  - The local TypeScript rewrite's stub already skips the trim and empty-title validation that its server performs.
- **Apps Script is the approved runtime in many organizations.** Since 2026-06 it is a Workspace core service. Within the IT approval boundary, it is the only place that gives you all of these with zero infra and zero billing:
  - Google-account sign-in
  - domain-only access
  - direct Sheets/Drive/Gmail access
- **The toolchain has new traps.** clasp 3 no longer transpiles TypeScript. Vite 8 (Rolldown/Oxc) and TypeScript 7 change defaults and output in ways that silently break Apps Script (§3).
- **Nothing else fills the gap.** No existing project combines all four of the following (survey: google/aside, enuchi/React-Google-Apps-Script + gas-client, mcpher/gas-fakes, gas-webpack-plugin, rollup-plugin-gas, @gas-plugin/unplugin, clasp's MCP):
  - focus on web apps (HtmlService + `google.script.run`)
  - a light install
  - local checks an agent can run with no Google account
  - safe deploy and access defaults

### Target users

Non-specialist builders in Workspace organizations who direct coding agents, often Japanese enterprises: a one-person IT team, or a business-unit improvement lead. The secondary reader is the IT approver, who should only need to read `appsscript.json` and `src/server/api.ts`.

**Not for:** public SaaS, Workspace add-ons, or teams with heavy CI/CD.

---

## 2. What is wrong with the two existing versions

There are two versions:

- **Upstream:** this repo, plain JS.
- **Local TypeScript rewrite:** not on GitHub. It uses Vite 5 + TS 5.9 + a clasp devDependency, a `src/shared/api.ts` contract, an in-browser stub swapped in via an `@backend` alias, and a server IIFE exposed via `Object.assign(globalThis, …)`.

| Problem | Where | Conf. |
|---|---|---|
| `google.script.run` only sees **top-level function declarations**. Functions assigned to `globalThis` inside an IIFE are not listed, so every client call is `undefined`. The page embeds a server-built `functionNames` list, and the client creates methods only for those names. `doGet` still works. | local rewrite | D (Google's served client JS + a live web app's HTML), U |
| `ANYONE_ANONYMOUS` + `USER_DEPLOYING`: anyone on the internet can call every server function with the owner's privileges. | upstream | D |
| Staging vs production is chosen by `ScriptApp.getService().getUrl().endsWith('/dev')`. This is unreliable: there are 4 open issues (170799249, 184467246, 193095356, 235862472). | upstream | D |
| After one callback-style call, later `await googleScriptRun.x()` calls are routed to the old callback, then crash. The same pattern exists in the production wrapper. | upstream | V |
| The mock or stub reimplements server logic and has already drifted. | both | V |
| `npm run deploy` without `-i` mints a new `/exec` URL every time. | local rewrite | D |
| clasp as a devDependency makes `node_modules` 324 MB (googleapis alone is 209 MB). | local rewrite | V |
| There are 7 deploy scripts, a `.env` deployment-ID cache, and a pre-build step that rewrites `.clasp.json`. `prod:new` deletes every versioned deployment. | upstream | D |
| The stub, the `@backend` alias, 5 tsconfigs and 2 Vite configs are accidental complexity. | local rewrite | D |

**Worth keeping:**

- From upstream: the tiny single-file build idea and the Date fix, generalized.
- From the local rewrite: a single typed contract, latency and failure injection in dev, `LockService` for read-modify-write, `MYSELF` access, no explicit `oauthScopes`.

---

## 3. Facts the design depends on

### Apps Script runtime

1. **Exposure.** Every top-level function whose name does not end in `_` is callable by anyone who can open the web app, with arbitrary arguments. All the names are visible in the page HTML. **D**
2. **Arguments.** The client validates arguments before sending them:
   - A `Date`, `Map`, `Set`, class instance, `Blob` or typed array throws `Failed due to illegal value in property: <key>`.
   - Circular structures throw `Failed due to circular reference.`
   - Keys ending in `__` are **silently dropped**.
   - The rest goes through JSON, so `NaN` becomes `null` and `undefined` is dropped. **D**
3. **Return values.**
   - A `Date` anywhere in the value makes the success handler receive a falsy value. **No error is raised.**
   - `Map` and `Set` become `{}`.
   - `undefined` becomes `null`.
   - A server `throw new Error(m)` reaches the failure handler as an Error with the server's `name` and `message`; the exact message prefix is U.
   - The client parses a JSON string from the server (`r = t && JSON.parse(t)`). **D**
4. **Language support.** The save-time parser is older than the V8 runtime. It rejects class fields (static and `#private`), numeric separators and BigInt literals. Built-ins are modern (e.g. `Map.groupBy`). There is no `setTimeout`, `URL`, `TextEncoder` or `fetch`. **Use target `es2019`**, which Vite 8 lowers correctly (V), and fail the build on a BigInt literal, which only produces the warning `TOLERATED_TRANSFORM` (V). **D**
5. **Fresh state per execution.** Each execution starts with fresh global state, so module-level variables do not persist between calls. **D/U**
6. **HtmlService.**
   - Inline `<script type="module">` works; google/aside ships this way. **D**
   - The user HTML is document-written into a `*.googleusercontent.com` iframe with `cache-control: no-store`, so it is re-downloaded on every load.
   - `location.search` and `location.hash` are **not** the top URL. Use `google.script.url.getLocation`.
   - Links need `target="_top"`.
   - No CSP was observed. **D**
7. **The `//` bug.** HtmlService has been reported (2020 to Jan 2026) to treat `//` inside template literals in inline scripts as a comment start. Vite 8's Oxc minifier turns ordinary strings into template literals (V), so use **`minify: false`** on the client. Whether the bug still exists is U.
8. **Identity.** `Session.getActiveUser().getEmail()` is blank under `USER_DEPLOYING` unless the user is in the same Workspace domain. `ANYONE_ANONYMOUS` only works with `USER_DEPLOYING`. Under `USER_DEPLOYING`, all users share the deployer's quota of 30 simultaneous executions. **D**
9. **Performance and limits.** Latency is about 0.4–1.5 s per call (up to 3 s on `/dev`). Callbacks time out after 390 s, and at most 10 calls run concurrently per page. Each script is limited to **200 versions**. **D**
10. **Bound scripts.** It is contested whether `SpreadsheetApp.getActiveSpreadsheet()` works in a container-bound script deployed as a web app. The official bound-scripts guide says `getActive*` "aren't available" in web apps; community reports say it works. **U, critical** (§10)

### clasp 3.4.1 (read from source)

11. **`push` without `-f`.** When `appsscript.json` differs from the remote copy, it asks for confirmation only on a TTY. **Without a TTY it silently skips the whole push and exits 0.** Always use `push -f`. **D**
12. **Deployments.** `create-deployment -i <id>` and `update-deployment <id>` both create a new version (unless `-V` is given) and repoint the deployment. `create-deployment` **without `-i` creates a new `/exec` URL**. **D**
13. **`--json list-deployments`** prints `[{deploymentId, versionNumber?, description}]`. `versionNumber` is missing for HEAD. **D**
14. **`create-script --rootDir dist`** writes `.clasp.json` with `{scriptId, rootDir:'dist', scriptExtensions, htmlExtensions, jsonExtensions, filePushOrder, skipSubdirectories}`, possibly plus `parentId` (U), and pulls the remote default files into `dist/`. `--type webapp` still creates a plain standalone script. `-P/--project <file>` selects a project file. **D**
15. **clasp via npx.** `npx -y @google/clasp@3.4.1` takes about 23 s on a cold cache and 2.4 s warm; an installed clasp takes 1.7 s. The MCP server (`clasp mcp`) has push, pull, create, clone and list, but **no deploy**. **V/D**

### Toolchain (all V unless noted)

16. **Vite 8.3.2 needs these settings:**
    - Inline the client with `generateBundle: { order: 'post' }`. Otherwise a raw `__VITE_PRELOAD__` is left behind and throws on `import()`.
    - An environment with `consumer: 'server'` externalizes npm deps. Set `resolve: { noExternal: true, conditions: ['default'] }`.
    - `lib.fileName` is ignored for server consumers. Use `rolldownOptions.output.entryFileNames: 'code.js'`.
    - If `renderChunk` returns invalid JS, **an empty code.js is written with no error**. Generate stubs with `rolldownOptions.output.footer` instead.
    - With `builder: {}`, a single `vite build` builds every environment.
    - The dev runner is `server.environments.<env>.runner.import()`, guarded by `isRunnableDevEnvironment`. `ssrLoadModule` is flagged for future removal.
    - `runner.clearCache()` before each call (about 1 ms) gives fresh module state per call, like GAS. State kept on `globalThis` survives.
17. **Oxc output.** Oxc already escapes `</script` in literals; keep a safety net. In JS escape as `\x3C`; in CSS use `<\/style`, because `\x3C` corrupts CSS. `es2019` lowers `?.` and `??`; `es2020` keeps them. Nothing is polyfilled.
18. **TypeScript 7.0.2 (native binary).**
    - Defaults changed: `strict` is true, `types` is `[]` (so list `google-apps-script` explicitly), and `noUncheckedSideEffectImports` is on (add `vite/client` for CSS imports).
    - `baseUrl` was removed, and there is no JS API.
    - Project references (`composite` + `emitDeclarationOnly` into `node_modules/.tmp`, run with `tsc -b`) let the client use `typeof import('../server/api.ts')` while server and client keep separate globals. This runs in about 0.4 s.
    - `@types/google-apps-script` 2.0.13 works.
19. **Node 24.20** runs `node --test` on `*.test.ts` and `node tools/x.ts` natively, with no warnings. Imports need explicit `.ts` extensions. Mirror Node's limits with `erasableSyntaxOnly`, `verbatimModuleSyntax` and `allowImportingTsExtensions`.
20. **Install size.** vite + typescript + `@types/google-apps-script` + `@types/node` take about 69 MB and about 20 packages. TS7's binary is 27 MB of that. `vite-plugin-singlefile` is unnecessary: it adds 7 packages and leaves the modulepreload polyfill behind.
21. **npm drops flags.** `npm run deploy --prod` drops `--prod` **silently**; the script receives `[]`. This is why environment selection uses script names, not flags.

---

## 4. Principles

1. **One implementation.** Locally, the real server source runs; only Google services are faked. Fakes are tiny and **strict**. Anything not emulated throws `<Service>.<member> is not emulated locally (tools/gas-fakes.ts). Add it, or verify on /dev after npm run push`.
2. **Local is stricter than GAS, never looser.**
3. **Invariants live in the build, types and tests.** AGENTS.md is a short map, not a rulebook.
4. **Every export of `src/server/api.ts` is a public endpoint** that runs with the owner's privileges. Nothing else is callable.
5. **Safe defaults.**
   - `USER_DEPLOYING` + `MYSELF`.
   - `push` never changes what stakeholders or users see.
   - `deploy` never changes a URL.
   - Production only receives what staging received.
   - Nothing deletes.
6. **Light.**
   - 4 devDependencies and no runtime dependencies.
   - No third-party Vite plugins; one `vite.config.ts`.
   - clasp via a pinned npx.
   - Unminified, readable output.
7. **Conventional commands, one per intent.**

---

## 5. Environments

| Environment | Who uses it | Code | Data | How it is updated |
|---|---|---|---|---|
| Local | developer, AI agents | working tree | in-memory fake spreadsheet with seed rows (sheet-shaped 2-D arrays) | `npm run dev`, `npm test` |
| Staging `/dev` (HEAD) | developer only (script editors) | last push | staging spreadsheet | `npm run push` |
| Staging `/exec` | stakeholders (testing) | a deployed commit | staging spreadsheet | `npm run deploy` |
| Production `/exec` | users | **only a commit already deployed to staging** | production spreadsheet | `npm run deploy:prod` |

### Two separate projects, each bound to its own spreadsheet

`.clasp.json` holds staging (the default target) and `.clasp.prod.json` holds production. Each script reads only its own container spreadsheet (with `@OnlyCurrentDoc`), so staging code physically cannot touch production data. There is no URL sniffing and no environment switch in the code.

Why not other options:

- **Two deployments in one project:** the code cannot reliably tell which deployment it is running under (§3.5 / getUrl bugs).
- **Build-time flags:** they produce different artifacts for staging and production, and the staging version could still reach production data.

### Rules

- **Only staging is reachable by default.** A bare `clasp push`, for example from an agent or clasp's MCP, can only reach staging.
- **Production can come later.** You can start with staging only. `deploy:prod` explains how to create `.clasp.prod.json` if it is missing.
- **Why `/dev` stays.** Stakeholders cannot use `/dev`: it is editor-only, and for a bound script, script editor = spreadsheet editor. But it is the fast loop for the developer, because `push` creates no version (200-version limit).
- **`.clasp.json` and `.clasp.prod.json` are committed** in real projects. They are not secrets, and teammates and agents must push to the same scripts. The template itself ships without them and does not gitignore them. It gitignores `.clasprc.json` defensively.
- **Fallback** if `getActiveSpreadsheet()` does not work in a bound web app (§3.10):
  - `book()` becomes `SpreadsheetApp.openById(__SPREADSHEET_ID__)`.
  - The ID is injected at build time from the selected `.clasp*.json` `parentId`, so the deploy script builds per target.
  - Drop `@OnlyCurrentDoc` and accept the `spreadsheets` scope.
  - The ID never comes from user input.

---

## 6. Commands

| Command | Meaning | Convention it follows |
|---|---|---|
| `npm run dev` | Start locally: the UI with HMR, plus the server code run in Node on fakes | Vite standard |
| `npm test` | Type-check + build + tests. This is the **definition of done** for humans and agents. About 1–2 s, no Google account. | npm standard; the first command agents try |
| `npm run build` | Produce `dist/{index.html, code.js, appsscript.json}` | Vite standard |
| `npm run push` | Run `npm test`, then push to staging HEAD (`/dev`) | same meaning as `clasp push` |
| `npm run deploy` | Publish to staging `/exec` for stakeholders | same meaning as `clasp deploy` |
| `npm run deploy:prod` | Publish to production `/exec`. Allowed only for a commit already deployed to staging. | Vercel/Netlify `--prod`, google/aside `deploy:prod`; avoids the npm flag-dropping trap (§3.21) |

Vite's `preview` is omitted because it has no meaning for GAS. First-time setup uses clasp's own commands (documented in the README), not invented names. For example:

```
npx -y @google/clasp@3.4.1 login
npx -y @google/clasp@3.4.1 create-script --type sheets --title "<App> (staging)" --rootDir dist
```

How to create the production project with `-P .clasp.prod.json` must be confirmed during implementation.

---

## 7. Architecture

### File tree (about 24 files)

```
.
├── README.md              purpose; local → staging → production; safety model; what local does NOT reproduce; ops notes
├── AGENTS.md              ≤ 50 lines: map of 3 runtimes; done = `npm test`; rules code can't enforce; GAS gotchas
├── CLAUDE.md              `@AGENTS.md`
├── .claude/settings.json  permissions.ask for `npm run deploy:prod*` (human approves production)
├── .gitignore             node_modules, dist, .clasprc.json
├── package.json           "type": "module", engines node >= 24, exact-pinned devDeps, scripts
├── appsscript.json        V8, timeZone, exceptionLogging STACKDRIVER, webapp {executeAs USER_DEPLOYING, access MYSELF}; no oauthScopes
├── vite.config.ts         ~6 lines: root src/client, outDir ../../dist, plugins [appsScript()]
├── tsconfig.json          tooling project (vite.config.ts, tools/, test/; types node + google-apps-script) + references
├── tools/                 local Node only, never bundled
│   ├── apps-script.ts     (~120) the Vite plugin: environments + builder; client inlining; guards; gas IIFE + banner + footer stubs; manifest guard/emit; dev middleware + shim injection; invoke()
│   ├── google-script.js   (~50) google.script.run look-alike with Google's argument check ported; google.script.url.getLocation; injected in dev, imported by tests
│   ├── gas-fakes.ts       (~80) strict in-memory SpreadsheetApp subset, Session, LockService, PropertiesService, Utilities.getUuid; every other service is a refusing proxy; state on globalThis; resetFakes(), actAs()
│   └── deploy.ts          (~50) see §7.7
├── test/
│   ├── app.test.ts        example behaviour through client proxy → shim → invoke → server source on fakes
│   └── build.test.ts      dist invariants (see §7.5)
└── src/
    ├── server/  tsconfig.json (composite; lib es2020; types [google-apps-script] only)
    │            main.ts  (doGet + `export * from './api.ts'`)
    │            api.ts   (public endpoints only)
    │            sheet.ts (private: book(), table mapping, currentUser(), isOwner(), withLock())
    └── client/  tsconfig.json (composite; DOM + vite/client; references ../server)
                 index.html (<base target="_top">), server.ts (typed Promise proxy + Json/Remote types),
                 main.ts (vanilla TS, textContent only), style.css
```

### 7.1 Build (`vite build`, one config, `builder: {}`)

**Client environment**

- Options: `minify: false`, `modulePreload: false`, `cssCodeSplit: false`, `assetsInlineLimit: () => true`, `rolldownOptions.output.codeSplitting: false`.
- In `generateBundle` with `order: 'post'`, inline the JS chunk (escape `</script` and `<!--` as `\x3C`) and the CSS (`</style` → `<\/style`).
- **Template-literal `//` rewrite:** only if the live check (§10) shows the HtmlService bug still exists. In that case rewrite `//` → `/\/` and `/*` → `/\*` inside untagged template literals via `parseAst`, and fail the build on tagged templates that contain them.
- **Source guards** (files under `src/client`, small regexes):
  - Fail on `location.search` / `location.hash`, which are wrong inside the sandbox iframe. Use `google.script.url.getLocation`, which the dev shim provides.
  - Fail on `innerHTML` / `outerHTML` / `insertAdjacentHTML` / `document.write`. An XSS under `USER_DEPLOYING` lets one user act as another against owner-privileged endpoints.
  - Keep these guards tiny. Drop them if they prove noisy.

**Manifest guard**

- Fail with an explanation unless `webapp.access ∈ {MYSELF, DOMAIN}` and `webapp.executeAs === USER_DEPLOYING`.
- Changing this means editing the guard, which shows up in the diff.
- Emit `appsscript.json` to dist.

**`gas` environment**

- Settings: `consumer: 'server'`, `resolve: { noExternal: true, conditions: ['default'] }`, `emptyOutDir: false`, `minify: false`, `target: 'es2019'`, `lib: { entry: 'src/server/main.ts', formats: ['iife'], name: '__app' }`.
- `rolldownOptions.onwarn`: throw on `TOLERATED_TRANSFORM` (BigInt).
- `output.entryFileNames: 'code.js'`.
- `output.banner: '/** @OnlyCurrentDoc */'`. It survives the build (V).
- `output.footer` generates one **top-level function per export**, except `default`:
  - `doGet`, `doPost`, `onOpen`, `onEdit`, `onInstall` and `onSelectionChange` pass through: `function doGet(e){ return __app.doGet(e); }`.
  - Every other export becomes `function name(){ return JSON.stringify(__app.name.apply(this, arguments)); }`.
  - Only these stubs and `__app` are global, so internal helpers are not callable (V in Node vm).
- **Why JSON strings:** the transport is identical in dev, tests and GAS by construction. A Date leaked from `getValues()` arrives as an ISO string instead of nulling the whole result. This generalizes upstream PR #4.

### 7.2 Dev (`npm run dev` = `vite`)

- **Shim injection.** In dev only, `transformIndexHtml` injects `tools/google-script.js`. The shim waits `GAS_LATENCY` ms (default 600), then sends `POST /__gas {name, args, user}`.
- **Switching the caller.**
  - `?as=email` switches the caller (dev only).
  - `?as=` (empty) simulates an outside user, with a blank email.
- **Failure injection.** Keep `?fail=name` to force a call to fail.
- **What the middleware's `invoke()` does:**
  1. `env.runner.clearCache()`: fresh module state per call, like a new GAS execution.
  2. Import `tools/gas-fakes.ts` and `src/server/main.ts`.
  3. Reject non-exported names, pass-through names (doGet etc.) and names ending in `_`, with `Script function not found: x`.
  4. `actAs(user)`, then call the function.
  5. A thenable result throws `exports must be synchronous (GAS has no async I/O)`.
  6. Reply with `JSON.stringify(result)`, the same string the production stub returns, or `{error:{name,message}}`. Print the stack to the terminal so agents see it.
- **Reloads and data.** Server edits apply on the next call without a restart. Fake data persists on `globalThis` until the server restarts. `doGet` is not emulated; the build test covers it.
- **Possible addition (pending §11.1):** a "dev shell" mode that loads the local UI with HMR inside the staging `/dev` page, using the **real** `google.script.run` and the real staging data. A recipe is in Appendix C. It is not tested end to end.

### 7.3 Client and types

- `src/client/server.ts` exports `server: Remote<typeof import('../server/api.ts')>`.
  - Returns are typed `Json<R>`: Date → string via `toJSON`, functions → never. This describes what actually arrives.
  - Arguments are constrained `A extends Json<A>`, so a Date argument is a compile error.
  - Interfaces are supported, and the error messages are readable (Appendix B).
- **Proxy behavior.**
  - The Proxy returns `undefined` for `then`.
  - Each call creates a fresh `google.script.run` chain inside the Promise executor, so a synchronous argument-check throw becomes a rejection.
  - On success, the result is `JSON.parse`d.
- **Typecheck:** `tsc -b` with 3 tsconfigs. `SpreadsheetApp` in the client and `setTimeout`/`URL`/`document` in the server are compile errors (V).
- **UI:** vanilla TS with `createElement` and `textContent`. The README has one paragraph on adding Preact/React, with a size note: HTML is re-sent on every load.

### 7.4 Fakes (`tools/gas-fakes.ts`)

- **What it emulates:** the strict in-memory subset the example needs.
  - SpreadsheetApp: `getActiveSpreadsheet`, `getSheetByName`, `insertSheet`, `getDataRange`, `getRange(r,c,nr,nc)`, `getLastRow`, `appendRow`, `setValues`/`getValues` with GAS-like dimension errors, `setFrozenRows`.
  - Session: active user switchable; effective user = `owner@example.com`.
  - LockService: a no-op, and it says so.
  - PropertiesService (script).
  - Utilities.getUuid.
- **Everything else refuses** with the message from principle 1.
- **Honesty about values.** Values are stored as given; Sheets' auto-typing is **not** modelled, and the docs say so. Two narrow behaviors are modelled:
  - A leading `'` is stripped on store.
  - An unprefixed string starting with `=` is refused (`formula writes are not emulated`), so code must write user text with a leading `'`, which also prevents formula injection.
- **Seed data** is sheet-shaped (header row + rows).
- **Known gap, to be stated in README/AGENTS.md:** Node globals remain available at runtime to *bundled npm dependencies*. `tsc` only guards our own sources.

### 7.5 Tests (`npm test` = `tsc -b && vite build && node --test`)

**`test/app.test.ts`** installs `globalThis.google = createGoogleScript(invoke)` and calls `server.load()`, `server.submit()` and `server.decide()` through the **real client proxy**. It asserts:

- dates arrive as ISO strings
- members see only their own rows
- a member's `decide` fails with the owner-only message
- deciding twice is refused
- empty and too-long titles are rejected with the server message
- `'=IMPORTXML(…)'` is stored as text
- a blank email is rejected
- a Date argument is rejected synchronously by the shim

**`test/build.test.ts`** loads `dist/code.js` with `new vm.Script` in an empty context. This shows the file parses as a classic script, is non-empty, and calls no services at the top level. It also asserts:

- the top-level function names deep-equal the snapshot `['decide','doGet','load','submit']`. A comment explains that adding an export adds a public endpoint.
- the `@OnlyCurrentDoc` banner is present
- `dist/index.html` has no external `src`/`href` to local files
- `dist/appsscript.json` equals the source

### 7.6 Auth and data helpers (`src/server/sheet.ts`)

- **`currentUser()`** = `Session.getActiveUser().getEmail()`, lower-cased. A blank email throws, so it fails closed.
- **`isOwner(email)`** = `email === Session.getEffectiveUser().getEmail()`, i.e. the deployer. This is correct only because the build guard pins `executeAs`. The README notes that adding approvers is a one-line change to a script property `ADMINS`.
- **`withLock(fn)`** = `getScriptLock().waitLock(10000)` with try/finally release. Use it only for read-modify-write; there is no lock-by-default.

### 7.7 Deploy script (`tools/deploy.ts`, `node tools/deploy.ts [prod] [--version N]`)

1. **Refuse a dirty git tree.** Run `npm test`.
2. **Select the target:**
   - staging: `.clasp.json`
   - prod: `-P .clasp.prod.json`. If the file is missing, explain how to create the production project.
3. **Push:** `clasp [-P f] push -f`.
4. **Find the deployment:** `clasp [-P f] --json list-deployments`, keeping only entries with a `versionNumber`.
   - Exactly one: `create-deployment -i <id> -d "<short sha> <subject>"`.
   - None: create one and print "this is a new URL".
   - More than one: refuse, and tell the user to archive the extras in "Manage deployments".
5. **Production gate:** before pushing to prod, read the staging deployments and require one whose description starts with `HEAD`'s short SHA. Otherwise stop with "deploy this commit to staging first (`npm run deploy`)". There is no override flag, because agents would use it.
6. **Report:** print the `/exec` URL, and warn when `versionNumber ≥ 180` (the limit is 200).
7. **Rollback:** `--version N` runs `create-deployment -i <id> -V N` with no build.
8. **Never** delete anything, never store IDs, never prompt interactively. Prompts block agents; the human gate is `.claude/settings.json` `permissions.ask`.

### 7.8 Agent files

- **AGENTS.md** (≤ 50 lines):
  - run `npm test` before claiming done
  - every export in `api.ts` is public: validate arguments and check the caller
  - use `server`, never `google.script.run` directly
  - exports are synchronous
  - no Date/Map arguments, no keys ending `__`
  - no `setTimeout`/`URL`/`TextEncoder`/`fetch` on the server, including via npm deps
  - no state in module variables
  - links use `target="_top"`
  - extend `gas-fakes.ts` strictly; don't mock around it
  - never weaken the manifest guard, banner or export snapshot silently
  - never run `deploy:prod` unless asked
  - anything the fakes don't model must be verified on `/dev`
- **CLAUDE.md** = `@AGENTS.md`. A `.gemini/settings.json` pointing at AGENTS.md is optional.

---

## 8. Example app: request board (申請ボード, lite)

The example is the target persona's most common workflow, and the smallest one that exercises identity, authorization, validation, locking, Dates from `getValues` and formula injection.

**`api.ts`** (about 35 lines, plain functions):

- `load(): { me; isOwner; requests: Request[] }` returns everything for one screen in one call. Members see their own requests; the owner sees all.
- `submit(title: string): Request` trims, requires 1–100 characters, writes formula-safe text, and takes the requester from `Session`, never from input.
- `decide(id: string, approve: boolean): Request` is owner-only, runs under `withLock`, refuses requests that are already decided, and records `decidedBy` and `decidedAt`.

**Data:** `Request = {id, title, status, requester, createdAt: Date, decidedBy, decidedAt: Date | ''}`. It is stored in a `requests` sheet created on first use with a frozen header row. The client sees the Dates as strings.

**Client:** `main.ts` is about 50 lines of vanilla TS. Buttons are disabled while a call is pending, and `err.message` is shown.

Replacing the example means editing `api.ts`, `sheet.ts`, `main.ts`, `app.test.ts` and the export snapshot. `tools/` is untouched.

---

## 9. Dependencies (exact pins)

| Package | Why |
|---|---|
| `vite@8.3.2` | dev server, module runner, both builds |
| `typescript@7.0.2` | `tsc -b`. The configs only use options TS 5.9 also accepts, so falling back is a version change (I). |
| `@types/google-apps-script@2.0.13` | server globals; catches invented APIs |
| `@types/node@24.x` | tools/tests only |

**Not installed:** `@google/clasp` (pinned npx), `vite-plugin-singlefile`, `vite-plugin-static-copy`, any test/lint/format framework, gas-fakes, googleapis.

---

## 10. Must verify on a real Apps Script deployment (release blockers first)

1. **Footer stubs.** The footer stubs around the IIFE appear in `functionNames` and are callable via `google.script.run`. Internal helpers and `__app` are not callable. The editor Run dropdown shows only the stubs.
2. **JSON-string return.** The JSON string arrives unchanged, and `JSON.parse` yields ISO dates. `null` and about 1 MB results also arrive intact.
3. **Bound spreadsheet.** `SpreadsheetApp.getActiveSpreadsheet()` works in a bound script deployed as a web app, both in `doGet` and in `google.script.run` executions. If it fails, switch to the §5 fallback.
4. **`@OnlyCurrentDoc` banner.** The banner at the top of the bundled `code.js` makes scope auto-detection grant only `spreadsheets.currentonly` (+ `userinfo.email`). The first-open authorization flow works under granular consent.
5. **Identity.** `getActiveUser().getEmail()` returns the email for the owner (MYSELF) and for same-domain users (DOMAIN) under `USER_DEPLOYING`. `getEffectiveUser()` is the deployer.
6. **Error message.** The exact `err.message` and `err.name` that the failure handler receives (is there a prefix?).
7. **The `//` bug.** Whether HtmlService still corrupts `//` or `/*` inside template literals in 2026. This decides the §7.1 rewrite.
8. **HtmlService behavior.** Inline `<script type="module">` executes, `<base target="_top">` works, and `google.script.url.getLocation` returns the top URL's parameters.
9. **Sheets semantics the fakes encode.** For example, `"'=1+1"` stores text and reads back without the apostrophe, and a Date written to a cell reads back as a Date.
10. **Parser.** The es2019 output, including any helpers Oxc emits, passes Apps Script's save-time parser.
11. **clasp end to end:**
    - `create-script --type sheets --rootDir dist` (does `.clasp.json` include `parentId`?)
    - creating the second project with `-P .clasp.prod.json`
    - `push -f` replaces the default `Code`
    - `create-deployment` on a fresh project yields a working web app per the manifest
    - `-i` keeps the URL
    - `--json` output via npx is clean JSON on stdout
12. **Workspace `/dev` URL form.** `/a/macros/<domain>/s/<id>/dev`, editor-only.
13. **Fresh state.** Each `google.script.run` call starts with fresh module-level state.
14. **Deployer identity.** Whose identity a `USER_DEPLOYING` app runs as after a *different* editor runs `deploy`. This affects `isOwner()` and needs an ops note.
15. **Locking.** `waitLock` serializes two concurrent `decide()` calls from different users.

Make this a throwaway project (spreadsheet + bound script), get the owner's permission before creating it, and delete it afterwards.

---

## 11. Open questions for the owner

1. **Dev against real staging data.** Should v1 include the dev-shell mode (local UI with HMR inside staging `/dev`, real `google.script.run`, real staging data)? Recommendation: not in v1, because it is untested, needs a browser login and a Chrome Local Network Access prompt, and agents can't use it. Add it later if wanted. The name must follow §6 conventions.
2. **Work location.** Recommendation: on a branch of this repo, replacing its contents, merged via PR.
3. **Live smoke test.** Permission to run §10 on the owner's Google account with a throwaway project.
4. **Language.** README / AGENTS.md: English (like upstream) or Japanese (like the local rewrite)? This design doc is in English per the owner.
5. **Per-environment `access`.** For example, staging `DOMAIN` (stakeholders) while production stays `MYSELF` until launch. That would mean the deploy script patches the manifest per target. Default: one manifest for both.
6. **Repository name.** Keep `apps-script-vite-starter`?

---

## 12. Implementation plan

1. Resolve §11 (at least 2–4).
2. **Live smoke test** of §10 items 1–8 and 11 with a minimal hand-built `dist/` (release blocker). Record the results in this document.
3. Scaffold `package.json` (scripts per §6), the 3 tsconfigs, `vite.config.ts` and `tools/apps-script.ts`. Start from Appendix A, then add `clearCache`, the fakes import, the JSON stubs, pass-through names, the manifest/BigInt guards, the banner and the client guards.
4. Write `tools/google-script.js` (port Google's argument check) and `tools/gas-fakes.ts`.
5. Write the example app: `src/server/{main,api,sheet}.ts` and `src/client/{index.html,server.ts,main.ts,style.css}`.
6. Write the tests (`test/app.test.ts`, `test/build.test.ts`). `npm test` must be green, in about 2 s or less.
7. Write `tools/deploy.ts` (§7.7), including the production gate.
8. Write AGENTS.md, CLAUDE.md, `.claude/settings.json` and the README.
9. Run end to end on real GAS: push, deploy (staging) and deploy:prod using throwaway projects. Then open the PR replacing the old contents.

---

## Appendix A — Verified Vite 8 plugin skeleton (dev runner + single file + IIFE stubs + manifest)

Verified with vite 8.3.2 on Node 24.20:

- `vite build` emits a self-contained `dist/index.html`, `dist/code.js` and `dist/appsscript.json` in 0.5 s.
- `vite` dev answers `google.script.run` and picks up server edits without a restart.

This skeleton does **not** yet include `clearCache`, the fakes, the JSON stubs, the guards or the banner.

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isRunnableDevEnvironment, type Plugin } from 'vite';

export function appsScript({ server = 'src/server/main.ts', manifest = 'appsscript.json', global = '__app' } = {}): Plugin {
  const serverEntry = resolve(server);
  const escJs = (s: string) => s.replace(/<(\/script|!--)/gi, '\\x3C$1');
  const escCss = (s: string) => s.replace(/<\/style/gi, '<\\/style');
  return {
    name: 'apps-script',
    config: () => ({
      base: './',
      builder: {}, // `vite build` builds every environment (client, then gas)
      build: {
        modulePreload: false,
        cssCodeSplit: false,
        assetsInlineLimit: () => true,
        rolldownOptions: { output: { codeSplitting: false } },
      },
      environments: {
        client: {},
        gas: {
          consumer: 'server',
          resolve: { noExternal: true, conditions: ['default'] },
          build: {
            emptyOutDir: false,
            minify: false,
            target: 'es2019',
            lib: { entry: serverEntry, formats: ['iife'], name: global },
            rolldownOptions: {
              output: {
                entryFileNames: 'code.js', // lib.fileName is ignored for consumer 'server'
                footer: (c) => c.exports.filter((n) => n !== 'default')
                  .map((n) => `function ${n}() { return ${global}.${n}.apply(this, arguments); }`).join('\n'),
              },
            },
          },
        },
      },
    }),
    generateBundle: {
      order: 'post', // after Vite rewrites __VITE_PRELOAD__ markers
      handler(_, bundle) {
        if (this.environment.name !== 'client') return;
        const html = bundle['index.html'];
        if (html?.type !== 'asset') return;
        let out = String(html.source);
        for (const f of Object.values(bundle)) {
          if (f.type === 'chunk') {
            out = out.replace(new RegExp(`<script([^>]*) src="[^"]*${f.fileName}"></script>`), (_, a) => `<script${a}>${escJs(f.code)}</script>`);
          } else if (f.fileName.endsWith('.css')) {
            out = out.replace(new RegExp(`<link rel="stylesheet"[^>]* href="[^"]*${f.fileName}"[^>]*>`), () => `<style>${escCss(String(f.source))}</style>`);
          } else continue;
          delete bundle[f.fileName];
        }
        html.source = out;
        this.emitFile({ type: 'asset', fileName: 'appsscript.json', source: readFileSync(manifest) });
      },
    },
    configureServer(dev) {
      dev.middlewares.use('/__gas/run', async (req, res) => {
        let body = '';
        for await (const chunk of req) body += chunk;
        res.setHeader('content-type', 'application/json');
        try {
          const { name, args } = JSON.parse(body);
          const env = dev.environments.gas;
          if (!isRunnableDevEnvironment(env)) throw new Error('gas environment is not runnable');
          const mod = await env.runner.import(serverEntry);
          if (typeof mod[name] !== 'function') throw new Error(`Script function not found: ${name}`);
          res.end(JSON.stringify({ value: await mod[name](...args) }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: { name: (e as Error).name, message: (e as Error).message } }));
        }
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler: (_, ctx) => (ctx.server ? [{ tag: 'script', injectTo: 'head-prepend', children: DEV_RUN }] : []),
    },
  };
}

// Minimal dev-only google.script.run look-alike (to be replaced by tools/google-script.js).
const DEV_RUN = `window.google = { script: { run: (function make(ok, ng) {
  return new Proxy({}, { get: (_, name) =>
    name === 'withSuccessHandler' ? (f) => make(f, ng) :
    name === 'withFailureHandler' ? (f) => make(ok, f) :
    (...args) => { fetch('/__gas/run', { method: 'POST', body: JSON.stringify({ name, args }) })
      .then((r) => r.json()).then((r) => 'error' in r ? ng?.(Object.assign(new Error(r.error.message), r.error)) : ok?.(r.value)); } });
})() } };`;
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { appsScript } from './tools/apps-script.ts';
export default defineConfig({
  root: 'src/client',
  build: { outDir: '../../dist', emptyOutDir: true },
  plugins: [appsScript()],
});
```

### tsconfig set (project references; verified with TS 7.0.2 `tsc -b`)

```jsonc
// tsconfig.json (add a tooling project for vite.config.ts/tools/test with types ["node", "google-apps-script"])
{ "files": [], "references": [{ "path": "src/client" }, { "path": "src/server" }] }

// src/server/tsconfig.json
{
  "compilerOptions": {
    "composite": true, "emitDeclarationOnly": true,
    "outDir": "../../node_modules/.tmp/server", "rootDir": "..",
    "lib": ["es2020"], "types": ["google-apps-script"],
    "allowImportingTsExtensions": true, "erasableSyntaxOnly": true, "verbatimModuleSyntax": true, "skipLibCheck": true
  },
  "include": ["./**/*.ts"]
}

// src/client/tsconfig.json
{
  "compilerOptions": {
    "composite": true, "emitDeclarationOnly": true,
    "outDir": "../../node_modules/.tmp/client", "rootDir": "..",
    "lib": ["es2022", "dom", "dom.iterable"], "types": ["vite/client"],
    "allowImportingTsExtensions": true, "erasableSyntaxOnly": true, "verbatimModuleSyntax": true, "skipLibCheck": true
  },
  "include": ["./**/*.ts"],
  "references": [{ "path": "../server" }]
}
```

`noEmit` is not allowed with `composite` (TS6310). A plain `tsc -p src/client` on a clean tree gives TS6305, so use `tsc -b`.

## Appendix B — Wire-safe types

There are two variants. Pick one during implementation.

The research verified **variant 1** (a compile-time rejection type). The merged design prefers **variant 2** (`Json<T>`, which describes what arrives through the JSON-string stubs, plus `A extends Json<A>` for arguments).

Variant 1, verified with TS 7.0.2, including interfaces and through project-reference `.d.ts` files:

```ts
type Primitive = string | number | boolean | null | undefined | void;
type NotWireSafe<Why extends string> = { 'google.script.run cannot carry this value': Why };

export type Wire<T> =
  T extends Primitive ? T
  : T extends Date ? NotWireSafe<'Date (send an ISO string or epoch ms)'>
  : T extends ReadonlyMap<any, any> | ReadonlySet<any> | WeakMap<any, any> | WeakSet<any> ? NotWireSafe<'Map/Set (send an array or plain object)'>
  : T extends bigint | symbol ? NotWireSafe<'bigint/symbol'>
  : T extends (...args: any[]) => any ? NotWireSafe<'function'>
  : T extends readonly unknown[] ? { [I in keyof T]: Wire<T[I]> }
  : T extends object ? { [K in keyof T]: Wire<T[K]> }
  : NotWireSafe<'unknown value'>;

export type WireApi<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: Wire<A>) => Wire<R> : NotWireSafe<'non-function export'>;
};

export type Remote<T extends WireApi<T>> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => Promise<Awaited<R>> : never;
};

// Example error (returning an interface with a Date field):
// error TS2344: Type '{ getRow: () => Row; }' does not satisfy the constraint 'WireApi<{ getRow: () => Row; }>'.
//   The types returned by 'getRow(...).at' are incompatible between these types.
//     Property ''google.script.run cannot carry this value'' is missing in type 'Date' ...
```

The type-only import adds nothing to the client bundle (V).

## Appendix C — Dev shell recipe (not tested in Apps Script)

This is for §11.1. Push an owner-only HEAD page that loads the Vite dev server directly, using Vite's backend-integration mode. `google.script.run` is then the real one, and no postMessage bridge is needed.

```html
<!doctype html><html><head><base target="_top"></head><body><div id="app"></div>
<script type="module" src="http://localhost:5173/@vite/client"></script>
<script type="module" src="http://localhost:5173/main.ts"></script>
</body></html>
```

```ts
// vite.config.ts (dev)
server: { port: 5173, strictPort: true, origin: 'http://localhost:5173',
  cors: { origin: /^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/ } }
```

What this depends on:

- No CSP on the GAS frames (verified on a sample).
- `allow="local-network-access *"` on Google's iframes (verified).
- Chrome treating `http://localhost` as potentially trustworthy (inferred).
- Vite's WebSocket token check (verified in source).

Expect a one-time Chrome Local Network Access prompt.
