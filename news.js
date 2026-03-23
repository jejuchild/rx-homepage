/* ═══════════════════════════════════════════════════════
   RX Inc. — Dynamic News Loading
   Fetches published news from Supabase and renders
   them into the #news-track carousel on the index page.
   Requires: supabase-config.js loaded before this file.
   ═══════════════════════════════════════════════════════ */

(async function () {
  const track = document.getElementById('news-track');
  if (!track) return; // Not on index page
  if (typeof _supabase === 'undefined') return;

  try {
    const { data: newsItems } = await _supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('date', { ascending: false })
      .order('sort_order', { ascending: true })
      .limit(6);

    if (!newsItems || newsItems.length === 0) return; // Keep static fallback

    const lang = localStorage.getItem('rx-lang') || 'en';

    // Build news cards
    const cards = newsItems.map(n => {
      const title = (lang === 'en' && n.title_en) ? n.title_en : n.title_ko;
      const linkHref = n.link_url || '#';
      const dateStr = n.date || '';
      const category = n.category || 'News';

      let imageHTML;
      if (n.image_url) {
        imageHTML = `
          <div class="relative h-48 bg-ink-800 overflow-hidden">
            <img src="${esc(n.image_url)}" class="w-full h-full object-cover opacity-50" alt="">
            <span class="absolute top-3 right-3 bg-white/10 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full border border-white/20">${esc(category)}</span>
          </div>`;
      } else {
        imageHTML = `
          <div class="relative h-48 bg-ink-800 flex items-center justify-center">
            <div class="text-center px-6">
              <p class="text-2xl font-light text-white/60">${esc(category)}</p>
            </div>
            <span class="absolute top-3 right-3 bg-white/10 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full border border-white/20">${esc(category)}</span>
          </div>`;
      }

      return `
        <div class="dark-card overflow-hidden flex-shrink-0 w-[calc(33.333%-16px)] min-w-[280px]">
          ${imageHTML}
          <div class="p-6">
            <h4 class="text-sm font-normal text-white leading-snug mb-4">${esc(title)}</h4>
            <div class="flex items-center justify-between">
              <p class="text-xs text-steel-400">${esc(dateStr)}</p>
              ${linkHref !== '#' ? `<a href="${esc(linkHref)}" target="_blank" rel="noopener" class="text-xs text-steel-300 hover:text-cyan-400 transition-colors">View →</a>` : ''}
            </div>
          </div>
        </div>`;
    });

    // Replace track content
    track.innerHTML = cards.join('');

    // Update dots
    const dotsContainer = track.closest('section')?.querySelector('[data-dot]')?.parentElement;
    if (dotsContainer) {
      const dotCount = Math.ceil(newsItems.length / 3) || 1;
      let dotsHTML = '';
      for (let i = 0; i < dotCount; i++) {
        dotsHTML += `<div data-dot class="w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/30'} transition-colors"></div>`;
      }
      dotsContainer.innerHTML = dotsHTML;
    }

  } catch (err) {
    // Keep static fallback on error
    console.warn('News fetch error:', err);
  }

  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
})();
