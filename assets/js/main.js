// ==========================================================================
// FARHAJ RAFIQUE — PORTFOLIO — MAIN JS
// ==========================================================================
// If content-loader.js is present on the page, it fetches the live content
// from /data/*.json, rebuilds the dynamic sections, and then calls
// window.initPageAnimations() itself once the final DOM is in place.
// This fallback only runs the animations directly if content-loader.js
// didn't load for some reason (e.g. JS error), so the page still works.

window.initPageAnimations = function initPageAnimations() {
  initHeader();
  initNavToggle();
  initHeroPhoto();
  initScrollReveal();
  initCounters();
  initTestimonials();
  initPortfolioFilters();
  initLightbox();
  initTimeline();
  initSkillBars();
  initContactForm();
  initFooterYear();
};

document.addEventListener('DOMContentLoaded', () => {
  if (!window.__contentLoaderPresent) {
    window.initPageAnimations();
  }
});

/* ---------- Sticky header ---------- */
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile nav toggle ---------- */
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Hero photo reveal (wipe + ring draw) ---------- */
function initHeroPhoto() {
  const frame = document.querySelector('.photo-frame');
  if (!frame) return;
  // Trigger shortly after load so the page paints first
  requestAnimationFrame(() => {
    setTimeout(() => frame.classList.add('in-view'), 150);
  });
}

/* ---------- Scroll-triggered fade/slide reveals ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.getAttribute('data-reveal-delay');
        if (delay) {
          el.style.transitionDelay = `${delay}ms`;
        }
        el.classList.add('in-view');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
}

/* ---------- Animated stat counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400;
    const startTime = performance.now();

    const easeOutQuad = t => t * (2 - t);

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
      }
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(el => observer.observe(el));
}

/* ---------- Testimonial slider ---------- */
function initTestimonials() {
  const track = document.getElementById('testiTrack');
  if (!track) return;
  const cards = Array.from(track.querySelectorAll('.testi-card'));
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  let index = 0;
  let autoplayTimer = null;

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot';
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    cards.forEach((card, i) => card.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  function goTo(i, userTriggered) {
    index = (i + cards.length) % cards.length;
    render();
    if (userTriggered) restartAutoplay();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function restartAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, 6000);
  }

  prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });
  nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });

  render();
  restartAutoplay();
}

/* ---------- Portfolio filter tabs ---------- */
function initPortfolioFilters() {
  const tabs = document.getElementById('filterTabs');
  if (!tabs) return;

  const buttons = Array.from(tabs.querySelectorAll('.filter-btn'));
  const glide = document.getElementById('filterGlide');
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const emptyMsg = document.getElementById('gridEmpty');

  function moveGlide(btn) {
    if (!glide || window.innerWidth <= 720) return;
    glide.style.width = btn.offsetWidth + 'px';
    glide.style.transform = `translateX(${btn.offsetLeft - 8}px)`;
  }

  function applyFilter(filter) {
    let visibleCount = 0;
    cards.forEach((card, i) => {
      const matches = filter === 'all' || card.getAttribute('data-category') === filter;
      if (matches) {
        card.classList.remove('filtered-out');
        card.style.transitionDelay = `${Math.min(visibleCount, 8) * 60}ms`;
        visibleCount++;
      } else {
        card.style.transitionDelay = '0ms';
        card.classList.add('filtered-out');
      }
    });
    if (emptyMsg) emptyMsg.hidden = visibleCount !== 0;
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      moveGlide(btn);
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  // Initial state
  const activeBtn = tabs.querySelector('.filter-btn.active') || buttons[0];
  requestAnimationFrame(() => moveGlide(activeBtn));
  window.addEventListener('resize', () => moveGlide(tabs.querySelector('.filter-btn.active')));
}

/* ---------- Project lightbox ---------- */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const backdrop = document.getElementById('lightboxBackdrop');
  const closeBtn = document.getElementById('lightboxClose');
  const imageWrap = document.getElementById('lightboxImage');
  const iconWrap = document.getElementById('lightboxIcon');
  const tagEl = document.getElementById('lightboxTag');
  const titleEl = document.getElementById('lightboxTitle');
  const descEl = document.getElementById('lightboxDesc');

  let lastFocused = null;

  function openLightbox(card) {
    const title = card.getAttribute('data-title') || '';
    const desc = card.getAttribute('data-desc') || '';
    const tag = card.getAttribute('data-tag') || '';
    const tintA = getComputedStyle(card).getPropertyValue('--tint-a');
    const tintB = getComputedStyle(card).getPropertyValue('--tint-b');
    const iconMarkup = card.querySelector('.thumb-icon')?.innerHTML || '';

    titleEl.textContent = title;
    descEl.textContent = desc;
    tagEl.textContent = tag;
    iconWrap.innerHTML = iconMarkup;
    if (tintA && tintB) {
      imageWrap.style.background = `linear-gradient(140deg, ${tintA} -20%, var(--bg-2) 55%, ${tintB} 130%)`;
    }

    lastFocused = document.activeElement;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.card-open').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      if (card) openLightbox(card);
    });
  });

  backdrop.addEventListener('click', closeLightbox);
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}

/* ---------- Timeline progress line ---------- */
function initTimeline() {
  const track = document.getElementById('timelineTrack');
  const fill = document.getElementById('timelineFill');
  if (!track || !fill) return;

  function updateFill() {
    const rect = track.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const start = viewportH * 0.85;
    const total = rect.height + viewportH * 0.3;
    const progressed = start - rect.top;
    const percent = Math.max(0, Math.min(1, progressed / total));
    fill.style.height = `${percent * 100}%`;
  }

  updateFill();
  window.addEventListener('scroll', updateFill, { passive: true });
  window.addEventListener('resize', updateFill);
}

/* ---------- Animated skill bars ---------- */
function initSkillBars() {
  const rows = document.querySelectorAll('.skill-row');
  if (!rows.length) return;

  const animateRow = (row) => {
    const fillEl = row.querySelector('.skill-fill');
    const percentEl = row.querySelector('.skill-percent');
    const target = parseInt(fillEl.getAttribute('data-skill-fill'), 10) || 0;
    fillEl.style.width = `${target}%`;

    const duration = 1300;
    const startTime = performance.now();
    const easeOutQuad = t => t * (2 - t);

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutQuad(progress) * target);
      percentEl.textContent = value + '%';
      if (progress < 1) requestAnimationFrame(tick);
      else percentEl.textContent = target + '%';
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateRow(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  rows.forEach(row => observer.observe(row));
}

/* ---------- Contact form ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successPanel = document.getElementById('formSuccess');
  const resetBtn = document.getElementById('formReset');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // No backend is connected yet — this simply confirms receipt in the UI.
    // Once the Admin Panel / backend is wired up, this is where the
    // real submission (e.g. fetch() to an endpoint) will go.
    form.hidden = true;
    successPanel.hidden = false;
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      successPanel.hidden = true;
    });
  }
}

/* ---------- Footer year ---------- */
function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
