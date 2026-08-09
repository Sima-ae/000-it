#!/usr/bin/env bash
# One-time on VPS as root: CI deploy key (no passphrase).
#   bash /var/www/000-it.com/scripts/setup-github-deploy-ssh.sh
set -euo pipefail

if [[ "$(id -un)" != "root" ]]; then
  echo "ERROR: run as root"
  exit 1
fi

KEY=/root/.ssh/000it_github_deploy
AUTH=/root/.ssh/authorized_keys

mkdir -p /root/.ssh
chmod 700 /root/.ssh

if [[ ! -f "$KEY" ]]; then
  ssh-keygen -t ed25519 -f "$KEY" -N "" -C "000-it-github-actions"
  chmod 600 "$KEY"
  chmod 644 "${KEY}.pub"
  echo "Created new deploy key (no passphrase): $KEY"
else
  echo "Deploy key already exists: $KEY"
fi

PUB="$(cat "${KEY}.pub")"
if [[ -f "$AUTH" ]] && grep -qF "${PUB}" "$AUTH" 2>/dev/null; then
  echo "OK: public key already in $AUTH"
else
  echo "$PUB" >> "$AUTH"
  chmod 600 "$AUTH"
  echo "OK: added public key to $AUTH"
fi

echo ""
echo "=== GitHub repository secrets (000-it repo) ==="
echo "  VPS_USER = root"
echo "  VPS_HOST = 89.116.38.197"
echo "  VPS_APP_PATH = /var/www/000-it.com"
echo "  VPS_SSH_KEY = copy everything below (private key, no passphrase)"
echo ""
echo "----- copy for VPS_SSH_KEY secret -----"
cat "$KEY"
echo "----- end -----"
echo ""
echo "If catalogus deploy already works: you can copy the same VPS_SSH_KEY secret"
echo "from that repo instead of using this key."
