/* ============================================
   MICHAEL COMPOTARO — ACTOR
   script.js
   ============================================ */

(function () {
  'use strict';

  /* ─── LETTER SPLIT ANIMATION ─── */

  function splitToChars(wordEl, baseDelay) {
    const text = wordEl.textContent;
    wordEl.textContent = '';

    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? ' ' : char;
      span.style.animationDelay = (baseDelay + i * 0.08).toFixed(3) + 's';
      wordEl.appendChild(span);
    });
  }

  const nameWords = document.querySelectorAll('.name-word');
  if (nameWords.length) {
    let delay = 0.3;
    nameWords.forEach((word) => {
      const charCount = word.textContent.trim().length;
      splitToChars(word, delay);
      delay += charCount * 0.08 + 0.12;
    });
  }

  /* ─── NAV SCROLL SHADOW ─── */

  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 24);
    }, { passive: true });
  }

  /* ─── HERO PARALLAX ─── */

  const heroInner = document.querySelector('.hero-inner');

  function onParallaxScroll() {
    if (!heroInner || window.innerWidth < 768) return;
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroInner.style.transform = `translateY(${(y * 0.26).toFixed(1)}px)`;
    }
  }

  window.addEventListener('scroll', onParallaxScroll, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth < 768 && heroInner) {
      heroInner.style.transform = '';
    }
  });

  /* ─── INTERSECTION OBSERVER — .reveal ─── */

  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -36px 0px',
    });

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    /* Fallback: make everything visible immediately */
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ─── INTERSECTION OBSERVER — .reveal-stagger ─── */

  const staggerContainers = document.querySelectorAll('.reveal-stagger');

  if (staggerContainers.length && 'IntersectionObserver' in window) {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.stagger-item');
          items.forEach((item, i) => {
            setTimeout(() => item.classList.add('visible'), i * 110);
          });
          staggerObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px -28px 0px',
    });

    staggerContainers.forEach((el) => staggerObserver.observe(el));
  } else {
    staggerContainers.forEach((el) => {
      el.querySelectorAll('.stagger-item').forEach((item) => item.classList.add('visible'));
    });
  }

  /* ─── MOBILE NAV TOGGLE ─── */

  const hamburger = document.querySelector('.nav-hamburger');
  const mobileOverlay = document.querySelector('.nav-mobile-overlay');

  if (hamburger && mobileOverlay) {
    function closeNav() {
      hamburger.classList.remove('active');
      mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      const isOpen = mobileOverlay.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    /* Close on Escape */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ─── FILMSTRIP DRAG-SCROLL ─── */

  const filmstripOuter = document.getElementById('filmstrip-scroll');

  if (filmstripOuter) {
    let isDragging = false;
    let startX;
    let scrollLeftStart;

    filmstripOuter.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - filmstripOuter.offsetLeft;
      scrollLeftStart = filmstripOuter.scrollLeft;
      filmstripOuter.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      filmstripOuter.style.cursor = 'grab';
    });

    filmstripOuter.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - filmstripOuter.offsetLeft;
      filmstripOuter.scrollLeft = scrollLeftStart - (x - startX) * 1.4;
    });

    filmstripOuter.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        filmstripOuter.style.cursor = 'grab';
      }
    });
  }

  /* ─── SMOOTH ACTIVE NAV HIGHLIGHTING ─── */

  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    let activeSection = '';

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection = entry.target.id;
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            const isActive = href === `#${activeSection}` ||
              (href && href.endsWith(`#${activeSection}`));
            link.style.color = isActive ? 'var(--text)' : '';
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach((s) => sectionObserver.observe(s));
  }

})();
