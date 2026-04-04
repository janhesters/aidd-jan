#!/usr/bin/env bash
set -euo pipefail

PORTLESS_BIN="$(command -v portless)" || { echo "portless not found in PATH — run 'bun install' first" >&2; exit 1; }

# Persist CA certs across reboots (default /tmp/portless is wiped on reboot).
export PORTLESS_STATE_DIR="${PORTLESS_STATE_DIR:-$HOME/.portless}"

# Trust CA — portless auto-elevates with sudo on most platforms, but on
# Arch Linux update-ca-trust prints "Unknown error 13" which portless
# doesn't recognise as a permission error. Fall back to explicit sudo.
if ! "$PORTLESS_BIN" trust 2>/dev/null; then
  sudo env "PORTLESS_STATE_DIR=$PORTLESS_STATE_DIR" "$PORTLESS_BIN" trust
fi

MARKER="$PORTLESS_STATE_DIR/.setup-done"

if [ ! -f "$MARKER" ]; then
  # First-time setup: stop any proxy running from a different state dir
  # (e.g. /tmp/portless) so it restarts with the persistent, trusted certs.
  # Unset PORTLESS_STATE_DIR for stop so it discovers the actual running proxy.
  sudo env -u PORTLESS_STATE_DIR "$PORTLESS_BIN" proxy stop 2>/dev/null || true
  sudo env "PORTLESS_STATE_DIR=$PORTLESS_STATE_DIR" "$PORTLESS_BIN" proxy start
  touch "$MARKER"
else
  # Subsequent runs: just ensure proxy is up (no-op if already running).
  # portless handles its own sudo internally, but falls back to explicit sudo
  # in case the internal elevation fails (e.g. after reboot on port 443).
  "$PORTLESS_BIN" proxy start || sudo env "PORTLESS_STATE_DIR=$PORTLESS_STATE_DIR" "$PORTLESS_BIN" proxy start
fi
