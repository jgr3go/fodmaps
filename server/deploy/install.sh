set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
# 1. Node 24, isolated under /opt/node24 (system Node 14 stays for Foundry)
if [ ! -x /opt/node24/bin/node ]; then
  ver=$(curl -fsSL https://nodejs.org/dist/latest-v24.x/ | grep -o 'node-v24\.[0-9]*\.[0-9]*-linux-x64\.tar\.xz' | head -1)
  echo "installing $ver"
  curl -fsSL "https://nodejs.org/dist/latest-v24.x/$ver" -o /tmp/node24.tar.xz
  mkdir -p /opt/node24 && tar -xJf /tmp/node24.tar.xz -C /opt/node24 --strip-components=1 && rm /tmp/node24.tar.xz
fi
echo "node24=$(/opt/node24/bin/node --version) system_node=$(node --version)"
# 2. user + dirs
id gutlog >/dev/null 2>&1 || useradd --system --home /opt/gutlog-api --shell /usr/sbin/nologin gutlog
mkdir -p /opt/gutlog-api /var/lib/gutlog-api
rsync -a --delete --exclude node_modules --exclude dist /tmp/gutlog-api/ /opt/gutlog-api/
chown -R gutlog:gutlog /opt/gutlog-api /var/lib/gutlog-api
# 3. build
cd /opt/gutlog-api
sudo -u gutlog env PATH=/opt/node24/bin:$PATH HOME=/opt/gutlog-api npm ci --no-audit --no-fund 2>&1 | tail -2
sudo -u gutlog env PATH=/opt/node24/bin:$PATH HOME=/opt/gutlog-api npm run build 2>&1 | tail -2
sudo -u gutlog env PATH=/opt/node24/bin:$PATH HOME=/opt/gutlog-api npm prune --omit=dev --no-audit --no-fund 2>&1 | tail -1
ls dist/
# 4. env (keep an existing token if re-running)
if [ ! -f /etc/gutlog-api.env ]; then
  token=$(/opt/node24/bin/node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")
  cat > /etc/gutlog-api.env <<ENV
API_TOKEN=$token
ANTHROPIC_API_KEY=
ALLOWED_ORIGINS=https://jgr3go.github.io
DB_PATH=/var/lib/gutlog-api/gutlog.db
PORT=8787
ENV
  chmod 600 /etc/gutlog-api.env
fi
# 5. systemd
sed 's#ExecStart=/usr/bin/node#ExecStart=/opt/node24/bin/node#' deploy/gutlog-api.service > /etc/systemd/system/gutlog-api.service
systemctl daemon-reload && systemctl enable --now gutlog-api >/dev/null 2>&1; systemctl restart gutlog-api; sleep 2
systemctl is-active gutlog-api; curl -fsS localhost:8787/health; echo
# 6. nginx, first run only. Never overwrite an existing site file: certbot edits it in place to add the 443 block,
#    and rewriting it from the template silently drops HTTPS (nginx then serves the default site's cert).
if [ ! -f /etc/nginx/sites-available/gutlog-api ]; then
  sed 's/gutlog-api.EXAMPLE.COM/gutlog-api.jongregorowicz.com/' deploy/nginx-gutlog-api.conf > /etc/nginx/sites-available/gutlog-api
  ln -sf /etc/nginx/sites-available/gutlog-api /etc/nginx/sites-enabled/gutlog-api
  nginx -t 2>&1 | tail -1 && systemctl reload nginx
else
  echo "nginx site exists, left untouched ($(grep -c 'managed by Certbot' /etc/nginx/sites-available/gutlog-api) certbot lines)"
fi
echo "--- foundry untouched:"; sha256sum /etc/nginx/sites-enabled/foundry | cut -c1-16; systemctl is-active nginx
echo "--- token (enter this in the app):"; grep API_TOKEN /etc/gutlog-api.env
