(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let dirty = false;

  function ensureIndicator() {
    const actions = $('.admin-actions');
    if (!actions || $('#adminDirtyState')) return;
    const badge = document.createElement('span');
    badge.id = 'adminDirtyState';
    badge.className = 'admin-dirty-state';
    badge.innerHTML = '<i></i><span>Sincronizado</span>';
    actions.prepend(badge);
  }

  function setDirty(value) {
    dirty = Boolean(value);
    const badge = $('#adminDirtyState');
    if (!badge) return;
    badge.classList.toggle('is-dirty', dirty);
    const text = $('span', badge);
    if (text) text.textContent = dirty ? 'Alterações locais' : 'Sincronizado';
  }

  function injectEditorTools() {
    const view = $('[data-admin-view="games"]');
    const head = $('.admin-section-head', view);
    if (!head || $('#adminGameSearch')) return;
    const tools = document.createElement('div');
    tools.className = 'admin-remaster-tools';
    tools.innerHTML = `
      <label class="admin-remaster-search"><span class="sr-only">Pesquisar jogo no Admin</span><input id="adminGameSearch" type="search" placeholder="Filtrar jogos..."></label>
      <button class="btn btn-secondary btn-sm" id="collapseGamesBtn" type="button">Recolher</button>
      <button class="btn btn-secondary btn-sm" id="expandGamesBtn" type="button">Expandir</button>`;
    head.insertAdjacentElement('afterend', tools);

    const filter = () => {
      const query = ($('#adminGameSearch')?.value || '').toLowerCase().trim();
      $$('#gamesEditor .admin-card').forEach((card) => {
        card.hidden = Boolean(query && !card.textContent.toLowerCase().includes(query));
      });
    };
    $('#adminGameSearch')?.addEventListener('input', filter);
    $('#collapseGamesBtn')?.addEventListener('click', () => $$('#gamesEditor .admin-card').forEach((card) => card.open = false));
    $('#expandGamesBtn')?.addEventListener('click', () => $$('#gamesEditor .admin-card').forEach((card) => card.open = true));
  }

  function initShortcuts() {
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        $('#savePreviewBtn')?.click();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        $('#previewBtn')?.click();
      }
    });
  }

  function initDirtyTracking() {
    document.addEventListener('input', (event) => {
      if (event.target.closest('#adminApp') && !event.target.matches('#adminGameSearch')) setDirty(true);
    });
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-remove-game],[data-duplicate-game],#addGameBtn,#applySiteBtn,#applyJsonBtn')) setDirty(true);
      if (event.target.closest('#savePreviewBtn,#resetBtn')) setTimeout(() => setDirty(false), 0);
    });
    addEventListener('beforeunload', (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    });
  }

  function injectKeyboardHint() {
    const notice = $('.admin-notice');
    if (!notice || $('.admin-shortcuts', notice)) return;
    const hint = document.createElement('span');
    hint.className = 'admin-shortcuts';
    hint.innerHTML = '<kbd>Ctrl S</kbd> salvar preview <kbd>Ctrl P</kbd> abrir preview';
    notice.appendChild(hint);
  }

  function init() {
    ensureIndicator();
    injectEditorTools();
    injectKeyboardHint();
    initShortcuts();
    initDirtyTracking();
    setDirty(false);

    const games = $('#gamesEditor');
    if (games) new MutationObserver(() => injectEditorTools()).observe(games, { childList:true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();