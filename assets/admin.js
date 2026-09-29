(() => {
  const PREVIEW_KEY = 'ares_v4_preview';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  const DEFAULT = clone(window.ARES_DATA || { brand: {}, categories: [], games: [], optimizers: [], faq: [] });
  let state = clone(DEFAULT);

  try {
    const saved = localStorage.getItem(PREVIEW_KEY);
    if (saved) state = JSON.parse(saved);
  } catch (error) {
    console.warn('[ARES Admin] Preview local inválido', error);
  }

  function toast(message) {
    const el = $('#adminToast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(window.__adminToast);
    window.__adminToast = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function updateStats() {
    $('#statGames').textContent = state.games?.length || 0;
    $('#statDownloads').textContent = (state.games || []).reduce((sum, game) => sum + (game.downloads?.length || 0), 0) + (state.optimizers || []).reduce((sum, item) => sum + (item.href ? 1 : 0) + (item.restore ? 1 : 0), 0);
    $('#statModules').textContent = state.optimizers?.length || 0;
  }

  function fillSiteFields() {
    const brand = state.brand || {};
    $('#brandOwner').value = brand.owner || '';
    $('#brandName').value = brand.name || '';
    $('#brandEyebrow').value = brand.eyebrow || '';
    $('#heroTitleAdmin').value = brand.heroTitle || '';
    $('#heroTextAdmin').value = brand.heroText || '';
    $('#heroNoteAdmin').value = brand.heroNote || '';
    $('#versionAdmin').value = state.version || '4.0.0';
    $('#categoriesAdmin').value = (state.categories || []).map((item) => `${item.id}|${item.label}`).join('\n');
  }

  function readSiteFields() {
    state.brand = state.brand || {};
    state.brand.owner = $('#brandOwner').value.trim();
    state.brand.name = $('#brandName').value.trim();
    state.brand.eyebrow = $('#brandEyebrow').value.trim();
    state.brand.heroTitle = $('#heroTitleAdmin').value.trim();
    state.brand.heroText = $('#heroTextAdmin').value.trim();
    state.brand.heroNote = $('#heroNoteAdmin').value.trim();
    state.version = $('#versionAdmin').value.trim() || '4.0.0';
    state.categories = $('#categoriesAdmin').value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const [id, ...rest] = line.split('|');
      return { id: (id || 'all').trim(), label: (rest.join('|') || id || 'Todos').trim() };
    });
  }

  function gameEditor(game, index) {
    const settings = (game.settings || []).map(([label, value]) => `${label}|${value}`).join('\n');
    const tips = (game.tips || []).join('\n');
    const downloads = (game.downloads || []).map((item) => `${item.label}|${item.type || 'BAT'}|${item.href}`).join('\n');
    return `
      <details class="admin-card" ${index < 2 ? 'open' : ''}>
        <summary><span class="admin-card-title"><span class="admin-card-icon">${esc(game.short || 'GAME')}</span><span>${esc(game.name || 'Novo jogo')}<small>${esc(game.id || 'sem-id')}</small></span></span></summary>
        <div class="admin-card-body">
          <div class="admin-grid-3">
            <label class="admin-label">Nome<input data-game-index="${index}" data-key="name" value="${esc(game.name)}"></label>
            <label class="admin-label">ID<input data-game-index="${index}" data-key="id" value="${esc(game.id)}"></label>
            <label class="admin-label">Código curto<input data-game-index="${index}" data-key="short" value="${esc(game.short)}"></label>
          </div>
          <div class="admin-grid-3">
            <label class="admin-label">Badge<input data-game-index="${index}" data-key="badge" value="${esc(game.badge)}"></label>
            <label class="admin-label">Plataforma<input data-game-index="${index}" data-key="platform" value="${esc(game.platform)}"></label>
            <label class="admin-label">Foco<input data-game-index="${index}" data-key="focus" value="${esc(game.focus)}"></label>
          </div>
          <div class="admin-grid-2">
            <label class="admin-label">Categorias (vírgula)<input data-game-index="${index}" data-key="categories" value="${esc((game.categories || []).join(','))}"></label>
            <label class="admin-label">URL oficial<input data-game-index="${index}" data-key="official" value="${esc(game.official)}"></label>
          </div>
          <label class="admin-label">Imagem / cover URL<input data-game-index="${index}" data-key="image" value="${esc(game.image)}"></label>
          <label class="admin-label">Fallback de capa (CSS gradient)<input data-game-index="${index}" data-key="cover" value="${esc(game.cover)}"></label>
          <label class="admin-label">Descrição<textarea data-game-index="${index}" data-key="description">${esc(game.description)}</textarea></label>
          <div class="admin-grid-2">
            <label class="admin-label">Configurações (Nome|Valor)<textarea data-game-index="${index}" data-key="settings">${esc(settings)}</textarea></label>
            <label class="admin-label">Dicas (uma por linha)<textarea data-game-index="${index}" data-key="tips">${esc(tips)}</textarea></label>
          </div>
          <label class="admin-label">Downloads (Nome|Tipo|Caminho)<textarea data-game-index="${index}" data-key="downloads">${esc(downloads)}</textarea></label>
          <div class="admin-card-actions"><button class="btn btn-secondary btn-sm" type="button" data-duplicate-game="${index}">Duplicar</button><button class="btn btn-sm danger-button" type="button" data-remove-game="${index}">Remover</button></div>
        </div>
      </details>`;
  }

  function renderGames() {
    const root = $('#gamesEditor');
    if (!root) return;
    root.innerHTML = (state.games || []).map(gameEditor).join('') || '<div class="admin-empty">Nenhum jogo cadastrado.</div>';
  }

  function moduleEditor(item, index) {
    return `
      <details class="admin-card" open>
        <summary><span class="admin-card-title"><span class="admin-card-icon">${esc(item.icon || 'MOD')}</span><span>${esc(item.title || 'Módulo')}<small>${esc(item.id || '')}</small></span></span></summary>
        <div class="admin-card-body">
          <div class="admin-grid-3"><label class="admin-label">ID<input data-module-index="${index}" data-key="id" value="${esc(item.id)}"></label><label class="admin-label">Ícone<input data-module-index="${index}" data-key="icon" value="${esc(item.icon)}"></label><label class="admin-label">Cor<input data-module-index="${index}" data-key="accent" value="${esc(item.accent)}"></label></div>
          <div class="admin-grid-2"><label class="admin-label">Título<input data-module-index="${index}" data-key="title" value="${esc(item.title)}"></label><label class="admin-label">Subtítulo<input data-module-index="${index}" data-key="subtitle" value="${esc(item.subtitle)}"></label></div>
          <label class="admin-label">Descrição<textarea data-module-index="${index}" data-key="description">${esc(item.description)}</textarea></label>
          <label class="admin-label">Recursos (um por linha)<textarea data-module-index="${index}" data-key="features">${esc((item.features || []).join('\n'))}</textarea></label>
          <div class="admin-grid-2"><label class="admin-label">BAT principal<input data-module-index="${index}" data-key="href" value="${esc(item.href)}"></label><label class="admin-label">Restore<input data-module-index="${index}" data-key="restore" value="${esc(item.restore)}"></label></div>
        </div>
      </details>`;
  }

  function renderModules() {
    const root = $('#modulesEditor');
    if (!root) return;
    root.innerHTML = (state.optimizers || []).map(moduleEditor).join('') || '<div class="admin-empty">Nenhum módulo cadastrado.</div>';
  }

  function syncJson() {
    $('#jsonAdmin').value = JSON.stringify(state, null, 2);
    updateStats();
  }

  function renderAll() {
    fillSiteFields();
    renderGames();
    renderModules();
    syncJson();
  }

  function readGameInput(input) {
    const index = Number(input.dataset.gameIndex);
    const game = state.games?.[index];
    if (!game) return;
    const key = input.dataset.key;
    const value = input.value;
    if (key === 'categories') game.categories = value.split(',').map((item) => item.trim()).filter(Boolean);
    else if (key === 'settings') game.settings = value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => { const [label, ...rest] = line.split('|'); return [(label || '').trim(), rest.join('|').trim()]; });
    else if (key === 'tips') game.tips = value.split('\n').map((line) => line.trim()).filter(Boolean);
    else if (key === 'downloads') game.downloads = value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => { const [label, type, ...rest] = line.split('|'); return { label: (label || 'Download').trim(), type: (type || 'BAT').trim(), href: rest.join('|').trim() }; });
    else game[key] = value;
    syncJson();
  }

  function readModuleInput(input) {
    const index = Number(input.dataset.moduleIndex);
    const item = state.optimizers?.[index];
    if (!item) return;
    const key = input.dataset.key;
    item[key] = key === 'features' ? input.value.split('\n').map((line) => line.trim()).filter(Boolean) : input.value;
    syncJson();
  }

  function savePreview() {
    readSiteFields();
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(state));
    syncJson();
    toast('Preview local salvo');
  }

  function exportJson() {
    readSiteFields();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ares-site-v${state.version || '4'}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    toast('JSON exportado');
  }

  function importJsonObject(object) {
    if (!object || typeof object !== 'object' || !Array.isArray(object.games)) throw new Error('Estrutura inválida: games não encontrado.');
    state = object;
    renderAll();
    toast('Configuração importada');
  }

  document.addEventListener('input', (event) => {
    if (event.target.matches('[data-game-index][data-key]')) readGameInput(event.target);
    if (event.target.matches('[data-module-index][data-key]')) readModuleInput(event.target);
  });

  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-admin-tab]');
    if (tab) {
      $$('.admin-tab').forEach((item) => item.classList.toggle('active', item === tab));
      $$('.admin-view').forEach((view) => view.hidden = view.dataset.adminView !== tab.dataset.adminTab);
    }
    const remove = event.target.closest('[data-remove-game]');
    if (remove) {
      const index = Number(remove.dataset.removeGame);
      if (confirm(`Remover ${state.games[index]?.name || 'este jogo'} do preview?`)) {
        state.games.splice(index, 1); renderGames(); syncJson(); toast('Jogo removido');
      }
    }
    const duplicate = event.target.closest('[data-duplicate-game]');
    if (duplicate) {
      const original = clone(state.games[Number(duplicate.dataset.duplicateGame)]);
      original.id = `${original.id}-copy`;
      original.name = `${original.name} Copy`;
      state.games.push(original); renderGames(); syncJson(); toast('Jogo duplicado');
    }
  });

  $('#applySiteBtn')?.addEventListener('click', () => { readSiteFields(); syncJson(); toast('Dados do site aplicados'); });
  $('#savePreviewBtn')?.addEventListener('click', savePreview);
  $('#previewBtn')?.addEventListener('click', () => { savePreview(); window.open('index.html?preview=1', '_blank', 'noopener'); });
  $('#exportBtn')?.addEventListener('click', exportJson);
  $('#copyJsonBtn')?.addEventListener('click', async () => {
    readSiteFields();
    const text = JSON.stringify(state, null, 2);
    try { await navigator.clipboard.writeText(text); toast('JSON copiado'); }
    catch { $('#jsonAdmin').select(); document.execCommand('copy'); toast('JSON copiado'); }
  });
  $('#applyJsonBtn')?.addEventListener('click', () => {
    try { importJsonObject(JSON.parse($('#jsonAdmin').value)); }
    catch (error) { alert(`JSON inválido: ${error.message}`); }
  });
  $('#importBtn')?.addEventListener('click', () => $('#importFile')?.click());
  $('#importFile')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { importJsonObject(JSON.parse(await file.text())); }
    catch (error) { alert(`Não foi possível importar: ${error.message}`); }
    event.target.value = '';
  });
  $('#resetBtn')?.addEventListener('click', () => {
    if (!confirm('Restaurar o preview para a configuração publicada atual?')) return;
    localStorage.removeItem(PREVIEW_KEY); state = clone(DEFAULT); renderAll(); toast('Preview restaurado');
  });
  $('#addGameBtn')?.addEventListener('click', () => {
    state.games = state.games || [];
    state.games.push({ id:`novo-jogo-${state.games.length + 1}`, name:'Novo Jogo', short:'NEW', badge:'Game Profile', categories:['fps'], platform:'Windows', focus:'Performance', image:'', cover:'linear-gradient(135deg,#7c3aed,#111827)', description:'Descrição do novo perfil.', official:'', settings:[['V-Sync','Off']], tips:['Adicione uma dica.'], downloads:[] });
    renderGames(); syncJson(); toast('Novo jogo adicionado');
  });

  $$('.js-version').forEach((el) => el.textContent = state.version || '4.0.0');
  renderAll();
})();
