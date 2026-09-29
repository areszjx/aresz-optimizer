(() => {
  'use strict';

  const USERNAME = 'aresz';
  const PASSWORD_SHA256 = 'e246d545820a803742b042fb9106ccab818165797a0e808281e7738300ac7cbb';
  const SESSION_KEY = 'ares_admin_authenticated';
  const FAIL_KEY = 'ares_admin_fail_count';
  const LOCK_KEY = 'ares_admin_lock_until';
  const MAX_ATTEMPTS = 5;
  const LOCK_MS = 30_000;

  const $ = (selector) => document.querySelector(selector);

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function isLocked() {
    return Date.now() < Number(localStorage.getItem(LOCK_KEY) || 0);
  }

  function remainingSeconds() {
    return Math.max(0, Math.ceil((Number(localStorage.getItem(LOCK_KEY) || 0) - Date.now()) / 1000));
  }

  function setStatus(message, type = '') {
    const el = $('#adminLoginStatus');
    if (!el) return;
    el.textContent = message;
    el.dataset.type = type;
  }

  function unlock() {
    document.body.classList.remove('admin-locked');
    document.body.classList.add('admin-authenticated');
    const gate = $('#adminLoginGate');
    const app = $('#adminApp');
    if (gate) gate.hidden = true;
    if (app) {
      app.hidden = false;
      app.setAttribute('aria-hidden', 'false');
    }
  }

  function lock() {
    document.body.classList.add('admin-locked');
    document.body.classList.remove('admin-authenticated');
    const gate = $('#adminLoginGate');
    const app = $('#adminApp');
    if (gate) gate.hidden = false;
    if (app) {
      app.hidden = true;
      app.setAttribute('aria-hidden', 'true');
    }
  }

  function refreshLockMessage() {
    if (!isLocked()) return false;
    const seconds = remainingSeconds();
    setStatus(`Muitas tentativas. Tente novamente em ${seconds}s.`, 'error');
    const submit = $('#adminLoginSubmit');
    if (submit) submit.disabled = true;
    return true;
  }

  function startLockTimer() {
    const submit = $('#adminLoginSubmit');
    if (submit) submit.disabled = true;
    const timer = setInterval(() => {
      if (!isLocked()) {
        clearInterval(timer);
        localStorage.removeItem(FAIL_KEY);
        localStorage.removeItem(LOCK_KEY);
        if (submit) submit.disabled = false;
        setStatus('Bloqueio encerrado. Você pode tentar novamente.', 'success');
        return;
      }
      refreshLockMessage();
    }, 500);
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (isLocked()) {
      refreshLockMessage();
      startLockTimer();
      return;
    }

    const username = ($('#adminUsername')?.value || '').trim().toLowerCase();
    const password = $('#adminPassword')?.value || '';
    const submit = $('#adminLoginSubmit');
    if (submit) submit.disabled = true;
    setStatus('Verificando acesso…');

    try {
      const passwordHash = await sha256(password);
      const valid = username === USERNAME && passwordHash === PASSWORD_SHA256;

      if (valid) {
        sessionStorage.setItem(SESSION_KEY, '1');
        localStorage.removeItem(FAIL_KEY);
        localStorage.removeItem(LOCK_KEY);
        setStatus('Acesso autorizado.', 'success');
        setTimeout(unlock, 180);
        return;
      }

      const failures = Number(localStorage.getItem(FAIL_KEY) || 0) + 1;
      localStorage.setItem(FAIL_KEY, String(failures));
      const remaining = MAX_ATTEMPTS - failures;

      if (remaining <= 0) {
        localStorage.setItem(LOCK_KEY, String(Date.now() + LOCK_MS));
        localStorage.setItem(FAIL_KEY, '0');
        refreshLockMessage();
        startLockTimer();
      } else {
        setStatus(`Usuário ou senha inválidos. ${remaining} tentativa(s) restante(s).`, 'error');
      }
    } catch (error) {
      console.error('[ARES Admin Auth]', error);
      setStatus('Não foi possível validar o acesso neste navegador.', 'error');
    } finally {
      if (submit && !isLocked()) submit.disabled = false;
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    const password = $('#adminPassword');
    if (password) password.value = '';
    setStatus('Sessão encerrada.');
    lock();
    setTimeout(() => $('#adminUsername')?.focus(), 50);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('#adminLoginForm');
    form?.addEventListener('submit', handleLogin);
    $('#adminLogoutBtn')?.addEventListener('click', logout);

    const toggle = $('#toggleAdminPassword');
    toggle?.addEventListener('click', () => {
      const input = $('#adminPassword');
      if (!input) return;
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      toggle.textContent = visible ? 'Mostrar' : 'Ocultar';
      toggle.setAttribute('aria-pressed', visible ? 'false' : 'true');
    });

    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      unlock();
    } else {
      lock();
      if (refreshLockMessage()) startLockTimer();
      setTimeout(() => $('#adminUsername')?.focus(), 100);
    }
  });
})();
