# Deploying the API to the Linode

Assumes Ubuntu/Debian with nginx already running (the Foundry proxy stays as is). Needs Node 22.13+ (24 recommended).

```bash
# 1. Node (skip if node --version is >= 22.13)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - && sudo apt-get install -y nodejs

# 2. User, dirs
sudo useradd --system --home /opt/gutlog-api --shell /usr/sbin/nologin gutlog
sudo mkdir -p /opt/gutlog-api /var/lib/gutlog-api
sudo chown -R gutlog:gutlog /opt/gutlog-api /var/lib/gutlog-api

# 3. Code (from your machine)
rsync -a --exclude node_modules --exclude data server/ USER@LINODE:/tmp/gutlog-api/
# on the Linode:
sudo rsync -a /tmp/gutlog-api/ /opt/gutlog-api/ && sudo chown -R gutlog:gutlog /opt/gutlog-api
cd /opt/gutlog-api && sudo -u gutlog npm ci --omit=dev && sudo -u gutlog npm run build
#   (build needs typescript: run `sudo -u gutlog npm ci && sudo -u gutlog npm run build && sudo -u gutlog npm prune --omit=dev` instead)

# 4. Secrets
sudo cp /opt/gutlog-api/.env.example /etc/gutlog-api.env && sudo chmod 600 /etc/gutlog-api.env
sudo nano /etc/gutlog-api.env     # API_TOKEN (npm run token), ANTHROPIC_API_KEY, ALLOWED_ORIGINS

# 5. systemd
sudo cp /opt/gutlog-api/deploy/gutlog-api.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now gutlog-api
curl -s localhost:8787/health

# 6. nginx + TLS (DNS A record for the subdomain must already point at the Linode)
sudo cp /opt/gutlog-api/deploy/nginx-gutlog-api.conf /etc/nginx/sites-available/gutlog-api
sudo sed -i 's/gutlog-api.EXAMPLE.COM/gutlog-api.yourdomain.tld/' /etc/nginx/sites-available/gutlog-api
sudo ln -s /etc/nginx/sites-available/gutlog-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d gutlog-api.yourdomain.tld
curl -s https://gutlog-api.yourdomain.tld/health
```

Then in the app's Settings enter `https://gutlog-api.yourdomain.tld` and the token.

Updating: rsync again, `npm run build`, `sudo systemctl restart gutlog-api`.
Backups: the whole state is `/var/lib/gutlog-api/gutlog.db` (SQLite, WAL mode). `sqlite3 gutlog.db ".backup /root/gutlog-$(date +%F).db"`.
