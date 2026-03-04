#!/bin/sh
set -e

# Replace the placeholder URL baked in at build time with the real runtime value.
# Next.js bakes NEXT_PUBLIC_* vars into the JS bundles at build time,
# so we do a find-and-replace on the built files at container startup.
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  echo "Setting API URL to: $NEXT_PUBLIC_API_URL"
  find /app/.next -type f -name "*.js" | xargs sed -i "s|__NEXT_PUBLIC_API_URL_PLACEHOLDER__|$NEXT_PUBLIC_API_URL|g"
fi

exec "$@"
