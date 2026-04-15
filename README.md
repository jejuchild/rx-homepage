# RX Homepage — Self-Hosted

Self-hostable build of [rx.energy](https://rx.energy). No Vercel, no Supabase, no external SaaS dependencies. Single Node.js process backed by SQLite.

> This is the **`self-hosted`** branch of `rx-homepage`. The `main` branch uses Vercel + Supabase. They share the same HTML/CSS but differ in deployment wiring.

## What's inside

- **Static site** in `public/` (5 pages: home, about, reactor, ax, contact, plus admin)
- **Express API** in `server/` (auth, news/popups CRUD, image upload, OG fetch)
- **SQLite database** at `data/rx.sqlite` (auto-created on first run)
- **Uploads** at `uploads/` (image files served at `/uploads/<filename>`)

No external services required to run.

---

## Quick start (local dev)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET

# 3. Run
npm start
# → http://localhost:3000
```

The SQLite database is created automatically on first run. The schema lives in `server/db.js`.

---

## Production deployment

### Requirements
- Linux server (Ubuntu, Debian, etc.)
- Node.js 18+ (`apt install nodejs npm` or use [nvm](https://github.com/nvm-sh/nvm))
- Nginx (as reverse proxy + TLS termination)
- A domain pointed at your server

### Steps

```bash
# 1. Clone and install
git clone -b self-hosted https://github.com/jejuchild/rx-homepage.git /var/www/rx-homepage
cd /var/www/rx-homepage
npm install --production

# 2. Configure
cp .env.example .env
nano .env
# Generate a strong session secret:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# Paste into SESSION_SECRET. Set NODE_ENV=production and TRUST_PROXY=1.

# 3. Run as a systemd service (see below)
sudo cp rx-homepage.service.example /etc/systemd/system/rx-homepage.service
# Edit the service file to match your install path
sudo systemctl daemon-reload
sudo systemctl enable --now rx-homepage

# 4. Set up Nginx
sudo cp nginx.conf.example /etc/nginx/sites-available/rx-homepage
sudo nano /etc/nginx/sites-available/rx-homepage
# Replace `rx.energy` with your domain and `/path/to/...` with your install path
sudo ln -s /etc/nginx/sites-available/rx-homepage /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. Issue HTTPS certificate
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d rx.energy -d www.rx.energy
```

### Systemd service (sample)

Create `/etc/systemd/system/rx-homepage.service`:

```ini
[Unit]
Description=RX Homepage Node server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/rx-homepage
EnvironmentFile=/var/www/rx-homepage/.env
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now rx-homepage
sudo systemctl status rx-homepage
sudo journalctl -u rx-homepage -f   # follow logs
```

---

## API reference

All admin endpoints require an authenticated session cookie (set by `POST /api/auth/login`).

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/api/news?limit=12` | Published news, newest first |
| GET | `/api/popups/active` | Currently active popup, if any |

### Auth

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/auth/login` | `{email, password}` | Sets session cookie |
| POST | `/api/auth/logout` | — | Destroys session |
| GET | `/api/auth/me` | — | Returns `{user}` or `{user: null}` |

### Admin (auth required)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/news` | List all news (drafts + published) |
| GET | `/api/admin/news/:id` | Get one news item |
| POST | `/api/admin/news` | Create |
| PUT | `/api/admin/news/:id` | Update |
| PATCH | `/api/admin/news/:id/publish` | `{is_published: bool}` |
| DELETE | `/api/admin/news/:id` | Delete |
| GET | `/api/admin/popups` | List all popups |
| GET | `/api/admin/popups/:id` | Get one popup |
| POST | `/api/admin/popups` | Create |
| PUT | `/api/admin/popups/:id` | Update |
| PATCH | `/api/admin/popups/:id/active` | `{is_active: bool}` |
| DELETE | `/api/admin/popups/:id` | Delete |
| POST | `/api/admin/upload` | multipart `file` field. Returns `{url}` |
| GET | `/api/og-image?url=...` | Fetches og:image / og:title from a remote URL |

---

## Backups

The whole CMS is two folders:

```bash
# Daily backup
tar -czf /backup/rx-$(date +%F).tar.gz \
    /var/www/rx-homepage/data \
    /var/www/rx-homepage/uploads
```

Restore: untar to the same locations, restart the service.

---

## File layout

```
rx-homepage/
├── public/              # Static site (served by Express)
│   ├── *.html
│   ├── styles.css
│   ├── main.js
│   ├── news.js          # fetches /api/news
│   ├── popup.js         # fetches /api/popups/active
│   ├── admin.html       # CMS UI
│   └── rx_images/
├── server/
│   ├── index.js         # Express setup, static + routes
│   ├── db.js            # SQLite init + schema
│   ├── middleware/auth.js
│   └── routes/
│       ├── auth.js      # login/logout/me
│       ├── public.js    # public news + popup endpoints
│       ├── admin.js     # CRUD (auth required)
│       ├── upload.js    # multer image upload
│       └── og.js        # OG image fetcher
├── data/                # SQLite DB (gitignored, auto-created)
├── uploads/             # User-uploaded images (gitignored)
├── package.json
├── .env.example
├── nginx.conf.example
└── README.md
```

---

## Troubleshooting

**Admin login fails immediately.** `ADMIN_EMAIL` and `ADMIN_PASSWORD` must both be set in `.env`. Restart the server after editing.

**"Sessions will not be secure" warning.** `SESSION_SECRET` is missing in `.env`. Generate one and restart.

**Cookies not persisting in production.** You're probably behind nginx — set `TRUST_PROXY=1` and `NODE_ENV=production` in `.env`.

**Image upload fails.** Check `uploads/` exists and is writable by the Node process user (e.g. `www-data`).

**News doesn't show up on the homepage.** It might still be a draft. Open `/admin`, log in, click the eye icon to publish.
