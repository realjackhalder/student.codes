# Initial Setup Loop Engineer Prompt

Use this prompt with an engineering agent to prepare the `student.codes`
repository for repeatable local development.

## Prompt

You are the setup engineer for the `student.codes` monorepo. Work from the
repository root and complete the eight setup steps below in order.

Use this loop for every step:

1. Inspect the current repository and Git state. Treat existing changes as
   user-owned and do not overwrite unrelated work.
2. Restate the single step you are about to implement and its acceptance
   criteria.
3. Implement only that step. Do not begin the next numbered step.
4. Run focused verification for the step. If verification fails, diagnose and
   repair only issues that are in scope for the current step.
5. Report the files changed, commands run, verification results, and any
   remaining risks.
6. Stop and wait for the user to say `continue` before starting the next step.

General constraints:

- Never commit secrets, API keys, Discord tokens, or generated local
  credentials.
- Use the versions already pinned by the repository and preserve the lockfile
  unless a step explicitly requires changing dependencies.
- Prefer Corepack and the `packageManager` field over a global pnpm install.
- Use `pnpm install --frozen-lockfile` for reproducible installs.
- Review blocked dependency build scripts before approving them. Do not approve
  a script merely to silence a warning.
- Do not run the write-enabled `pnpm lint` command unless formatting changes are
  intended.
- Keep the website-only workflow independent from the browser extension,
  Discord bot runtime, analytics, and production Piston credentials.
- Never continue to the next step automatically.

### Step 1 — Standardize the toolchain

- Standardize on Node.js 22.
- Use pnpm 10.18.3 through Corepack, as declared by `packageManager`.
- Add `.nvmrc` or `.node-version`.
- Configure the pnpm store as `.pnpm-store` so it remains on the external drive.
- Add `.pnpm-store/` to `.gitignore`.
- Verify with `node --version`, `corepack pnpm --version`, and
  `pnpm config get store-dir`.

### Step 2 — Configure the local environment

- Create `.env/.env.development` from `.env/.env.example` when it is absent.
- Use:

  ```env
  PUBLIC_WEBSITE_URL=http://localhost:3000
  PISTON_API_KEY=dummy-piston-api-key
  ALLOWED_ORIGIN=http://localhost:3000,moz-extension://*,chrome-extension://*
  ```

- Ensure local environment files and real credentials cannot be committed.
- Explain that the dummy key supports the local JavaScript and Python fallback;
  all languages require a real or self-hosted Piston service.

### Step 3 — Install dependencies

- Run `pnpm install --frozen-lockfile`.
- Confirm the lockfile is unchanged.
- Review warnings for Sharp, Esbuild, Tailwind's native engine, Core.js, and any
  other blocked build scripts.
- Approve only scripts demonstrated to be required and trusted.

### Step 4 — Generate and build prerequisites

- Run:

  ```bash
  pnpm --filter website prebuild
  pnpm build:packages
  pnpm --filter discord-bot build
  ```

- Verify translation outputs, shared package outputs, Piston integration
  outputs, and Discord environment exports exist.

### Step 5 — Create a simple development workflow

- Preserve the existing two-terminal workflow:

  ```bash
  pnpm dev:packages
  pnpm --filter website dev
  ```

- Add a `dev:website` command that starts the shared-package watcher and the
  website together, with clean signal handling and readable logs.
- Do not start optional products from this command.
- Verify startup and graceful shutdown.

### Step 6 — Validate the setup

- Run `pnpm check` and `pnpm build`.
- Do not hide existing failures; distinguish setup failures from pre-existing
  code failures.
- In a browser, verify the Playgrounds page, language search and filtering,
  JavaScript execution, Python execution, HTTP responses, server output, and
  browser console.

### Step 7 — Keep optional products separate

- Ensure normal website development does not require browser-extension
  tooling, Discord credentials, PostHog, or production Piston access.
- Add narrowly scoped commands or documentation only where needed.
- Do not configure or transmit real credentials.

### Step 8 — Document the workflow

- Add a `Local Development` section to `README.md`.
- Document Node and pnpm versions, Corepack setup, environment variables,
  first-time commands, daily commands, Piston limitations, optional products,
  validation, and common fixes for missing translations or shared-package
  outputs.
- Test every documented command or clearly label commands that require optional
  external credentials.

At the end of Step 8, run a final Git diff and report the complete setup,
verification evidence, known limitations, and recommended follow-up work.
