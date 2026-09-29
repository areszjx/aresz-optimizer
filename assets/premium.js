(() => {
  'use strict';

  const FAVORITES_KEY = 'ares_v5_favorites';
  const RECENTS_KEY = 'ares_v5_recents';
  const TOOL_KEY = 'ares_v5_tools';
  const LEGACY_FAVORITES_KEY = 'ares_v4_favorites';
  const LEGACY_RECENTS_KEY = 'ares_v4_recents';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const data = window.ARES_DATA || {};
  const games = Array.isArray(data.games) ? data.games : [];
  const optimizers = Array.isArray(data.optimizers) ? data.optimizers : [];
  let lastModalTrigger = null;
  let activePaletteIndex = 0;

  const readJson = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };
  const writeJson = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  function migrateList(currentKey, legacyKey) {
    const current = readJson(currentKey, null);
    if (Array.isArray(current)) return current;
    const legacy = readJson(legacyKey, []);
    const valid = Array.isArray(legacy) ? legacy : [];
    writeJson(currentKey, valid);
    return valid;
  }

  let favorites = migrateList(FAVORITES_KEY, LEGACY_FAVORITES_KEY).filter((id) => games.some((game) => game.id === id)).slice(0, 8);
  let recents = migrateList(RECENTS_KEY, LEGACY_RECENTS_KEY).filter((id) => games.some((game) => game.id === id)).slice(0, 6);

  function toast(message, tone = 'success') {
    let el = $('#premiumToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'premiumToast';
      el.className = 'premium-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.dataset.tone = tone;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(window.__aresPremiumToast);
    window.__aresPremiumToast = setTimeout(() => el.classList.remove('show'), 1900);
  }

  async function copyText(text, successMessage = 'Copiado') {
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
      toast(successMessage);
      return true;
    } catch {
      toast('Não foi possível copiar automaticamente.', 'error');
      return false;
    }
  }

  function updateUrlGame(id) {
    const url = new URL(location.href);
    if (id) url.searchParams.set('game', id);
    else url.searchParams.delete('game');
    if (id) url.hash = 'games';
    else if (url.hash === '#games') url.hash = '';
    history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function injectReleaseRail() {
    const header = $('.site-header');
    if (!header || $('#aresReleaseRail')) return;
    const rail = document.createElement('div');
    rail.id = 'aresReleaseRail';
    rail.className = 'ares-release-rail';
    rail.innerHTML = `
      <div class="shell ares-release-inner">
        <div class="release-copy"><span class="release-badge">REMASTER</span><strong>ARES Experience 5</strong><span>UI refinada • navegação corrigida • estados persistentes</span></div>
        <div class="release-status"><i></i><span id="aresNetworkState">verificando conexão</span></div>
      </div>`;
    header.insertAdjacentElement('afterend', rail);
    const state = $('#aresNetworkState');
    const sync = () => {
      const online = navigator.onLine;
      rail.dataset.online = online ? '1' : '0';
      if (state) state.textContent = online ? 'online' : 'offline';
    };
    addEventListener('online', sync);
    addEventListener('offline', sync);
    sync();
  }

  function injectSearchButton() {
    const actions = $('.nav-actions');
    if (!actions || $('#globalSearchBtn')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-secondary btn-sm nav-search-btn desktop-only';
    button.id = 'globalSearchBtn';
    button.innerHTML = '<span>Buscar</span><kbd>Ctrl K</kbd>';
    button.addEventListener('click', openPalette);
    actions.prepend(button);
  }

  function buildPalette() {
    if ($('#commandPalette')) return;
    const root = document.createElement('div');
    root.className = 'command-palette';
    root.id = 'commandPalette';
    root.innerHTML = `
      <div class="command-box" role="dialog" aria-modal="true" aria-labelledby="commandTitle">
        <div class="command-search"><span aria-hidden="true">⌕</span><label class="sr-only" id="commandTitle" for="commandInput">Busca global ARES</label><input id="commandInput" type="search" autocomplete="off" placeholder="Buscar jogo, módulo, ferramenta ou seção..."><kbd>ESC</kbd></div>
        <div class="command-results" id="commandResults" role="listbox"></div>
        <div class="command-footer"><span>↑ ↓ navegar • Enter abrir</span><span>AresZ ARES Remaster</span></div>
      </div>`;
    root.addEventListener('mousedown', (event) => { if (event.target === root) closePalette(); });
    document.body.appendChild(root);
    $('#commandInput')?.addEventListener('input', () => { activePaletteIndex = 0; renderPalette(); });
    $('#commandInput')?.addEventListener('keydown', handlePaletteKeys);
    renderPalette();
  }

  function paletteItems() {
    const items = [
      { type:'Seção', icon:'GM', title:'Biblioteca de jogos', subtitle:'Perfis e presets', action:() => jump('#games') },
      { type:'Seção', icon:'OP', title:'Central de otimização', subtitle:'Internet, mouse e teclado', action:() => jump('#optimizers') },
      { type:'Seção', icon:'TL', title:'Performance Lab', subtitle:'eDPI, multiplier e frame time', action:() => jump('#tools') },
      { type:'Seção', icon:'DL', title:'Download Center', subtitle:'Arquivos organizados', action:() => jump('#downloads') },
      { type:'Página', icon:'BAT', title:'BAT Center', subtitle:'Todos os módulos AresZ', action:() => { location.href = 'bats.html'; } },
      { type:'Página', icon:'ADM', title:'Admin', subtitle:'Painel administrativo', action:() => { location.href = 'admin.html'; } }
    ];
    games.forEach((game) => items.push({
      type:'Jogos', icon:game.short || 'GM', title:game.name,
      subtitle:`${game.platform || 'Windows'} • ${game.focus || 'Performance'}`,
      action:() => openGameById(game.id)
    }));
    optimizers.forEach((item) => items.push({
      type:'Módulos', icon:item.icon || 'OP', title:item.title,
      subtitle:item.subtitle || '', action:() => { location.href = `bats.html#${encodeURIComponent(item.id)}`; }
    }));
    return items;
  }

  function renderPalette() {
    const input = $('#commandInput');
    const root = $('#commandResults');
    if (!root) return;
    const query = (input?.value || '').toLowerCase().trim();
    const filtered = paletteItems().filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(query)).slice(0, 16);
    activePaletteIndex = Math.min(activePaletteIndex, Math.max(filtered.length - 1, 0));
    root.__items = filtered;
    if (!filtered.length) {
      root.innerHTML = '<div class="command-empty">Nenhum resultado encontrado.</div>';
      return;
    }
    let lastType = '';
    root.innerHTML = filtered.map((item, index) => {
      const group = item.type !== lastType ? `<div class="command-group-label">${item.type}</div>` : '';
      lastType = item.type;
      return `${group}<button class="command-item ${index === activePaletteIndex ? 'active' : ''}" type="button" role="option" aria-selected="${index === activePaletteIndex}" data-command-index="${index}"><span class="command-item-icon">${item.icon}</span><span><strong>${item.title}</strong><small>${item.subtitle}</small></span></button>`;
    }).join('');
    $$('[data-command-index]', root).forEach((button) => button.addEventListener('click', () => {
      filtered[Number(button.dataset.commandIndex)]?.action();
      closePalette();
    }));
    requestAnimationFrame(() => root.querySelector('.command-item.active')?.scrollIntoView({ block:'nearest' }));
  }

  function handlePaletteKeys(event) {
    const items = $('#commandResults')?.__items || [];
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activePaletteIndex = items.length ? (activePaletteIndex + 1) % items.length : 0;
      renderPalette();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activePaletteIndex = items.length ? (activePaletteIndex - 1 + items.length) % items.length : 0;
      renderPalette();
    } else if (event.key === 'Enter' && items[activePaletteIndex]) {
      event.preventDefault();
      items[activePaletteIndex].action();
      closePalette();
    } else if (event.key === 'Escape') closePalette();
  }

  function openPalette() {
    buildPalette();
    const palette = $('#commandPalette');
    if (!palette) return;
    palette.classList.add('open');
    document.body.classList.add('palette-open');
    activePaletteIndex = 0;
    const input = $('#commandInput');
    if (input) input.value = '';
    renderPalette();
    setTimeout(() => input?.focus(), 20);
  }

  function closePalette() {
    $('#commandPalette')?.classList.remove('open');
    document.body.classList.remove('palette-open');
  }

  function jump(hash) {
    closePalette();
    document.querySelector(hash)?.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function injectFavorites() {
    $$('[data-game-card]').forEach((card) => {
      const open = $('[data-open-game]', card);
      const id = open?.dataset.openGame;
      if (!id || $('.favorite-btn', card)) return;
      const button = document.createElement('button');
      const active = favorites.includes(id);
      button.type = 'button';
      button.className = `favorite-btn ${active ? 'is-favorite' : ''}`;
      button.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.textContent = active ? '★' : '☆';
      card.appendChild(button);
    });
  }

  function refreshFavoriteButtons() {
    $$('.favorite-btn').forEach((button) => {
      const card = button.closest('[data-game-card]');
      const id = $('[data-open-game]', card)?.dataset.openGame;
      const active = favorites.includes(id);
      button.classList.toggle('is-favorite', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
      button.textContent = active ? '★' : '☆';
    });
  }

  function toggleFavorite(id) {
    favorites = favorites.includes(id) ? favorites.filter((item) => item !== id) : [id, ...favorites].slice(0, 8);
    writeJson(FAVORITES_KEY, favorites);
    refreshFavoriteButtons();
    renderPersonalHub();
    toast(favorites.includes(id) ? 'Jogo adicionado aos favoritos' : 'Jogo removido dos favoritos');
  }

  function rememberRecent(id) {
    if (!games.some((game) => game.id === id)) return;
    recents = [id, ...recents.filter((item) => item !== id)].slice(0, 6);
    writeJson(RECENTS_KEY, recents);
    renderPersonalHub();
  }

  function personalCard(id) {
    const game = games.find((item) => item.id === id);
    if (!game) return '';
    return `<button class="personal-card" type="button" data-personal-game="${game.id}"><span class="personal-card-icon">${game.short || 'GM'}</span><span><strong>${game.name}</strong><span>${game.focus || 'Performance'} • ${game.platform || 'Windows'}</span></span></button>`;
  }

  function createPersonalHub() {
    if ($('#personalHub') || !$('#games')) return;
    const section = document.createElement('section');
    section.className = 'personal-hub shell';
    section.id = 'personalHub';
    section.innerHTML = `
      <div class="personal-panel">
        <div class="personal-main"><div class="personal-title-row"><div><div class="eyebrow">MY ARES</div><h3>Seu painel rápido</h3></div><small>preferências locais</small></div><div class="personal-grid" id="favoriteGrid"></div></div>
        <div class="personal-side"><div class="personal-title-row"><div><div class="eyebrow">RECENTES</div><h3>Continue de onde parou</h3></div></div><div class="personal-grid" id="recentGrid"></div><div class="quick-actions"><button class="quick-action" type="button" data-quick="search"><strong>Busca global</strong><span>Ctrl + K</span></button><button class="quick-action" type="button" data-quick="bats"><strong>BAT Center</strong><span>Scripts e restores</span></button></div></div>
      </div>`;
    $('#games').insertAdjacentElement('beforebegin', section);
    section.addEventListener('click', (event) => {
      const game = event.target.closest('[data-personal-game]');
      if (game) openGameById(game.dataset.personalGame);
      const quick = event.target.closest('[data-quick]')?.dataset.quick;
      if (quick === 'search') openPalette();
      if (quick === 'bats') location.href = 'bats.html';
    });
    renderPersonalHub();
  }

  function renderPersonalHub() {
    const favoriteRoot = $('#favoriteGrid');
    const recentRoot = $('#recentGrid');
    if (favoriteRoot) favoriteRoot.innerHTML = favorites.length ? favorites.map(personalCard).join('') : '<div class="personal-empty">Clique em ☆ nos cards para montar seus favoritos.</div>';
    if (recentRoot) recentRoot.innerHTML = recents.length ? recents.map(personalCard).join('') : '<div class="personal-empty">Os últimos perfis abertos aparecerão aqui.</div>';
  }

  function openGameById(id) {
    const button = document.querySelector(`[data-open-game="${CSS.escape(id)}"]`);
    if (!button) {
      jump('#games');
      return;
    }
    lastModalTrigger = button;
    button.click();
    rememberRecent(id);
    updateUrlGame(id);
  }

  function enhanceModal() {
    const modal = $('#gameModal');
    if (!modal) return;
    const observer = new MutationObserver(() => {
      if (!modal.classList.contains('open')) return;
      const title = $('.modal-hero-copy h2', modal)?.textContent?.trim();
      const game = games.find((item) => item.name === title);
      if (!game) return;
      rememberRecent(game.id);
      updateUrlGame(game.id);
      if ($('.modal-share-row', modal)) return;
      const firstCard = $('.modal-card', modal);
      if (!firstCard) return;
      const row = document.createElement('div');
      row.className = 'modal-share-row';
      row.innerHTML = `<span class="modal-profile-status">● perfil carregado</span><button class="btn btn-secondary btn-sm" type="button" data-share-profile="${game.id}">Copiar link</button><button class="btn btn-secondary btn-sm" type="button" data-fav-profile="${game.id}">${favorites.includes(game.id) ? '★ Favorito' : '☆ Favoritar'}</button>`;
      firstCard.appendChild(row);
    });
    observer.observe(modal, { attributes:true, childList:true, subtree:true, attributeFilter:['class'] });
  }

  function closeUrlGame() {
    if (!$('#gameModal')?.classList.contains('open')) {
      updateUrlGame(null);
      setTimeout(() => lastModalTrigger?.focus(), 10);
    }
  }

  function shareProfile(id) {
    const url = new URL(location.href);
    url.searchParams.set('game', id);
    url.hash = 'games';
    copyText(url.toString(), 'Link do perfil copiado');
  }

  function initToolPersistence() {
    const ids = ['dpi', 'sens', 'currentSens', 'multiplier', 'fpsTarget'];
    const saved = readJson(TOOL_KEY, {});
    ids.forEach((id) => {
      const input = $(`#${id}`);
      if (!input) return;
      if (saved[id] !== undefined && saved[id] !== null && saved[id] !== '') {
        input.value = saved[id];
        input.dispatchEvent(new Event('input', { bubbles:true }));
      }
      input.addEventListener('input', () => {
        const next = readJson(TOOL_KEY, {});
        next[id] = input.value;
        writeJson(TOOL_KEY, next);
      });
    });
  }

  function initLibraryCounter() {
    const toolbar = $('.library-toolbar');
    if (!toolbar || $('#libraryResultCount')) return;
    const count = document.createElement('div');
    count.id = 'libraryResultCount';
    count.className = 'library-result-count';
    count.setAttribute('aria-live', 'polite');
    toolbar.insertAdjacentElement('afterend', count);
    const update = () => {
      const visible = $$('[data-game-card]').filter((card) => !card.hidden).length;
      count.textContent = `${visible} ${visible === 1 ? 'perfil encontrado' : 'perfis encontrados'}`;
    };
    const grid = $('#gameGrid');
    if (grid) new MutationObserver(update).observe(grid, { attributes:true, childList:true, subtree:true, attributeFilter:['hidden'] });
    $('#gameSearch')?.addEventListener('input', () => setTimeout(update, 0));
    $('#gameChips')?.addEventListener('click', () => setTimeout(update, 0));
    setTimeout(update, 0);
  }

  function initCardClickTargets() {
    $('#gameGrid')?.addEventListener('click', (event) => {
      if (event.target.closest('button,a,input')) return;
      const card = event.target.closest('[data-game-card]');
      const id = $('[data-open-game]', card)?.dataset.openGame;
      if (id) openGameById(id);
    });
  }

  function initScrollPolish() {
    const header = $('.site-header');
    if (!header) return;
    let back = $('.back-top');
    if (!back) {
      back = document.createElement('button');
      back.type = 'button';
      back.className = 'back-top';
      back.setAttribute('aria-label', 'Voltar ao topo');
      back.textContent = '↑';
      back.addEventListener('click', () => scrollTo({ top:0, behavior:'smooth' }));
      document.body.appendChild(back);
    }
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      header.style.setProperty('--header-progress', `${Math.min(100, Math.max(0, scrollY / max * 100))}%`);
      back.classList.toggle('show', scrollY > 620);
      header.classList.toggle('is-scrolled', scrollY > 18);
    };
    addEventListener('scroll', update, { passive:true });
    update();

    const links = $$('.nav-links a[href^="#"]');
    const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`));
      }, { rootMargin:'-28% 0px -60% 0px', threshold:[0,.1,.4,.7] });
      sections.forEach((section) => observer.observe(section));
    }
  }

  function initMobileMenuFixes() {
    const menu = $('#mobileMenu');
    const toggle = $('#mobileToggle');
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

  function initDeepLink() {
    const id = new URLSearchParams(location.search).get('game');
    if (!id || !games.some((game) => game.id === id)) return;
    setTimeout(() => openGameById(id), 180);
  }

  function initEvents() {
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openPalette();
      }
      if (event.key === 'Escape') {
        closePalette();
        setTimeout(closeUrlGame, 0);
      }
    });
    document.addEventListener('click', (event) => {
      const gameButton = event.target.closest('[data-open-game]');
      if (gameButton) {
        lastModalTrigger = gameButton;
        rememberRecent(gameButton.dataset.openGame);
        updateUrlGame(gameButton.dataset.openGame);
      }
      const favoriteButton = event.target.closest('.favorite-btn');
      if (favoriteButton) {
        event.preventDefault();
        event.stopPropagation();
        const id = $('[data-open-game]', favoriteButton.closest('[data-game-card]'))?.dataset.openGame;
        if (id) toggleFavorite(id);
      }
      const share = event.target.closest('[data-share-profile]');
      if (share) shareProfile(share.dataset.shareProfile);
      const fav = event.target.closest('[data-fav-profile]');
      if (fav) {
        toggleFavorite(fav.dataset.favProfile);
        fav.textContent = favorites.includes(fav.dataset.favProfile) ? '★ Favorito' : '☆ Favoritar';
      }
      if (event.target.closest('[data-close-modal]')) setTimeout(closeUrlGame, 0);
    });
  }

  function init() {
    injectReleaseRail();
    injectSearchButton();
    buildPalette();
    createPersonalHub();
    injectFavorites();
    enhanceModal();
    initToolPersistence();
    initLibraryCounter();
    initCardClickTargets();
    initScrollPolish();
    initMobileMenuFixes();
    initEvents();
    initDeepLink();

    const grid = $('#gameGrid');
    if (grid) new MutationObserver(() => injectFavorites()).observe(grid, { childList:true, subtree:true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();