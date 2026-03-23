/* ═══════════════════════════════════════════════════════
   RX Inc. — Shared JavaScript
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Language Toggle ───────────────────────────────── */
  const savedLang = localStorage.getItem('rx-lang') || 'en';
  document.body.classList.add(`lang-${savedLang}`);

  // Update active states on load
  document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
    const lang = btn.dataset.langToggle;
    btn.classList.toggle('text-white', lang === savedLang);
    btn.classList.toggle('text-steel-400', lang !== savedLang);
  });

  // Toggle handler
  document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.langToggle;
      document.body.classList.remove('lang-ko', 'lang-en');
      document.body.classList.add(`lang-${lang}`);
      localStorage.setItem('rx-lang', lang);

      document.querySelectorAll('[data-lang-toggle]').forEach(b => {
        b.classList.toggle('text-white', b.dataset.langToggle === lang);
        b.classList.toggle('text-steel-400', b.dataset.langToggle !== lang);
      });
    });
  });

  /* ── Scroll-triggered fade-in animation ─────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 60, 300)}ms`;
    observer.observe(el);
  });

  /* ── Mobile navigation toggle ───────────────────────── */
  const menuBtn  = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const closeBtn  = document.getElementById('close-nav');

  if (menuBtn && mobileNav) {
    const openNav = () => {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeNav = () => {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    };

    menuBtn.addEventListener('click', openNav);
    if (closeBtn) closeBtn.addEventListener('click', closeNav);

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeNav();
      }
    });
  }

  /* ── News Carousel ──────────────────────────────────── */
  const prevBtn = document.getElementById('news-prev');
  const nextBtn = document.getElementById('news-next');
  const track = document.getElementById('news-track');

  if (prevBtn && nextBtn && track) {
    let currentSlide = 0;
    const cards = track.children;
    const totalSlides = Math.max(0, cards.length - 2); // show 3 at a time on desktop

    const updateCarousel = () => {
      if (cards.length > 0) {
        const cardWidth = cards[0].offsetWidth + 24; // card + gap
        track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
      }
      // Update dots
      document.querySelectorAll('[data-dot]').forEach((dot, i) => {
        dot.classList.toggle('bg-white', i === currentSlide);
        dot.classList.toggle('bg-white/30', i !== currentSlide);
      });
    };

    nextBtn.addEventListener('click', () => {
      if (currentSlide < totalSlides) {
        currentSlide++;
        updateCarousel();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentSlide > 0) {
        currentSlide--;
        updateCarousel();
      }
    });
  }

});
