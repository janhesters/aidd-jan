# syntax=docker/dockerfile:1

# Build from the repo root, not from apps/web:
#   docker build -f apps/web/Dockerfile .
# bun.lock and every workspace member live above apps/, and a frozen install
# needs all of them, so a narrower context can't work.

# Defaulted for local builds; CI passes the value read from package.json's
# `packageManager` field so the image can't drift from the pin CI installs.
ARG BUN_VERSION=1.4.2

# ---- manifests --------------------------------------------------------------
# Bun resolves the whole workspace graph against bun.lock, so --frozen-lockfile
# needs every member's package.json present, including the ones web never
# imports. Copying manifests alone keeps this layer cached across source edits.
FROM oven/bun:${BUN_VERSION}-slim AS manifests
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/email/package.json packages/email/
COPY packages/playwright-utilities/package.json packages/playwright-utilities/
COPY packages/security/package.json packages/security/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/ui/package.json packages/ui/
COPY packages/utils/package.json packages/utils/
COPY tooling/playwright-web/package.json tooling/playwright-web/

# ---- dependencies -----------------------------------------------------------
# Installed inside the image rather than copied from the host: libsql and sharp
# ship per-platform prebuilt binaries, so a host node_modules is the wrong libc.
#
# --ignore-scripts is load-bearing, not caution: the root package.json's
# `prepare` script runs husky, which is a devDependency. The production install
# therefore can't find it and exits 127, failing the build. Skipping lifecycle
# scripts costs nothing here, since libsql and sharp ship prebuilt binaries as
# optional dependencies rather than building in a postinstall, and git hooks are
# meaningless in an image with no .git.
FROM manifests AS deps
RUN bun install --frozen-lockfile --ignore-scripts

FROM manifests AS prod-deps
RUN bun install --frozen-lockfile --production --ignore-scripts

# ---- build ------------------------------------------------------------------
# react-router build needs devDependencies (vite, tailwindcss, @react-router/dev)
# and the real apps/ <-> packages/ layout. packages/ui's globals.css scans
# `@source "../../../apps/**"`, and apps/web/tsconfig.json extends a config from
# packages/typescript-config; flattening the tree breaks both, silently in the
# Tailwind case.
FROM deps AS build
COPY packages/ packages/
COPY apps/web/ apps/web/
RUN bun run --filter web build

# ---- runtime ----------------------------------------------------------------
FROM oven/bun:${BUN_VERSION}-slim AS runtime

# env.server.ts validates NODE_ENV with no default, so boot throws without it.
# PORT matters too: react-router-serve probes 3000 and quietly falls back to a
# random free port when PORT is unset, which a container port map can't follow.
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Supply at `docker run`, not here. The app boots without them but is either
# broken or insecure:
#   BETTER_AUTH_SECRET  better-auth throws on its dev default under production
#   BETTER_AUTH_URL     OAuth callbacks and redirects resolve against it
#   COOKIE_SECRET       signs the toast and color-scheme cookies
#   TURSO_DATABASE_URL  otherwise libsql creates an empty, schemaless
#                       /app/apps/web/local.db and queries fail on first use
#   TURSO_AUTH_TOKEN    for a remote Turso database
# Never set MOCKS here: it starts MSW and swaps Google OAuth for a local
# emulator.

WORKDIR /app
COPY --from=prod-deps /app ./
# The workspace packages are bundled into build/server/index.js, but their
# node_modules symlinks still point here.
COPY packages/ packages/
COPY --from=build /app/apps/web/build apps/web/build
# app/routes/img.tsx resolves local images as `./public${src}`, relative to the
# working directory rather than the build output. Without this the optimizer
# fails on every landing-page image.
COPY apps/web/public apps/web/public

WORKDIR /app/apps/web
EXPOSE 3000
USER bun

# `--bun` runs react-router-serve's `#!/usr/bin/env node` shebang under Bun,
# which this image has and node isn't. Going through the package's own `start`
# script keeps the entrypoint off @react-router/serve's internal dist layout.
CMD ["bun", "--bun", "run", "start"]
