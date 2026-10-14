#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
npm ci --ignore-scripts
npm run build
npm run setup
npm run register
printf '%s\n' 'Ready. Run bash start.sh to keep the bot online.'
