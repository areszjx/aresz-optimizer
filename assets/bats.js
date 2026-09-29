(() => {
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
      const download = game.downloads?.find((item) => item.type === 'BAT') || game.downloads?.[0];
      if (!download) return '';
      return `
        <article class="bat-card reveal">
          <div class="bat-head"><div class="bat-icon">${esc(game.short)}</div><div><h3>${esc(game.name)}</h3><small>${esc(game.platform)}</small></div></div>
          <p>${esc(game.description)}</p>
          <div class="bat-tags"><span>Session menu</span><span>Diagnostics</span><span>Logs</span><span>Restore</span></div>
          <div class="bat-actions"><a class="btn btn-primary btn-sm" href="${esc(download.href)}" download>Baixar BAT</a><a class="btn btn-secondary btn-sm" href="index.html#games">Ver no Hub</a></div>
        </article>`;
    }).join('');
  }

  function renderModules() {
    optimizers.forEach((item) => {
      const root = document.querySelector(`[data-optimizer-section="${item.id}"]`);
      if (!root) return;
      root.innerHTML = `
        <article class="optimizer-card reveal" style="--optimizer-accent:${esc(item.accent || '#b63cff')}">
          <div class="optimizer-head"><div class="optimizer-icon">${esc(item.icon)}</div><div><h3>${esc(item.title)}</h3><small>${esc(item.subtitle)}</small></div></div>
          <p>${esc(item.description)}</p>
          <div class="feature-list">${(item.features || []).map((feature) => `<span>${esc(feature)}</span>`).join('')}</div>
          <div class="game-actions"><a class="btn btn-primary btn-sm" href="${esc(item.href)}" download>Baixar módulo</a>${item.restore ? `<a class="btn btn-secondary btn-sm" href="${esc(item.restore)}" download>Baixar restore</a>` : ''}</div>
        </article>`;
    });
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
  }

  function initReveal() {
    const nodes = $$('.reveal');
    if (!('IntersectionObserver' in window)) { nodes.forEach((n) => n.classList.add('visible')); return; }
    const observer = new IntersectionObserver((entries, obs) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: '40px' });
    nodes.forEach((node) => observer.observe(node));
  }

  $$('.js-version').forEach((el) => el.textContent = data.version || '4.0.0');
  $$('.js-game-count').forEach((el) => el.textContent = games.length);
  renderGameBats();
  renderModules();
  initNavigation();
  initReveal();
})();
