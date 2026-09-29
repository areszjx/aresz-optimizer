(() => {
  'use strict';
  const data = window.ARES_DATA || {};
  const games = Array.isArray(data.games) ? data.games : [];
  const optimizers = Array.isArray(data.optimizers) ? data.optimizers : [];
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function renderGameBats() {
    const root = $('#gameBatGrid');
    if (!root) return;
    root.innerHTML = games.map((game) => {
      const download = game.downloads?.find((item) => String(item.type || '').toUpperCase() === 'BAT') || game.downloads?.[0];
      if (!download?.href) return '';
      return `
        <article class="bat-card reveal" data-bat-card data-search="${esc(`${game.name} ${game.short} ${game.platform} ${game.focus}`.toLowerCase())}">
          <div class="bat-head"><div class="bat-icon">${esc(game.short || 'GAME')}</div><div><h3>${esc(game.name)}</h3><small>${esc(game.platform || 'Windows')}</small></div></div>
          <p>${esc(game.description)}</p>
          <div class="bat-tags"><span>Session menu</span><span>Diagnostics</span><span>Logs</span><span>Restore</span></div>
          <div class="bat-actions"><a class="btn btn-primary btn-sm" href="${esc(download.href)}" download>Baixar BAT</a><a class="btn btn-secondary btn-sm" href="index.html?game=${encodeURIComponent(game.id)}#games">Ver perfil</a></div>
        </article>`;
    }).join('');
  }

  function renderModules() {
    optimizers.forEach((item) => {
      const root = document.querySelector(`[data-optimizer-section="${CSS.escape(item.id)}"]`);
      if (!root) return;
      root.innerHTML = `
        <article class="optimizer-card reveal" style="--optimizer-accent:${esc(item.accent || '#b63cff')}">
          <div class="optimizer-head"><div class="optimizer-icon">${esc(item.icon || 'MOD')}</div><div><h3>${esc(item.title)}</h3><small>${esc(item.subtitle || '')}</small></div></div>
          <p>${esc(item.description || '')}</p>
          <div class="feature-list">${(item.features || []).map((feature) => `<span>${esc(feature)}</span>`).join('')}</div>
          <div class="game-actions">${item.href ? `<a class="btn btn-primary btn-sm" href="${esc(item.href)}" download>Baixar módulo</a>` : ''}${item.restore ? `<a class="btn btn-secondary btn-sm" href="${esc(item.restore)}" download>Baixar restore</a>` : ''}</div>
        </article>`;
    });
  }

  function injectGameSearch() {
    const grid = $('#gameBatGrid');
    if (!grid || $('#batSearchInput')) return;
    const bar = document.createElement('div');
    bar.className = 'bat-filter-bar';
    bar.innerHTML = `<label class="bat-search"><span class="sr-only" style="position:absolute;left:-9999px">Pesquisar BAT</span><input id="batSearchInput" type="search" autocomplete="off" placeholder="Pesquisar jogo, plataforma ou perfil..."></label><span class="bat-filter-count" id="batFilterCount" aria-live="polite"></span>`;
    grid.before(bar);
    const input = $('#batSearchInput');
    const update = () => {
      const query = (input?.value || '').toLowerCase().trim();
      let visible = 0;
      $$('[data-bat-card]').forEach((card) => {
        card.hidden = Boolean(query && !(card.dataset.search || '').includes(query));
        if (!card.hidden) visible++;
      });
      const count = $('#batFilterCount');
      if (count) count.textContent = `${visible} ${visible === 1 ? 'script encontrado' : 'scripts encontrados'}`;
    };
    input?.addEventListener('input', update);
    update();
  }

  function initNavigation() {
    const toggle = $('#mobileToggle');
    const menu = $('#mobileMenu');
    toggle?.addEventListener('click', () => {
      const open = menu?.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu?.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        menu.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('click', (event) => {
      if (!menu?.classList.contains('open')) return;
      if (event.target.closest('#mobileMenu,#mobileToggle')) return;
      menu.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu?.classList.contains('open')) {
        menu.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
        toggle?.focus();
      }
    });
  }

  function initReveal() {
    const nodes = $$('.reveal:not(.visible)');
    if (!('IntersectionObserver' in window)) { nodes.forEach((node) => node.classList.add('visible')); return; }
    const observer = new IntersectionObserver((entries, obs) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    }), { threshold:.08, rootMargin:'40px' });
    nodes.forEach((node) => observer.observe(node));
  }

  function initActiveNav() {
    const links = $$('.nav-links a[href^="#"]');
    const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin:'-30% 0px -60% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  $$('.js-version').forEach((el) => el.textContent = data.version || '4.0.0');
  $$('.js-game-count').forEach((el) => el.textContent = games.length);
  renderGameBats();
  renderModules();
  injectGameSearch();
  initNavigation();
  initReveal();
  initActiveNav();
})();