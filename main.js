/* ═══════════════════════════════════════════════════════
   RX Inc. — Shared JavaScript
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

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

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeNav();
      }
    });
  }

  /* ── Sticky header shadow on scroll ─────────────────── */
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        header.classList.add('shadow-lg', 'shadow-black/20');
      } else {
        header.classList.remove('shadow-lg', 'shadow-black/20');
      }
    }, { passive: true });
  }

});
