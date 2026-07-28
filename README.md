<p align="center">
  <img src=".github/banner.png">
</p>

<p align="center">
  <a href="https://student.codes/">Website</a> -
  <a href="https://student.codes/products/browser-extension">Browser Extension</a> -
  <a href="https://student.codes/products/discord-bot">Discord Bot</a> -
  <a href="https://discord.gg/rtBC7mH5cy">Community</a>
</p>

---

**student.codes** is a suite of tools that lets you run code in any programming language from anywhere, anytime.

It includes:

- A minimal web interface for writing and running code via a simple CodeMirror editor
- A browser extension that can detect and execute code on any webpage
- A Discord bot that executes code through slash commands in chat

student.codes is designed to be lightweight, accessible, and instantly useful — no setup, just run code.

---

## Local Development

### Requirements

- Node.js 22 (see [`.nvmrc`](.nvmrc))
- pnpm 10.18.3, managed by Corepack (the version is pinned in `package.json`)

Enable the pinned package manager once after installing Node:

```sh
corepack enable
corepack pnpm --version
```

The repository uses [`.npmrc`](.npmrc) to keep pnpm's package store in
`.pnpm-store/`, on the project drive. It is ignored by Git.

### Environment

The committed `.env` and `.env/.env.development` files contain safe local
defaults for the website URL, allowed origins, and a dummy Piston key. Do not
put secrets in those files.

For optional local credentials, copy the template to the ignored local file:

```sh
cp .env/.env.development.local.example .env/.env.development.local
```

Never commit a real Piston key, PostHog key, or Discord token.

### First-time setup

From the repository root, install exactly the versions in the lockfile and
generate the required outputs:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm --filter website prebuild
corepack pnpm build:packages
corepack pnpm --filter discord-bot build
```

The first command may ask about native build scripts such as Sharp, Esbuild,
Tailwind's native engine, or Core.js. Review a script before approving it.

### Daily website development

Use the combined command for normal website work:

```sh
corepack pnpm dev:website
```

It watches the shared packages and runs the Next.js website at
http://localhost:3000. Alternatively, use two terminals:

```sh
# Terminal 1
corepack pnpm dev:packages

# Terminal 2
corepack pnpm --filter website dev
```

Validate the repository with:

```sh
corepack pnpm check
corepack pnpm build
```

`pnpm lint` and `pnpm format` write formatting changes, so only run them when
you intend to modify files.

### Piston execution

The dummy key supports local JavaScript and Python execution for basic website
development. Every other runtime requires a valid Piston API key or a
self-hosted Piston instance. Put the real `PISTON_API_KEY` only in
`.env/.env.development.local`.

### Optional products

These are intentionally not started by `dev:website`:

- Browser extension: start `corepack pnpm --filter browser-extension dev:chrome`
  or `corepack pnpm --filter browser-extension dev:firefox`, then load the
  generated extension in the relevant browser.
- Discord bot: configure Discord application credentials and a bot token before
  running it.
- Analytics: add `NEXT_PUBLIC_POSTHOG_KEY` for the website or
  `VITE_PUBLIC_POSTHOG_KEY` for the extension only when analytics is needed.
- Full multi-language execution: configure a real Piston key or self-host
  Piston.

### Common fixes

If locales are missing, run:

```sh
corepack pnpm --filter website prebuild
```

If imports from shared packages fail, run:

```sh
corepack pnpm build:packages
```

If the website cannot import Discord environment exports, run:

```sh
corepack pnpm --filter discord-bot build
```

---
