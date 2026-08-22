/* Landscape Investments — main.js */

(function () {
  'use strict';

  // ── Sticky header shrink ──────────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Mobile nav toggle ─────────────────────────────────────
  const navToggle = document.getElementById('nav-toggle');
  const mainNav   = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.classList.toggle('active', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on anchor link click
    mainNav.querySelectorAll('a[href^="#"], a[href^="blog"], a[href^="configurator"]').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Services dropdown (mobile toggle, desktop hover via CSS) ──
  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = btn.closest('.has-dropdown');
      if (!parent) return;
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const open = parent.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      }
    });
  });

  // ── Scroll reveal (IntersectionObserver) ─────────────────
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all
    reveals.forEach(el => el.classList.add('revealed'));
  }

  // ── Contact form success feedback ─────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      const btn = contactForm.querySelector('[type="submit"]');
      if (btn) {
        btn.textContent = 'Sending…';
        btn.disabled = true;
      }
    });
  }

})();
