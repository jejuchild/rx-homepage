const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/og-image?url=...
// Fetches a remote URL and extracts og:image / twitter:image / og:title.
// Auth-required so this can't be abused as an open SSRF proxy.
router.get('/og-image', requireAuth, async (req, res) => {
  const url = req.query.url;
  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'Valid http(s) url required' });
  }

  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 8000);
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RX-OG-Fetcher/1.0)' },
      redirect: 'follow',
      signal: ac.signal,
    });
    clearTimeout(t);
    const html = await resp.text();

    const ogMatch =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    const twMatch =
      html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    const titleMatch =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);

    res.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.json({
      image: (ogMatch && ogMatch[1]) || (twMatch && twMatch[1]) || null,
      title: (titleMatch && titleMatch[1]) || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch URL', detail: err.message });
  }
});

module.exports = router;
