// ==========================================================================
// FARHAJ RAFIQUE — PORTFOLIO — CONTENT LOADER
// ==========================================================================
// Fetches the live content from /data/*.json (written by the Admin Panel)
// and rebuilds every dynamic section of the page with it, then hands off
// to main.js's initPageAnimations() so scroll reveals, counters, filters,
// etc. all attach to the final DOM.
//
// If a fetch fails for any reason, the page quietly falls back to the
// static default content already baked into the HTML.

window.__contentLoaderPresent = true;

(function () {
  const THEME_KEYS = ['charcoal-orange', 'midnight-blue', 'slate-purple', 'emerald-dark'];

  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setText(id, value) {
    if (value == null) return;
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  async function fetchJSON(path) {
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('content-loader: could not fetch', path, e);
      return null;
    }
  }

  function applyTheme(theme) {
    if (!THEME_KEYS.includes(theme)) theme = 'charcoal-orange';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('site-theme', theme); } catch (e) {}
  }

  // ---------- Icon libraries (kept in sync with the static markup) ----------
  const SERVICE_ICONS = {
    wordpress: '<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" stroke-width="2"/><path d="M6 18h36" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="14" r="1.4" fill="currentColor"/><circle cx="17" cy="14" r="1.4" fill="currentColor"/><path d="M13 24l3 8 3.5-9L23 32l3-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shopify: '<svg viewBox="0 0 48 48" fill="none"><path d="M12 16l2-6h20l2 6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 16h28l-2 22H12L10 16z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M18 22v4a6 6 0 0012 0v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    seo: '<svg viewBox="0 0 48 48" fill="none"><path d="M24 6c-8 0-14 6-14 14 0 10.5 14 22 14 22s14-11.5 14-22c0-8-6-14-14-14z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="24" cy="20" r="5.5" stroke="currentColor" stroke-width="2"/></svg>',
    customization: '<svg viewBox="0 0 48 48" fill="none"><path d="M29 12l7 7-16 16H13v-7l16-16z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M26 15l7 7" stroke="currentColor" stroke-width="2"/><path d="M8 36h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    generic: '<svg viewBox="0 0 48 48" fill="none"><path d="M24 6l4.5 9.2L38 16.6l-7 6.8 1.6 9.6L24 28.6l-8.6 4.4L17 23.4l-7-6.8 9.5-1.4L24 6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  };

  const CATEGORY_ICONS = {
    wordpress: '<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="2"/><path d="M6 13.5h20M16 3a20 20 0 010 26M16 3a20 20 0 000 26M9 24l3-9.5L16 24l4-9.5 3 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shopify: '<svg viewBox="0 0 32 32" fill="none"><path d="M8 11l1.5-4h13l1.5 4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M6.5 11h19l-1.5 15H8L6.5 11z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 14.5v3a4 4 0 008 0v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    landing: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 4l3 7 7 1-5 5 1.5 7L16 21l-6.5 3L11 17 6 12l7-1 3-7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    seo: '<svg viewBox="0 0 32 32" fill="none"><path d="M16 4c-5 0-9 3.8-9 9 0 6.5 9 15 9 15s9-8.5 9-15c0-5.2-4-9-9-9z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="16" cy="13" r="3.4" stroke="currentColor" stroke-width="1.7"/></svg>',
  };

  const AWARD_ICONS = {
    certificate: '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="19" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="24" r="14" stroke="currentColor" stroke-width="1.3" stroke-dasharray="2 4"/><path d="M18 24l4 4 8-9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trophy: '<svg viewBox="0 0 48 48" fill="none"><path d="M16 8h16v9a8 8 0 01-16 0V8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16 11H10a6 6 0 006 6M32 11h6a6 6 0 01-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M24 25v7M18 40h12l-2-8H20l-2 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    graduation: '<svg viewBox="0 0 48 48" fill="none"><path d="M4 18L24 9l20 9-20 9-20-9z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13 22.5v8c0 2.5 5 5.5 11 5.5s11-3 11-5.5v-8" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M40 18v11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    star: '<svg viewBox="0 0 48 48" fill="none"><path d="M24 6l4.5 9.2L38 16.6l-7 6.8 1.6 9.6L24 28.6l-8.6 4.4L17 23.4l-7-6.8 9.5-1.4L24 6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    medal: '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="28" r="10" stroke="currentColor" stroke-width="2"/><path d="M18 20L12 6M30 20l6-14M15 8h6M27 8h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 28l3 3 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const CATEGORY_LABELS = { wordpress: 'WordPress', shopify: 'Shopify', landing: 'Landing', seo: 'Local SEO' };

  // ---------- Template builders ----------
  function tplStatCard(stat) {
    return `<div class="stat-card">
      <span class="stat-number" data-count="${esc(stat.number)}" data-suffix="${esc(stat.suffix || '')}">0</span>
      <span class="stat-label">${esc(stat.label)}</span>
    </div>`;
  }

  function tplTestiCard(t) {
    return `<blockquote class="testi-card">
      <p>&ldquo;${esc(t.quote)}&rdquo;</p>
      <footer><span class="testi-name">${esc(t.name)}</span><span class="testi-role">${esc(t.role)}</span></footer>
    </blockquote>`;
  }

  function tplHomeServiceCard(svc, delay) {
    const icon = SERVICE_ICONS[svc.icon] || SERVICE_ICONS.generic;
    return `<div class="service-card" data-reveal="up" data-reveal-delay="${delay}">
      <div class="service-icon">${icon}</div>
      <h3>${esc(svc.title)}</h3>
      <p>${esc(svc.description)}</p>
    </div>`;
  }

  function tplHomeWorkCard(project, delay, tintFlip) {
    const a = tintFlip ? 'var(--accent-b)' : 'var(--accent-a)';
    const b = tintFlip ? 'var(--accent-a)' : 'var(--accent-b)';
    const thumbInner = project.image
      ? `<img src="${esc(project.image)}" alt="${esc(project.title)}" style="width:100%;height:100%;object-fit:cover;">`
      : `<span class="work-tag">${esc(CATEGORY_LABELS[project.category] || project.tag || '')}</span>`;
    return `<a href="portfolio.html" class="work-card" data-reveal="up" data-reveal-delay="${delay}" style="--tint-a:${a};--tint-b:${b};">
      <div class="work-thumb">${thumbInner}</div>
      <div class="work-meta"><h3>${esc(project.title)}</h3><p>${esc(project.description)}</p></div>
    </a>`;
  }

  function tplTimelineItem(item, delay) {
    return `<div class="timeline-item" data-reveal="up" data-reveal-delay="${delay}">
      <span class="timeline-dot"></span>
      <div class="timeline-card">
        <span class="timeline-tag">${esc(item.tag)}</span>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.desc)}</p>
      </div>
    </div>`;
  }

  function tplSkillRow(skill) {
    const pct = parseInt(skill.percent, 10) || 0;
    return `<div class="skill-row">
      <div class="skill-row-head">
        <span class="skill-name">${esc(skill.name)}</span>
        <span class="skill-percent" data-skill-value="${pct}">0%</span>
      </div>
      <div class="skill-track"><div class="skill-fill" data-skill-fill="${pct}"></div></div>
    </div>`;
  }

  function tplProjectCard(project, delay, tintFlip) {
    const a = tintFlip ? 'var(--accent-b)' : 'var(--accent-a)';
    const b = tintFlip ? 'var(--accent-a)' : 'var(--accent-b)';
    const icon = CATEGORY_ICONS[project.category] || CATEGORY_ICONS.wordpress;
    const thumbInner = project.image
      ? `<img src="${esc(project.image)}" alt="${esc(project.title)}" style="width:100%;height:100%;object-fit:cover;position:relative;z-index:1;">`
      : `<span class="thumb-icon">${icon}</span>`;
    return `<article class="project-card" data-category="${esc(project.category)}" data-reveal="up" data-reveal-delay="${delay}"
      data-title="${esc(project.title)}" data-desc="${esc(project.description)}" data-tag="${esc(project.tag)}"
      style="--tint-a:${a};--tint-b:${b};">
      <button class="card-open" aria-label="View ${esc(project.title)} project">
        <div class="project-thumb">
          ${thumbInner}
          <span class="project-tag">${esc(project.tag)}</span>
        </div>
        <div class="project-meta">
          <h3>${esc(project.title)}</h3>
          <p>${esc(project.description)}</p>
        </div>
      </button>
    </article>`;
  }

  function tplServiceDetailCard(svc, delay) {
    const icon = SERVICE_ICONS[svc.icon] || SERVICE_ICONS.generic;
    return `<article class="service-page-card" data-reveal="up" data-reveal-delay="${delay}">
      <div class="service-page-icon">${icon}</div>
      <h3>${esc(svc.title)}</h3>
      <p>${esc(svc.description)}</p>
      <div class="service-page-footer">
        <div class="price-tag">
          <span class="price-label">Starting at</span>
          <span class="price-amount">$${esc(svc.price)}<span class="price-unit">/ ${esc(svc.unit)}</span></span>
        </div>
        <a href="contact.html" class="service-cta" aria-label="Request ${esc(svc.title)}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
    </article>`;
  }

  function tplAwardItem(award, index) {
    const icon = AWARD_ICONS[award.icon] || AWARD_ICONS.certificate;
    const side = index % 2 === 0 ? 'left' : 'right';
    return `<div class="award-item" data-reveal="${side}">
      <span class="award-dot"></span>
      <div class="award-card">
        <div class="award-card-head">
          <span class="award-badge">${icon}</span>
          <span class="award-year">${esc(award.year)}</span>
        </div>
        <h3>${esc(award.title)}</h3>
        <p class="award-source">${esc(award.source)}</p>
        <p class="award-why">${esc(award.why)}</p>
      </div>
    </div>`;
  }

  // ---------- Site-wide population (every page) ----------
  function populateSiteWide(content) {
    if (!content) return;

    if (content.theme) applyTheme(content.theme);

    const site = content.site || {};
    const contact = content.contact || {};

    document.querySelectorAll('.js-logo-initials').forEach(el => {
      if (site.brandInitials) el.textContent = site.brandInitials;
    });
    document.querySelectorAll('.js-footer-tagline').forEach(el => {
      if (site.footerTagline) el.textContent = site.footerTagline;
    });

    if (contact.linkedin) {
      document.querySelectorAll('.js-social-linkedin').forEach(el => el.href = contact.linkedin);
    }
    if (contact.github) {
      document.querySelectorAll('.js-social-github').forEach(el => el.href = contact.github);
    }
    if (contact.instagram) {
      document.querySelectorAll('.js-social-instagram').forEach(el => el.href = contact.instagram);
    }
    if (contact.whatsapp) {
      const waUrl = 'https://wa.me/' + contact.whatsapp.replace(/[^0-9]/g, '');
      document.querySelectorAll('.js-social-whatsapp').forEach(el => el.href = waUrl);
    }

    // Profile photo on the Home hero
    const heroMask = document.getElementById('heroPhotoMask');
    if (heroMask && site.profilePhoto) {
      heroMask.innerHTML = `<img src="${esc(site.profilePhoto)}" alt="Farhaj Rafique" style="width:100%;height:100%;object-fit:cover;">`;
      const badge = document.getElementById('heroPhotoBadge');
      if (badge) badge.hidden = true;
    }

    // Profile photo on the About narrative section
    const aboutMask = document.getElementById('aboutPhotoMask');
    if (aboutMask && site.profilePhoto) {
      aboutMask.innerHTML = `<img src="${esc(site.profilePhoto)}" alt="Farhaj Rafique" style="width:100%;height:100%;object-fit:cover;">`;
      const badge = document.getElementById('aboutPhotoBadge');
      if (badge) badge.hidden = true;
    }
  }

  // ---------- Page-specific population ----------
  function populateHome(content, services, portfolio) {
    const home = (content && content.home) || {};
    setText('heroName', home.heroName);
    setText('heroTitle', home.heroTitle);
    setText('heroTagline', home.heroTagline);
    setText('heroSub', home.heroSub);
    setText('heroCtaText', home.ctaText);

    if (Array.isArray(home.stats) && home.stats.length) {
      const grid = document.getElementById('statsGrid');
      if (grid) grid.innerHTML = home.stats.map(tplStatCard).join('');
    }

    if (Array.isArray(services) && services.length) {
      const grid = document.getElementById('homeServicesGrid');
      if (grid) grid.innerHTML = services.slice(0, 4).map((s, i) => tplHomeServiceCard(s, i * 120)).join('');
    }

    if (Array.isArray(portfolio) && portfolio.length) {
      const featured = portfolio.filter(p => p.featured).slice(0, 4);
      const items = featured.length ? featured : portfolio.slice(0, 4);
      const grid = document.getElementById('homeWorkGrid');
      if (grid) grid.innerHTML = items.map((p, i) => tplHomeWorkCard(p, i * 100, i % 2 === 1)).join('');
    }

    if (Array.isArray(home.testimonials) && home.testimonials.length) {
      const track = document.getElementById('testiTrack');
      if (track) track.innerHTML = home.testimonials.map(tplTestiCard).join('');
      const dots = document.getElementById('testiDots');
      if (dots) dots.innerHTML = '';
    }

    if (Array.isArray(home.brands) && home.brands.length) {
      const track = document.getElementById('marqueeTrack');
      if (track) {
        const spans = home.brands.map(b => `<span>${esc(b)}</span>`).join('');
        track.innerHTML = spans + spans; // duplicate for seamless loop
      }
    }

    if (home.ctaHeading) {
      const el = document.getElementById('closingCtaHeading');
      if (el) el.innerHTML = esc(home.ctaHeading).replace(/\n/g, '<br>');
    }
  }

  function populateAbout(content) {
    const about = (content && content.about) || {};
    const site = (content && content.site) || {};

    setText('pageHeroTitle', about.heroTitle);
    setText('pageHeroSub', about.heroSub);
    setText('aboutChipNum', about.statChipNumber);
    setText('aboutChipLabel', about.statChipLabel);
    setText('aboutLede', about.lede);
    setText('aboutParagraph1', about.paragraph1);
    setText('aboutParagraph2', about.paragraph2);
    setText('aboutMissionQuote', about.missionQuote);

    if (Array.isArray(about.timeline) && about.timeline.length) {
      const wrap = document.getElementById('timelineItems');
      if (wrap) wrap.innerHTML = about.timeline.map((item, i) => tplTimelineItem(item, i * 80)).join('');
    }

    if (Array.isArray(about.skills) && about.skills.length) {
      const list = document.getElementById('skillsList');
      if (list) list.innerHTML = about.skills.map(tplSkillRow).join('');
    }

    setText('certLabel', about.certLabel);
    setText('certTitle', about.certTitle);
    setText('certDesc', about.certDesc);
    setText('certNote', about.certNote);

    const certInner = document.getElementById('certVisualInner');
    if (certInner && site.certImage) {
      certInner.innerHTML = `<img src="${esc(site.certImage)}" alt="Certificate" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">`;
    }
  }

  function populateServicesPage(content, services) {
    const page = (content && content.servicesPage) || {};
    setText('pageHeroTitle', page.heroTitle);
    setText('pageHeroSub', page.heroSub);
    setText('servicesNote', page.note);

    if (Array.isArray(services) && services.length) {
      const grid = document.getElementById('servicesPageGrid');
      if (grid) grid.innerHTML = services.map((s, i) => tplServiceDetailCard(s, i * 100)).join('');
    }
  }

  function populatePortfolioPage(content, portfolio) {
    const page = (content && content.portfolioPage) || {};
    setText('pageHeroTitle', page.heroTitle);
    setText('pageHeroSub', page.heroSub);

    if (Array.isArray(portfolio) && portfolio.length) {
      const grid = document.getElementById('portfolioGrid');
      if (grid) grid.innerHTML = portfolio.map((p, i) => tplProjectCard(p, (i % 6) * 80, i % 2 === 1)).join('');
    }
  }

  function populateContactPage(content) {
    const page = (content && content.contactPage) || {};
    const contact = (content && content.contact) || {};

    setText('pageHeroTitle', page.heroTitle);
    setText('pageHeroSub', page.heroSub);
    setText('formInviteText', page.formInvite);

    if (contact.email) {
      const el = document.getElementById('contactEmailLink');
      if (el) { el.textContent = contact.email; el.href = 'mailto:' + contact.email; }
    }
    if (contact.phone) {
      const el = document.getElementById('contactPhoneLink');
      if (el) { el.textContent = contact.phone; el.href = 'tel:' + contact.phone.replace(/[^0-9+]/g, ''); }
    }
    if (contact.location) {
      setText('contactLocationText', contact.location);
    }
  }

  function populateAwardsPage(content, awards) {
    const page = (content && content.awardsPage) || {};
    setText('pageHeroTitle', page.heroTitle);
    setText('pageHeroSub', page.heroSub);

    if (Array.isArray(awards) && awards.length) {
      const wrap = document.getElementById('awardsTimeline');
      if (wrap) wrap.innerHTML = awards.map(tplAwardItem).join('');
    }
  }

  // ---------- Main ----------
  document.addEventListener('DOMContentLoaded', async () => {
    const page = document.body.getAttribute('data-page');

    try {
      const content = await fetchJSON('data/content.json');
      populateSiteWide(content);

      if (page === 'home') {
        const [services, portfolio] = await Promise.all([
          fetchJSON('data/services.json'),
          fetchJSON('data/portfolio.json'),
        ]);
        populateHome(content, services, portfolio);
      } else if (page === 'about') {
        populateAbout(content);
      } else if (page === 'services') {
        const services = await fetchJSON('data/services.json');
        populateServicesPage(content, services);
      } else if (page === 'portfolio') {
        const portfolio = await fetchJSON('data/portfolio.json');
        populatePortfolioPage(content, portfolio);
      } else if (page === 'contact') {
        populateContactPage(content);
      } else if (page === 'awards') {
        const awards = await fetchJSON('data/awards.json');
        populateAwardsPage(content, awards);
      }
    } catch (e) {
      console.warn('content-loader: falling back to static content', e);
    } finally {
      if (window.initPageAnimations) window.initPageAnimations();
    }
  });
})();
