SSL / Let's Encrypt Setup Guide
===============================
Purpose
-------
How to obtain and install free TLS certificates from Let's Encrypt and automate renewal for:
 - jkbalaji.in
 - www.jkbalaji.in
 - api.jkbalaji.in
 - admin.jkbalaji.in

Prerequisites
-------------
 - DNS A records for each hostname pointing to 46.202.160.193 (propagation complete).
 - Nginx installed and enabled on the VPS.
 - Ports 80 and 443 allowed through firewall (UFW).
 - Certbot installed on the VPS (instructions below).

Install Certbot (Ubuntu)
-----------------------
Run on the VPS as root or via sudo:

apt update
apt install -y certbot python3-certbot-nginx

Alternatively, use snapd for the latest certbot:
snap install core; snap refresh core
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot

Obtain certificates (interactive)
--------------------------------
1) If you want certbot to edit nginx config automatically (recommended):

certbot --nginx -d jkbalaji.in -d www.jkbalaji.in -d api.jkbalaji.in -d admin.jkbalaji.in --email you@example.com --agree-tos --redirect

This command:
 - obtains certificates for the listed names
 - edits Nginx to use the certificates
 - enables HTTP→HTTPS redirect (--redirect)

2) If you prefer manual webroot (useful with custom deploy flow):

certbot certonly --webroot -w /root/jkbalaji/frontend/public -d jkbalaji.in -d www.jkbalaji.in --email you@example.com --agree-tos
certbot certonly --webroot -w /root/jkbalaji/backend/public -d admin.jkbalaji.in --email you@example.com --agree-tos
certbot certonly --webroot -w /path/used/by/api -d api.jkbalaji.in --email you@example.com --agree-tos

After issuing certs with certonly, update the Nginx server blocks to point to:
 /etc/letsencrypt/live/<name>/fullchain.pem
 /etc/letsencrypt/live/<name>/privkey.pem

Automating renewals
--------------------
Certbot installs a systemd timer or cron entry that runs twice daily and renews certificates when near expiry.
To test renewal:
 certbot renew --dry-run

If using webroot or a bespoke deployment, ensure the renewal hooks can reload nginx:
 certbot renew --deploy-hook "systemctl reload nginx"

Wildcard certificates
--------------------
If you want a wildcard (*.jkbalaji.in), you must use DNS-based validation:
 certbot -d \"*.jkbalaji.in\" --manual --preferred-challenges dns certonly
 This requires creating TXT records for DNS and is provider-specific; automating DNS updates is recommended.

Security recommendations
------------------------
 - Use HTTP→HTTPS redirects and enable HSTS only after careful testing:
   add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
 - Limit access to admin subdomain via IP whitelist or HTTP basic auth where appropriate.
 - Ensure file ownership and permissions for certificates are secure (Let's Encrypt handles this under /etc/letsencrypt).
 - Monitor certificate expiry and renewal logs (/var/log/letsencrypt/letsencrypt.log).

Troubleshooting
---------------
 - If certbot fails due to port 80 blocked: ensure UFW allows http, and no other processes block port 80.
 - If nginx configuration test fails: run `nginx -t` and inspect /var/log/nginx/error.log.
 - If DNS not propagated: use `dig +short jkbalaji.in` to verify the IP.

Notes about automated workflows
------------------------------
 - If your deploy process replaces or overwrites nginx site files, ensure deployment scripts preserve the certificate directives or re-run certbot --nginx after deploy.
 - Better pattern: keep certbot-managed certificates in nginx config and do not clobber those files in deployments; have deployment scripts only edit upstream/backend targets.

End of guide.

