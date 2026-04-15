require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const ogRoutes = require('./routes/og');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (!process.env.SESSION_SECRET) {
  console.warn('[server] SESSION_SECRET not set — sessions will not be secure');
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-only-not-secure',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: IS_PROD,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }),
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', uploadRoutes);
app.use('/api', ogRoutes);

// Static uploads (user-uploaded images)
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', immutable: false }));

// Static site
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(
  express.static(PUBLIC_DIR, {
    extensions: ['html'], // /about → /about.html
    maxAge: IS_PROD ? '1h' : 0,
  }),
);

// Healthcheck
app.get('/healthz', (req, res) => res.json({ ok: true }));

// 404 fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] RX homepage running on http://localhost:${PORT}`);
});
