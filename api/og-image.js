// Vercel Serverless Function — fetches Open Graph image from a URL
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'url parameter required' });
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RX-OG-Fetcher/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    const html = await response.text();

    // Extract og:image
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

    // Fallback: twitter:image
    const twMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);

    const imageUrl = ogMatch?.[1] || twMatch?.[1] || null;

    // Also extract og:title as bonus
    const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);

    const title = titleMatch?.[1] || null;

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({ image: imageUrl, title });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch URL', detail: err.message });
  }
}
