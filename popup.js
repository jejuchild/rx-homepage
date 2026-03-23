/* ═══════════════════════════════════════════════════════
   RX Inc. — Popup Display Logic
   Fetches active popups from Supabase.
   Requires: supabase-config.js loaded before this file.
   ═══════════════════════════════════════════════════════ */

(async function () {
  if (typeof _supabase === 'undefined') return;

  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: popups } = await _supabase
      .from('popups')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${today}`)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!popups || popups.length === 0) return;

    const popup = popups[0];
    const dismissKey = `rx-popup-dismiss-${popup.id}`;
    const dismissedDate = localStorage.getItem(dismissKey);

    // Already dismissed today
    if (dismissedDate === today) return;

    // Determine language
    const lang = localStorage.getItem('rx-lang') || 'en';
    const title = (lang === 'en' && popup.title_en) ? popup.title_en : popup.title_ko;
    const content = (lang === 'en' && popup.content_en) ? popup.content_en : popup.content_ko;
    const linkText = (lang === 'en' && popup.link_text_en) ? popup.link_text_en : (popup.link_text_ko || '자세히 보기');

    // Build popup HTML
    const overlay = document.createElement('div');
    overlay.id = 'rx-popup-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:24px;';

    const card = document.createElement('div');
    card.style.cssText = 'background:#18181b;border:1px solid rgba(255,255,255,0.1);border-radius:16px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 25px 50px rgba(0,0,0,0.5);';

    let html = '';

    // Image
    if (popup.image_url) {
      html += `<div style="width:100%;">
        <img src="${esc(popup.image_url)}" alt="" style="width:100%;height:auto;display:block;">
      </div>`;
    }

    // Content
    html += `<div style="padding:24px;">`;
    html += `<h3 style="font-size:18px;font-weight:500;color:#fff;margin:0 0 8px;">${esc(title)}</h3>`;
    if (content) {
      html += `<p style="font-size:14px;color:#a1a1aa;line-height:1.6;margin:0 0 20px;white-space:pre-line;">${esc(content)}</p>`;
    }

    // Link button
    if (popup.link_url) {
      html += `<a href="${esc(popup.link_url)}" target="_blank" rel="noopener"
        style="display:inline-block;padding:10px 24px;background:#fff;color:#000;font-size:13px;font-weight:500;border-radius:8px;text-decoration:none;margin-bottom:16px;">
        ${esc(linkText)}</a>`;
    }

    // Bottom actions
    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
      <button id="rx-popup-dismiss-today" style="background:none;border:none;color:#71717a;font-size:12px;cursor:pointer;padding:4px 0;">
        ${lang === 'en' ? "Don't show today" : '오늘 하루 보지 않기'}
      </button>
      <button id="rx-popup-close" style="background:none;border:none;color:#a1a1aa;font-size:12px;cursor:pointer;padding:4px 8px;">
        ${lang === 'en' ? 'Close' : '닫기'}
      </button>
    </div>`;
    html += `</div>`;

    card.innerHTML = html;
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Close handlers
    const close = () => overlay.remove();
    document.getElementById('rx-popup-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    document.getElementById('rx-popup-dismiss-today').addEventListener('click', () => {
      localStorage.setItem(dismissKey, today);
      close();
    });

  } catch (err) {
    console.warn('Popup fetch error:', err);
  }

  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
})();
