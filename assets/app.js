(() => {
  'use strict';
  const PREVIEW_KEY = 'ares_v4_preview';
  const params = new URLSearchParams(location.search);
  const previewMode = params.get('preview') === '1';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  let data = clone(window.ARES_DATA || {});

  if (previewMode) {
    try {
      const saved = localStorage.getItem(PREVIEW_KEY);
      if (saved) data = JSON.parse(saved);
    } catch (error) {
      console.warn('[ARES] Preview inválido:', error);
    }
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const cssUrl = (value = '') => String(value).replace(/["'()\\\n\r;]/g, '').trim();
  const brand = data.brand || {};
  const games = Array.isArray(data.games) ? data.games.filter(Boolean) : [];
  const optimizers = Array.isArray(data.optimizers) ? data.optimizers.filter(Boolean) : [];
  const categories = Array.isArray(data.categories) && data.categories.length ? data.categories : [{ id:'all', label:'Todos' }];
  let activeCategory = categories.some((item) => item.id === 'all') ? 'all' : categories[0]?.id || 'all';

  function toast(message, tone = 'success') {
    let el = $('#siteToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'siteToast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:220;padding:11px 14px;border:1px solid #315b46;background:#101820;color:#8ff2b9;border-radius:12px;font-size:11px;font-weight:850;box-shadow:0 20px 60px #0008';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.borderColor = tone === 'error' ? '#65303a' : '#315b46';
    el.style.color = tone === 'error' ? '#ff9dab' : '#8ff2b9';
    el.hidden = false;
    clearTimeout(window.__aresToast);
    window.__aresToast = setTimeout(() => { el.hidden = true; }, 1800);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      return true;
    } catch { return false; }
  }

  function bootBrand() {
    const heroTitle = $('#heroTitle');
    if (heroTitle) {
      heroTitle.innerHTML = brand.heroTitle || 'ARES Performance Hub';
      const emphasized = heroTitle.querySelector('span');
      if (emphasized) emphasized.classList.add('gradient-text');
    }
    const heroText = $('#heroText');
    const heroEyebrow = $('#heroEyebrow');
    const heroNote = $('#heroNote');
    if (heroText) heroText.textContent = brand.heroText || '';
    if (heroEyebrow) heroEyebrow.textContent = brand.eyebrow || 'ARES PERFORMANCE HUB';
    if (heroNote) heroNote.textContent = brand.heroNote || '';
    $$('.js-version').forEach((el) => el.textContent = data.version || '4.0.0');
    $$('.js-game-count').forEach((el) => el.textContent = games.length);
    const downloads = games.reduce((total, game) => total + (game.downloads?.filter((item) => item?.href).length || 0), 0) + optimizers.reduce((total, item) => total + (item.href ? 1 : 0) + (item.restore ? 1 : 0), 0);
    $$('.js-download-count').forEach((el) => el.textContent = downloads);
  }

  function renderChips() {
    const root = $('#gameChips');
    if (!root) return;
    root.innerHTML = categories.map((category) => `<button class="chip ${category.id === activeCategory ? 'active' : ''}" type="button" data-category="${esc(category.id)}">${esc(category.label)}</button>`).join('');
  }

  function gameBackground(game) {
    const fallback = game.cover || 'linear-gradient(135deg,#29143b,#111827)';
    return game.image ? `${fallback}, url('${cssUrl(game.image)}')` : fallback;
  }

  function primaryBat(game) {
    return (game.downloads || []).find((item) => item?.href && String(item.type || '').toUpperCase() === 'BAT') || (game.downloads || []).find((item) => item?.href) || null;
  }

  function gameCard(game) {
    const bat = primaryBat(game);
    return `
      <article class="game-card reveal" data-game-card data-search="${esc(`${game.name} ${game.short} ${game.badge} ${game.platform} ${game.focus}`.toLowerCase())}" data-categories="${esc((game.categories || []).join(','))}">
        <div class="game-cover" style="background-image:${gameBackground(game)}">
          ${game.image ? '' : `<div class="game-cover-art" aria-hidden="true">${esc(game.short || 'GM')}</div>`}
          <div class="game-cover-meta"><strong>${esc(game.name)}</strong><span class="game-badge">${esc(game.badge || 'Game Profile')}</span></div>
        </div>
        <div class="game-body">
          <p>${esc(game.description || '')}</p>
          <div class="meta-pills"><span class="meta-pill">${esc(game.focus || 'Performance')}</span><span class="meta-pill">${esc(game.platform || 'Windows')}</span></div>
          <div class="game-actions"><button class="btn btn-primary btn-sm" type="button" data-open-game="${esc(game.id)}">Ver perfil</button>${bat ? `<a class="btn btn-secondary btn-sm" href="${esc(bat.href)}" download>${esc(String(bat.type || '').toUpperCase() === 'BAT' ? 'BAT' : 'Download')}</a>` : ''}</div>
        </div>
      </article>`;
  }

  function renderGames() {
    const grid = $('#gameGrid');
    if (!grid) return;
    grid.innerHTML = games.map(gameCard).join('') || '<div class="empty-state">Nenhum perfil cadastrado.</div>';
    filterGames();
    initReveal();
  }

  function filterGames() {
    const query = ($('#gameSearch')?.value || '').toLowerCase().trim();
    let visible = 0;
    $$('[data-game-card]').forEach((card) => {
      const cardCategories = (card.dataset.categories || '').split(',').filter(Boolean);
      const categoryOk = activeCategory === 'all' || cardCategories.includes(activeCategory);
      const queryOk = !query || (card.dataset.search || '').includes(query);
      card.hidden = !(categoryOk && queryOk);
      if (!card.hidden) visible++;
    });
    const grid = $('#gameGrid');
    let empty = $('#gameEmpty');
    if (!visible && grid) {
      if (!empty) {
        empty = document.createElement('div');
        empty.id = 'gameEmpty';
        empty.className = 'empty-state';
        empty.textContent = 'Nenhum jogo encontrado com esse filtro.';
        grid.appendChild(empty);
      }
      empty.hidden = false;
    } else if (empty) empty.hidden = true;
  }

  function renderOptimizers() {
    const grid = $('#optimizerGrid');
    if (!grid) return;
    grid.innerHTML = optimizers.map((item) => `
      <article class="optimizer-card reveal" style="--optimizer-accent:${esc(item.accent || '#b63cff')}">
        <div class="optimizer-head"><div class="optimizer-icon">${esc(item.icon || 'MOD')}</div><div><h3>${esc(item.title || 'Módulo ARES')}</h3><small>${esc(item.subtitle || '')}</small></div></div>
        <p>${esc(item.description || '')}</p>
        <div class="feature-list">${(item.features || []).map((feature) => `<span>${esc(feature)}</span>`).join('')}</div>
        <div class="game-actions">${item.href ? `<a class="btn btn-primary btn-sm" href="${esc(item.href)}" download>Baixar módulo</a>` : ''}${item.restore ? `<a class="btn btn-secondary btn-sm" href="${esc(item.restore)}" download>Restore</a>` : `<a class="btn btn-secondary btn-sm" href="bats.html#${esc(item.id || '')}">Detalhes</a>`}</div>
      </article>`).join('');
    initReveal();
  }

  function renderDownloads() {
    const grid = $('#downloadGrid');
    if (!grid) return;
    const items = [];
    games.forEach((game) => (game.downloads || []).filter((item) => item?.href).forEach((download) => items.push({ title:game.name, subtitle:download.label, type:download.type || 'FILE', href:download.href })));
    optimizers.forEach((item) => { if (item.href) items.push({ title:item.title, subtitle:item.subtitle, type:'BAT', href:item.href }); });
    grid.innerHTML = items.slice(0, 8).map((item) => `<a class="download-item reveal" href="${esc(item.href)}" download><span class="file-badge">${esc(item.type)}</span><span><strong>${esc(item.title)}</strong><small>${esc(item.subtitle)}</small></span><span class="download-arrow" aria-hidden="true">↓</span></a>`).join('') || '<div class="empty-state">Nenhum download disponível.</div>';
    initReveal();
  }

  function renderFaq() {
    const root = $('#faqList');
    if (!root) return;
    root.innerHTML = (data.faq || []).map(([question, answer], index) => `<details ${index === 0 ? 'open' : ''}><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('');
  }

  function openGame(id) {
    const game = games.find((item) => item.id === id);
    const modal = $('#gameModal');
    const content = $('#gameModalContent');
    if (!game || !modal || !content) return;
    const downloads = (game.downloads || []).filter((item) => item?.href);
    content.innerHTML = `
      <div class="modal-hero" style="background-image:${gameBackground(game)}">${game.image ? '' : `<div class="modal-hero-art" aria-hidden="true">${esc(game.short || 'GM')}</div>`}<div class="modal-hero-copy"><h2>${esc(game.name)}</h2><div class="modal-tags"><span>${esc(game.badge || 'Game Profile')}</span><span>${esc(game.focus || 'Performance')}</span><span>${esc(game.platform || 'Windows')}</span></div></div></div>
      <div class="modal-content">
        <section class="modal-card"><h3>Perfil ARES</h3><p class="muted">${esc(game.description || '')}</p><div class="modal-actions">${game.official ? `<a class="btn btn-secondary btn-sm" href="${esc(game.official)}" target="_blank" rel="noopener noreferrer">Site oficial ↗</a>` : ''}${downloads.map((download) => `<a class="btn btn-primary btn-sm" href="${esc(download.href)}" download>${esc(download.label || 'Download')}</a>`).join('')}</div></section>
        <section class="modal-card"><h3>Configurações recomendadas</h3><div class="setting-list">${(game.settings || []).map(([label,value]) => `<div class="setting-row"><span>${esc(label)}</span><span>${esc(value)}</span></div>`).join('') || '<div class="tip-row">Sem configurações cadastradas.</div>'}</div></section>
        <section class="modal-card"><h3>Notas de uso</h3><div class="tip-list">${(game.tips || []).map((tip) => `<div class="tip-row">${esc(tip)}</div>`).join('') || '<div class="tip-row">Sem notas cadastradas.</div>'}</div></section>
        <section class="modal-card"><h3>Resumo rápido</h3><div class="setting-list"><div class="setting-row"><span>Categoria</span><span>${esc((game.categories || []).join(' / ') || '—')}</span></div><div class="setting-row"><span>Plataforma</span><span>${esc(game.platform || 'Windows')}</span></div><div class="setting-row"><span>Foco</span><span>${esc(game.focus || 'Performance')}</span></div></div><div class="modal-actions"><button class="btn btn-secondary btn-sm" type="button" data-copy-preset="${esc(game.id)}">Copiar preset</button></div></section>
      </div>`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.modal-close', modal)?.focus();
  }

  function closeModal() {
    const modal = $('#gameModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  async function copyPreset(id) {
    const game = games.find((item) => item.id === id);
    if (!game) return;
    const text = `${game.name} — ARES preset\n${(game.settings || []).map(([label,value]) => `${label}: ${value}`).join('\n')}`;
    toast(await copyText(text) ? 'Preset copiado' : 'Não foi possível copiar', (await Promise.resolve(true)) ? 'success' : 'error');
  }

  function initTools() {
    const dpi = $('#dpi'), sens = $('#sens'), edpi = $('#edpi');
    const currentSens = $('#currentSens'), multiplier = $('#multiplier'), convertedSens = $('#convertedSens');
    const fps = $('#fpsTarget'), frameTime = $('#frameTime');
    const calcEdpi = () => { if (edpi) { const result=(+dpi?.value||0)*(+sens?.value||0); edpi.textContent=Number.isFinite(result)?result.toFixed(2).replace(/\.00$/,''):'0'; } };
    const calcSens = () => { if (convertedSens) { const result=(+currentSens?.value||0)*(+multiplier?.value||0); convertedSens.textContent=Number.isFinite(result)?result.toFixed(4).replace(/0+$/,'').replace(/\.$/,''):'0'; } };
    const calcFrame = () => { if (frameTime) { const target=+fps?.value||0; frameTime.textContent=target>0?`${(1000/target).toFixed(2)} ms`:'—'; } };
    [dpi,sens].forEach((el)=>el?.addEventListener('input',calcEdpi));
    [currentSens,multiplier].forEach((el)=>el?.addEventListener('input',calcSens));
    fps?.addEventListener('input',calcFrame);
    calcEdpi(); calcSens(); calcFrame();
  }

  function initNavigation() {
    const toggle = $('#mobileToggle'), menu = $('#mobileMenu');
    toggle?.addEventListener('click', () => { const open=menu?.classList.toggle('open'); toggle.setAttribute('aria-expanded',open?'true':'false'); });
    menu?.addEventListener('click', (event) => { if (event.target.closest('a')) { menu.classList.remove('open'); toggle?.setAttribute('aria-expanded','false'); } });
  }

  function initReveal() {
    const nodes = $$('.reveal:not(.visible)');
    if (!('IntersectionObserver' in window)) { nodes.forEach((node)=>node.classList.add('visible')); return; }
    const observer = new IntersectionObserver((entries,obs)=>entries.forEach((entry)=>{ if(entry.isIntersecting){entry.target.classList.add('visible');obs.unobserve(entry.target);} }),{threshold:.08,rootMargin:'40px'});
    nodes.forEach((node)=>observer.observe(node));
  }

  document.addEventListener('click', (event) => {
    const gameButton = event.target.closest('[data-open-game]');
    if (gameButton) openGame(gameButton.dataset.openGame);
    if (event.target.closest('[data-close-modal]')) closeModal();
    const copy = event.target.closest('[data-copy-preset]');
    if (copy) copyPreset(copy.dataset.copyPreset);
    const chip = event.target.closest('[data-category]');
    if (chip) {
      activeCategory = chip.dataset.category;
      $$('#gameChips .chip').forEach((item)=>item.classList.toggle('active',item===chip));
      filterGames();
    }
  });
  $('#gameSearch')?.addEventListener('input', filterGames);
  document.addEventListener('keydown', (event) => { if(event.key==='Escape') closeModal(); });

  bootBrand();
  renderChips();
  renderGames();
  renderOptimizers();
  renderDownloads();
  renderFaq();
  initTools();
  initNavigation();
  initReveal();

  if (previewMode) {
    const banner=document.createElement('div');
    banner.textContent='PREVIEW LOCAL — alterações do Admin visíveis apenas neste navegador';
    banner.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:190;background:#271533;border:1px solid #744596;color:#f1cfff;padding:9px 13px;border-radius:999px;font-size:10px;font-weight:900;letter-spacing:.06em;box-shadow:0 15px 50px #0008';
    document.body.appendChild(banner);
  }
})();