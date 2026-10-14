#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
node scripts/setup.mjs
npm ci --ignore-scripts
npm run build
npm run register
echo 'Ready: bash start.sh / Hazır: bash start.sh'
