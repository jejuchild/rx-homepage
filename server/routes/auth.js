const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

// Resolve admin credentials at module load
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD
  ? bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
  : null;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
  console.warn('[auth] ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to enable admin login');
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    return res.status(503).json({ error: 'Admin not configured' });
  }
  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.user = { email };
  res.json({ user: { email } });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  res.json({ user: null });
});

module.exports = router;
