(() => {
  const FAVORITES_KEY = 'ares_v4_favorites';
  const RECENTS_KEY = 'ares_v4_recents';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const data = window.ARES_DATA || {};
  const games = Array.isArray(data.games) ? data.games : [];
  const optimizers = Array.isArray(data.optimizers) ? data.optimizers : [];

  const readList = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  };
  const saveList = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  let favorites = readList(FAVORITES_KEY);
  let recents = readList(RECENTS_KEY);

  function toast(message) {
    let el = $('#premiumToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'premiumToast';
      el.style.cssText = 'position:fixed;right:18px;bottom:72px;z-index:300;padding:11px 14px;border:1px solid #315b46;background:#101820;color:#8ff2b9;border-radius:12px;font-size:12px;font-weight:800;box-shadow:0 20px 60px #0008;transition:.2s';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.hidden = false;
    clearTimeout(window.__premiumToast);
    window.__premiumToast = setTimeout(() => { el.hidden = true; }, 1600);
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
      <div class="command-box" role="dialog" aria-modal="true" aria-label="Busca global ARES">
        <div class="command-search"><span>⌕</span><input id="commandInput" type="search" autocomplete="off" placeholder="Buscar jogo, módulo, ferramenta ou seção..."><kbd>ESC</kbd></div>
        <div class="command-results" id="commandResults"></div>
        <div class="command-footer"><span>↑ ↓ navegar • Enter abrir</span><span>AresZ ARES</span></div>
      </div>`;
    root.addEventListener('mousedown', (e) => { if (e.target === root) closePalette(); });
    document.body.appendChild(root);
    $('#commandInput')?.addEventListener('input', renderPalette);
    $('#commandInput')?.addEventListener('keydown', handlePaletteKeys);
    renderPalette();
  }

  const paletteItems = () => {
    const items = [
      { type:'Seção', icon:'GM', title:'Biblioteca de jogos', subtitle:'Todos os perfis disponíveis', action:() => jump('#games') },
      { type:'Seção', icon:'OP', title:'Central de otimização', subtitle:'Internet, mouse e teclado', action:() => jump('#optimizers') },
      { type:'Seção', icon:'TL', title:'Ferramentas', subtitle:'eDPI, multiplier e frame time', action:() => jump('#tools') },
      { type:'Seção', icon:'DL', title:'Download Center', subtitle:'Arquivos organizados', action:() => jump('#downloads') },
      { type:'Página', icon:'BAT', title:'BAT Center', subtitle:'Todos os otimizadores AresZ', action:() => location.href='bats.html' },
      { type:'Página', icon:'ADM', title:'Admin', subtitle:'Editor local da configuração', action:() => location.href='admin.html' }
    ];
    games.forEach((game) => items.push({ type:'Jogos', icon:game.short || 'GM', title:game.name, subtitle:`${game.platform} • ${game.focus}`, action:() => openGameById(game.id) }));
    optimizers.forEach((item) => items.push({ type:'Módulos', icon:item.icon || 'OP', title:item.title, subtitle:item.subtitle || '', action:() => location.href = item.href || `bats.html#${item.id}` }));
    return items;
  };

  let activePaletteIndex = 0;
  function renderPalette() {
    const input = $('#commandInput');
    const root = $('#commandResults');
    if (!root) return;
    const q = (input?.value || '').toLowerCase().trim();
    const filtered = paletteItems().filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(q)).slice(0, 14);
    activePaletteIndex = Math.min(activePaletteIndex, Math.max(filtered.length - 1, 0));
    if (!filtered.length) { root.innerHTML = '<div class="command-empty">Nenhum resultado encontrado.</div>'; return; }
    let lastType = '';
    root.innerHTML = filtered.map((item, i) => {
      const label = item.type !== lastType ? `<div class="command-group-label">${item.type}</div>` : '';
      lastType = item.type;
      return `${label}<button class="command-item ${i === activePaletteIndex ? 'active' : ''}" type="button" data-command-index="${i}"><span class="command-item-icon">${item.icon}</span><span><strong>${item.title}</strong><small>${item.subtitle}</small></span></button>`;
    }).join('');
    $$('[data-command-index]', root).forEach((button) => button.addEventListener('click', () => {
      filtered[+button.dataset.commandIndex]?.action(); closePalette();
    }));
    root.__items = filtered;
  }

  function handlePaletteKeys(e) {
    const root = $('#commandResults');
    const items = root?.__items || [];
    if (e.key === 'ArrowDown') { e.preventDefault(); activePaletteIndex = Math.min(activePaletteIndex + 1, items.length - 1); renderPalette(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); activePaletteIndex = Math.max(activePaletteIndex - 1, 0); renderPalette(); }
    if (e.key === 'Enter' && items[activePaletteIndex]) { e.preventDefault(); items[activePaletteIndex].action(); closePalette(); }
    if (e.key === 'Escape') closePalette();
  }
  function openPalette(){ $('#commandPalette')?.classList.add('open'); setTimeout(() => $('#commandInput')?.focus(), 20); }
  function closePalette(){ $('#commandPalette')?.classList.remove('open'); }
  function jump(hash){ closePalette(); document.querySelector(hash)?.scrollIntoView({behavior:'smooth', block:'start'}); }

  function injectFavorites() {
    $$('[data-game-card]').forEach((card) => {
      if ($('.favorite-btn', card)) return;
      const open = $('[data-open-game]', card);
      const id = open?.dataset.openGame;
      if (!id) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `favorite-btn ${favorites.includes(id) ? 'is-favorite' : ''}`;
      button.setAttribute('aria-label', favorites.includes(id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
      button.textContent = favorites.includes(id) ? '★' : '☆';
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(id);
      });
      card.appendChild(button);
    });
  }

  function toggleFavorite(id) {
    favorites = favorites.includes(id) ? favorites.filter((x) => x !== id) : [id, ...favorites].slice(0, 6);
    saveList(FAVORITES_KEY, favorites);
    injectFavoritesRefresh();
    renderPersonalHub();
    toast(favorites.includes(id) ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  }
  function injectFavoritesRefresh(){ $$('.favorite-btn').forEach((b) => b.remove()); injectFavorites(); }

  function rememberRecent(id) {
    recents = [id, ...recents.filter((x) => x !== id)].slice(0, 4);
    saveList(RECENTS_KEY, recents);
    renderPersonalHub();
  }

  function openGameById(id) {
    const button = document.querySelector(`[data-open-game="${CSS.escape(id)}"]`);
    if (button) {
      button.click();
      rememberRecent(id);
      history.replaceState(null, '', `${location.pathname}?game=${encodeURIComponent(id)}#games`);
    } else {
      jump('#games');
      setTimeout(() => document.querySelector(`[data-open-game="${CSS.escape(id)}"]`)?.click(), 250);
    }
  }

  function createPersonalHub() {
    if ($('#personalHub')) return;
    const target = $('.trust-strip')?.parentElement;
    if (!target) return;
    const section = document.createElement('section');
    section.className = 'personal-hub';
    section.id = 'personalHub';
    section.innerHTML = '<div class="personal-panel"><div class="personal-main"><div class="personal-title-row"><div><div class="eyebrow">MY ARES</div><h3>Seu acesso rápido</h3></div><small>salvo localmente neste navegador</small></div><div class="personal-grid" id="favoriteGrid"></div></div><div class="personal-side"><div class="personal-title-row"><div><div class="eyebrow">RECENTES</div><h3>Continue de onde parou</h3></div></div><div class="personal-grid" id="recentGrid"></div><div class="quick-actions"><button class="quick-action" type="button" data-quick="search"><strong>Busca global</strong><span>Ctrl + K</span></button><button class="quick-action" type="button" data-quick="bats"><strong>BAT Center</strong><span>Todos os módulos AresZ</span></button></div></div></div>';
    target.appendChild(section);
    section.addEventListener('click', (e) => {
      const card = e.target.closest('[data-personal-game]');
      if (card) openGameById(card.dataset.personalGame);
      const quick = e.target.closest('[data-quick]');
      if (quick?.dataset.quick === 'search') openPalette();
      if (quick?.dataset.quick === 'bats') location.href = 'bats.html';
    });
    renderPersonalHub();
  }

  function personalCard(id) {
    const game = games.find((g) => g.id === id);
    if (!game) return '';
    return `<button class="personal-card" type="button" data-personal-game="${game.id}"><span class="personal-card-icon">${game.short || 'GM'}</span><span><strong>${game.name}</strong><span>${game.focus} • ${game.platform}</span></span></button>`;
  }

  function renderPersonalHub() {
    const favRoot = $('#favoriteGrid');
    const recentRoot = $('#recentGrid');
    if (favRoot) favRoot.innerHTML = favorites.length ? favorites.map(personalCard).join('') : '<div class="personal-empty">Marque jogos com ☆ para criar seus atalhos favoritos.</div>';
    if (recentRoot) recentRoot.innerHTML = recents.length ? recents.map(personalCard).join('') : '<div class="personal-empty">Os perfis que você abrir aparecerão aqui.</div>';
  }

  function enhanceModal() {
    const modal = $('#gameModal');
    if (!modal) return;
    const observer = new MutationObserver(() => {
      if (!modal.classList.contains('open')) return;
      const h2 = $('.modal-hero-copy h2', modal);
      const game = games.find((g) => g.name === h2?.textContent?.trim());
      if (!game) return;
      rememberRecent(game.id);
      if ($('.modal-share-row', modal)) return;
      const card = $('.modal-card', modal);
      if (!card) return;
      const row = document.createElement('div');
      row.className = 'modal-share-row';
      row.innerHTML = `<span class="modal-profile-status">● perfil carregado</span><button class="btn btn-secondary btn-sm" type="button" data-share-profile="${game.id}">Copiar link</button><button class="btn btn-secondary btn-sm" type="button" data-fav-profile="${game.id}">${favorites.includes(game.id) ? '★ Favorito' : '☆ Favoritar'}</button>`;
      card.appendChild(row);
    });
    observer.observe(modal, {attributes:true, childList:true, subtree:true, attributeFilter:['class']});
  }

  function shareProfile(id) {
    const url = `${location.origin}${location.pathname}?game=${encodeURIComponent(id)}#games`;
    navigator.clipboard?.writeText(url).then(() => toast('Link do perfil copiado')).catch(() => toast(url));
  }

  function initScrollPolish() {
    const header = $('.site-header');
    const back = document.createElement('button');
    back.type = 'button'; back.className = 'back-top'; back.setAttribute('aria-label', 'Voltar ao topo'); back.textContent = '↑';
    back.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
    document.body.appendChild(back);

    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      const pct = Math.min(100, Math.max(0, scrollY / max * 100));
      header?.style.setProperty('--header-progress', `${pct}%`);
      back.classList.toggle('show', scrollY > 650);
    };
    addEventListener('scroll', update, {passive:true}); update();

    const links = $$('.nav-links a[href^="#"]');
    const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, {rootMargin:'-35% 0px -55% 0px', threshold:0});
    sections.forEach((s) => observer.observe(s));
  }

  function initDeepLink() {
    const id = new URLSearchParams(location.search).get('game');
    if (!id || !games.some((g) => g.id === id)) return;
    setTimeout(() => openGameById(id), 120);
  }

  function initEvents() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
      if (e.key === 'Escape') closePalette();
    });
    document.addEventListener('click', (e) => {
      const game = e.target.closest('[data-open-game]');
      if (game) rememberRecent(game.dataset.openGame);
      const share = e.target.closest('[data-share-profile]');
      if (share) shareProfile(share.dataset.shareProfile);
      const fav = e.target.closest('[data-fav-profile]');
      if (fav) { toggleFavorite(fav.dataset.favProfile); fav.textContent = favorites.includes(fav.dataset.favProfile) ? '★ Favorito' : '☆ Favoritar'; }
    });
  }

  function init() {
    injectSearchButton();
    buildPalette();
    createPersonalHub();
    injectFavorites();
    enhanceModal();
    initScrollPolish();
    initEvents();
    initDeepLink();

    const grid = $('#gameGrid');
    if (grid) new MutationObserver(() => injectFavorites()).observe(grid, {childList:true, subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
