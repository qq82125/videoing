#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "${ROOT_DIR}"
open "http://127.0.0.1:3016" >/dev/null 2>&1 || true
npm start
