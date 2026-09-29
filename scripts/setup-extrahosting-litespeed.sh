#!/usr/bin/env bash
# Wire ExtraHosting CyberPanel vhosts → PM2 :3067 (OpenLiteSpeed only — no nginx).
# Run on the VPS as root:
#   cd /var/www/000-it.com && bash scripts/setup-extrahosting-litespeed.sh
set -euo pipefail

EH_PORT="${EH_PORT:-3067}"
LSWSCTL="${LSWSCTL:-/usr/local/lsws/bin/lswsctrl}"

VHOSTS=(
  "/usr/local/lsws/conf/vhosts/extrahosting.eu/vhost.conf"
  "/usr/local/lsws/conf/vhosts/extrahosting.nl/vhost.conf"
)

PROXY_BLOCK=$(cat <<EOF

# --- ExtraHosting Next.js proxy (managed by setup-extrahosting-litespeed.sh) ---
extprocessor extrahosting_next {
  type                    proxy
  address                 127.0.0.1:${EH_PORT}
  maxConns                100
  pcKeepAliveTimeout      60
  initTimeout             300
  retryTimeout            0
  respBuffer              0
}

context / {
  type                    proxy
  handler                 extrahosting_next
  addDefaultCharset       off
}
# --- end ExtraHosting Next.js proxy ---
EOF
)

strip_managed_block() {
  local conf="$1"
  if grep -q "ExtraHosting Next.js proxy" "$conf"; then
    awk '
      /# --- ExtraHosting Next.js proxy/ {skip=1; next}
      /# --- end ExtraHosting Next.js proxy ---/ {skip=0; next}
      !skip {print}
    ' "$conf" > "${conf}.tmp" && mv "${conf}.tmp" "$conf"
  fi
}

insert_before_vhssl() {
  local conf="$1"
  if grep -qE '^vhssl' "$conf"; then
    awk -v block="$PROXY_BLOCK" '
      BEGIN {printed=0}
      /^vhssl/ && !printed { print block; printed=1 }
      { print }
      END { if (!printed) print block }
    ' "$conf" > "${conf}.tmp" && mv "${conf}.tmp" "$conf"
  else
    printf '%s\n' "$PROXY_BLOCK" >> "$conf"
  fi
}

patch_vhost() {
  local conf="$1"
  if [[ ! -f "$conf" ]]; then
    echo "ERROR: missing vhost conf: $conf"
    return 1
  fi
  cp -a "$conf" "${conf}.bak-extrahosting-$(date +%Y%m%d%H%M%S)"
  strip_managed_block "$conf"
  insert_before_vhssl "$conf"
  echo "OK patched $conf"
}

echo "==> Patch LiteSpeed vhosts → 127.0.0.1:${EH_PORT}"
for conf in "${VHOSTS[@]}"; do
  patch_vhost "$conf"
done

echo "==> Restart OpenLiteSpeed"
if [[ -x "$LSWSCTL" ]]; then
  "$LSWSCTL" restart
else
  systemctl restart lsws || service lsws restart
fi

sleep 2
echo "==> Done. Ensure PM2 extrahosting is listening on :${EH_PORT}:"
echo "  START_EXTRAHOSTING=1 bash scripts/deploy.sh"
echo "  # or: pm2 start deploy/ecosystem.config.cjs --only extrahosting && pm2 save"
