#!/bin/sh
set -e
echo "Starting PilatesHub API server on port ${PORT:-3000}..."
exec node --enable-source-maps /app/api/index.mjs
