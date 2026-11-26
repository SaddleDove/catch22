(function () {
  'use strict';

  var THEMES = window.THEMES;
  var I = window.ICONS.svg;
  var B = window.ICONS.brand;
  var app = document.getElementById('app');
  var faviconEl = document.getElementById('favicon');
  var KEY = 'assistant-index.v1';

  var theme = null;
  var menuEl = null;
  var state = load();
  var stream = { token: 0, timer: null, busy: false };

  function q(sel) { return app.querySelector(sel); }
  function qa(sel) { return Array.prototype.slice.call(app.querySelectorAll(sel)); }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function blankState() {
    var s = { chats: {}, models: {} };
    ['chatgpt', 'claude', 'deepseek', 'gemini'].forEach(function (id) {
      s.chats[id] = { list: [], currentId: null };
    });
    return s;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blankState();
      var s = JSON.parse(raw);
      if (!s || !s.chats) return blankState();
      var base = blankState();
      Object.keys(base.chats).forEach(function (id) {
        if (s.chats[id] && Array.isArray(s.chats[id].list)) {
          base.chats[id] = s.chats[id];
        }
      });
      base.models = s.models || {};
      base.last = s.last || null;
      return base;
    } catch (e) {
      return blankState();
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  function bucket() { return state.chats[theme.id]; }

  function getChat(b) {
    if (!b.currentId) return null;
    for (var i = 0; i < b.list.length; i++) {
      if (b.list[i].id === b.currentId) return b.list[i];
    }
    return null;
  }

  function ensureChat(b) {
    var c = getChat(b);
    if (!c) {
      c = { id: uid(), title: '', messages: [], updated: Date.now() };
      b.list.unshift(c);
      b.currentId = c.id;
    }
    return c;
  }

  /* ----------------------------------------------------------------- open */

  function faviconFor(t) {
    var svg;
    if (t.id === 'gemini') {
      svg = B.geminiMono
        .replace(/currentColor/g, 'url(#g)')
        .replace(/ aria-hidden="true"/g, '')
        .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
        .replace('>', '><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#4285f4"/><stop offset=".45" stop-color="#9b72cb"/>' +
          '<stop offset=".78" stop-color="#d96570"/><stop offset="1" stop-color="#f49c46"/>' +
          '</linearGradient></defs>');
    } else {
      svg = t.logo.replace(/currentColor/g, t.faviconColor).replace(/ aria-hidden="true"/g, '');
      if (svg.indexOf('xmlns') === -1) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function open(id) {
    theme = THEMES[id];
    if (!theme) { open('chatgpt'); return; }

    closeMenu();
    state.last = id;
    save();
    document.documentElement.dataset.theme = id;
    document.title = theme.docTitle;
    faviconEl.href = faviconFor(theme);

    app.className = 'app chat theme-' + id;
    app.innerHTML = theme.shell();
    app.dataset.sidebar = window.matchMedia('(max-width: 860px)').matches ? 'closed' : 'open';

    bindTheme();
    renderHeaderTitle();
    renderSidebar();
    renderThread(true);
    updateSendMode();

    setTimeout(function () {
      var input = q('[data-input]');
      if (input) input.focus({ preventScroll: true });
    }, 40);
  }

  function bindTheme() {
    var input = q('[data-input]');
    if (input) {
      input.addEventListener('input', function () { autosize(input); updateSendMode(); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
          e.preventDefault();
          send();
        }
      });
    }

    var sendBtn = q('[data-send]');
    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        if (stream.busy) { stop(); } else { send(); }
      });
    }

    qa('[data-sb-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        app.dataset.sidebar = app.dataset.sidebar === 'open' ? 'closed' : 'open';
      });
    });

    qa('[data-new-chat]').forEach(function (b) {
      b.addEventListener('click', newChat);
    });

    qa('[data-account]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        openAccountMenu(b);
      });
    });

    qa('[data-models]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (theme.modelMenu) openModelMenu(b);
      });
    });

    qa('[data-suggest]').forEach(function (b) {
      b.addEventListener('click', function () {
        var field = q('[data-input]');
        if (!field) return;
        field.value = b.getAttribute('data-suggest');
        autosize(field);
        updateSendMode();
        field.focus();
      });
    });

    qa('[data-toggle-chip]').forEach(function (b) {
      b.addEventListener('click', function () { b.classList.toggle('on'); });
    });

    var thread = q('[data-thread]');
    if (thread) thread.addEventListener('click', onThreadClick);

    applyModelLabel();
  }

  function applyModelLabel() {
    var label = q('[data-model-label]');
    if (label && theme && state.models[theme.id]) label.textContent = state.models[theme.id];
  }

  /* -------------------------------------------------------------- messages */

  function fmt(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  function actionsHTML(isAI, index) {
    var html = '<button class="act-btn" data-copy="' + index + '" title="Copy">' + I.copy + '</button>';
    if (isAI) {
      html += '<button class="act-btn" data-vote="up" title="Good response">' + I.thumbUp + '</button>';
      html += '<button class="act-btn flip" data-vote="down" title="Bad response">' + I.thumbUp + '</button>';
      html += '<button class="act-btn" data-regen="' + index + '" title="Regenerate">' + I.refresh + '</button>';
    }
    return '<div class="msg-actions">' + html + '</div>';
  }

  function messageHTML(m, i, total) {
    var last = i === total - 1 ? ' is-last' : '';
    if (m.role === 'user') {
      return '<div class="msg msg-user' + last + '" data-i="' + i + '">' +
        '<div class="msg-col">' +
          '<div class="bubble">' + fmt(m.text) + '</div>' +
          actionsHTML(false, i) +
        '</div>' +
      '</div>';
    }
    var body;
    if (m.pending) {
      body = '<div class="msg-body"><span class="thinking"><i></i><i></i><i></i></span></div>';
    } else if (m.streaming) {
      body = '<div class="msg-body" data-stream>' + fmt(m.text) + '</div>';
    } else {
      body = '<div class="msg-body">' + fmt(m.text) + '</div>';
    }
    return '<div class="msg msg-ai' + last + '" data-i="' + i + '">' +
      (theme.avatar ? '<div class="ai-avatar">' + theme.avatar + '</div>' : '') +
      '<div class="msg-col">' + body + actionsHTML(true, i) + '</div>' +
    '</div>';
  }

  function renderThread(forceBottom) {
    if (!theme) return;
    var threadEl = q('[data-thread]');
    var inner = q('[data-thread-inner]');
    var stage = q('[data-stage]');
    if (!threadEl || !inner || !stage) return;

    var b = bucket();
    var chat = getChat(b);
    var msgs = chat ? chat.messages : [];
    var nearBottom = threadEl.scrollHeight - threadEl.scrollTop - threadEl.clientHeight < 160;

    stage.classList.toggle('is-empty', msgs.length === 0);
    inner.innerHTML = msgs.map(function (m, i) { return messageHTML(m, i, msgs.length); }).join('');

    if (forceBottom || nearBottom) {
      threadEl.scrollTop = threadEl.scrollHeight;
    }
  }

  function renderSidebar() {
    var el = q('[data-recents]');
    if (!el || !theme) return;
    var b = bucket();
    var chats = b.list.slice().sort(function (a, c) { return c.updated - a.updated; });
    el.innerHTML = chats.length ? theme.renderRecents(chats, b.currentId) : '';
    el.querySelectorAll('[data-chat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        b.currentId = btn.getAttribute('data-chat');
        save();
        renderSidebar();
        renderHeaderTitle();
        renderThread(true);
        var input = q('[data-input]');
        if (input) input.focus({ preventScroll: true });
      });
    });
  }

  function renderHeaderTitle() {
    if (!theme) return;
    var el = q('[data-conv-title]');
    if (!el) return;
    var chat = getChat(bucket());
    if (chat && chat.title) {
      el.textContent = chat.title;
    } else {
      el.textContent = theme.id === 'gemini' ? 'Gemini' : theme.id === 'claude' ? 'New chat' : 'New chat';
    }
  }

  /* --------------------------------------------------------------- sending */

  function autosize(field) {
    field.style.height = 'auto';
    field.style.height = Math.min(field.scrollHeight, 180) + 'px';
  }

  function isNearBottom() {
    var t = q('[data-thread]');
    if (!t) return true;
    return t.scrollHeight - t.scrollTop - t.clientHeight < 160;
  }

  function scrollDown() {
    var t = q('[data-thread]');
    if (t) t.scrollTop = t.scrollHeight;
  }

  function send() {
    if (!theme || stream.busy) return;
    var input = q('[data-input]');
    var text = input.value.trim();
    if (!text) return;

    var b = bucket();
    var chat = ensureChat(b);
    chat.messages.push({ role: 'user', text: text });
    if (!chat.title) chat.title = text.replace(/\s+/g, ' ').slice(0, 54);
    chat.updated = Date.now();

    input.value = '';
    autosize(input);
    stream.busy = true;
    updateSendMode();
    save();
    renderSidebar();
    renderHeaderTitle();
    renderThread(true);

    var msg = { role: 'assistant', text: '', pending: true };
    chat.messages.push(msg);
    renderThread(true);
    generate(chat, msg, text);
  }

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  /* Greetings, thanks and small talk get a normal answer. Requests get a refusal. */
  function draftReply(text, chat) {
    var v = theme.voice;
    var t = String(text).toLowerCase().trim().replace(/[\s!?.,]+$/, '');
    var nays = chat.nays || 0;

    if (/^(thanks|thank you|thx|ty|thank u)\b/.test(t)) {
      return { text: pick(v.thanks), refusal: false };
    }
    if (/^(bye|goodbye|see you|good night|goodnight|night,? then)\b/.test(t)) {
      return { text: v.bye, refusal: false };
    }
    if (/^(sorry|my bad|apologies)\b/.test(t)) {
      return { text: v.sorry, refusal: false };
    }
    if (/\b(how are you|how's it going|how are things|how is your day)\b/.test(t)) {
      return { text: v.howAreYou, refusal: false };
    }
    if (/^(who are you|what are you|what's your name|what is your name|which model)\b/.test(t)) {
      return { text: v.identity, refusal: false };
    }
    if (/\b(what can you do|what do you do|how do you work|are you real)\b/.test(t)) {
      return { text: v.capabilities, refusal: false };
    }

    var tasky = /(can you|could you|would you|please|write|make|build|create|explain|help me|translate|summari[sz]e|code|fix|design|plan|draw|tell me|generate|find|calculate|solve)/.test(t);
    if (!tasky && t.length <= 48 && /^(hi|hello|hey|yo|sup|hiya|howdy|greetings|good (morning|afternoon|evening))\b/.test(t)) {
      return { text: pick(v.greetings), refusal: false };
    }

    if (nays >= 3 && Math.random() < 0.72) return { text: pick(v.escalation), refusal: true };
    if (Math.random() < 0.08) return { text: v.breakLine, refusal: true };
    if (/\b(please|pls)\b/.test(t) && Math.random() < 0.5) return { text: v.polite, refusal: true };
    if (/^why\b/.test(t) && Math.random() < 0.5) return { text: v.why, refusal: true };
    if (text.length > 180 && Math.random() < 0.4) return { text: v.long, refusal: true };
    return { text: pick(v.refusals), refusal: true };
  }

  function generate(chat, msg, prompt) {
    var token = ++stream.token;
    var out = draftReply(prompt, chat);
    chat.nays = out.refusal ? (chat.nays || 0) + 1 : 0;

    msg.pending = true;
    msg.streaming = false;
    msg.text = '';
    stream.busy = true;
    updateSendMode();
    renderThread(true);

    var thinkFor = 560 + Math.random() * 780;

    stream.timer = setTimeout(function () {
      if (token !== stream.token) return;

      var full = out.text;
      msg.pending = false;
      msg.streaming = true;
      renderThread(true);

      var target = q('[data-stream]');
      var i = 0;

      (function step() {
        if (token !== stream.token) return;
        i = Math.min(full.length, i + 1 + Math.floor(Math.random() * 3));
        msg.text = full.slice(0, i);
        if (target) target.textContent = msg.text;
        if (isNearBottom()) scrollDown();
        if (i < full.length) {
          stream.timer = setTimeout(step, 16 + Math.random() * 34);
        } else {
          complete(chat, msg);
        }
      })();
    }, thinkFor);
  }

  function complete(chat, msg) {
    msg.pending = false;
    msg.streaming = false;
    chat.updated = Date.now();
    stream.busy = false;
    save();
    updateSendMode();
    renderThread(true);
    var input = q('[data-input]');
    if (input) input.focus({ preventScroll: true });
  }

  function stop() {
    stream.token++;
    if (stream.timer) clearTimeout(stream.timer);
    stream.busy = false;

    var chat = getChat(bucket());
    if (chat) {
      var last = chat.messages[chat.messages.length - 1];
      if (last && last.role === 'assistant' && (last.pending || last.streaming)) {
        last.pending = false;
        last.streaming = false;
        if (!last.text) last.text = 'No.';
      }
      chat.updated = Date.now();
    }
    save();
    updateSendMode();
    renderThread(true);
    var input = q('[data-input]');
    if (input) input.focus({ preventScroll: true });
  }

  function updateSendMode() {
    var btn = q('[data-send]');
    var input = q('[data-input]');
    if (!btn) return;
    btn.innerHTML = stream.busy ? I.stop : I.arrowUp;
    btn.classList.toggle('is-stop', stream.busy);
    btn.disabled = stream.busy ? false : !(input && input.value.trim());
    btn.title = stream.busy ? 'Stop generating' : 'Send';
  }

  function newChat() {
    if (stream.busy) stop();
    var b = bucket();
    var current = getChat(b);
    if (current && current.messages.length === 0) {
      b.list = b.list.filter(function (c) { return c.id !== current.id; });
    }
    b.currentId = null;
    save();
    renderSidebar();
    renderHeaderTitle();
    renderThread(true);
    var input = q('[data-input]');
    if (input) { input.value = ''; autosize(input); input.focus(); }
    updateSendMode();
  }

  /* ---------------------------------------------------------------- thread */

  function onThreadClick(e) {
    var copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      var ci = Number(copyBtn.getAttribute('data-copy'));
      var cchat = getChat(bucket());
      if (!cchat || !cchat.messages[ci]) return;
      copyText(cchat.messages[ci].text, function () {
        var old = copyBtn.innerHTML;
        copyBtn.innerHTML = I.check;
        copyBtn.classList.add('on');
        setTimeout(function () { copyBtn.innerHTML = old; copyBtn.classList.remove('on'); }, 1400);
      });
      return;
    }

    var vote = e.target.closest('[data-vote]');
    if (vote) {
      var row = vote.parentElement;
      row.querySelectorAll('[data-vote]').forEach(function (b) {
        if (b !== vote) b.classList.remove('on');
      });
      vote.classList.toggle('on');
      return;
    }

    var regen = e.target.closest('[data-regen]');
    if (regen) {
      var chat = getChat(bucket());
      if (!chat || stream.busy) return;
      var idx = Number(regen.getAttribute('data-regen'));
      var promptFor = '';
      for (var i = idx - 1; i >= 0; i--) {
        if (chat.messages[i].role === 'user') { promptFor = chat.messages[i].text; break; }
      }
      if (!promptFor) return;
      generate(chat, chat.messages[idx], promptFor);
    }
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text); done(); });
    } else {
      legacyCopy(text);
      done();
    }
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ----------------------------------------------------------------- menus */

  function positionMenu(el, anchor) {
    var r = anchor.getBoundingClientRect();
    var mw = el.offsetWidth;
    var mh = el.offsetHeight;
    var left = Math.min(Math.max(10, r.left), window.innerWidth - mw - 10);
    var below = r.bottom + 8;
    var top = below + mh > window.innerHeight - 10 ? Math.max(10, r.top - mh - 8) : below;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }

  function openMenu(anchor, build) {
    closeMenu();
    var el = document.createElement('div');
    el.className = 'menu';
    el.setAttribute('data-theme', theme.id);
    el.innerHTML = build();
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    positionMenu(el, anchor);
    el.style.visibility = '';
    menuEl = el;
    el.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  function closeMenu() {
    if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl);
    menuEl = null;
  }

  function openAccountMenu(anchor) {
    var order = ['chatgpt', 'claude', 'deepseek', 'gemini'];
    var colors = { chatgpt: '#ececec', claude: '#d97757', deepseek: '#4d6bfe', gemini: '#8ab4f8' };

    var assistants = order.map(function (id) {
      var t = THEMES[id];
      return '<button class="menu-item menu-assistant" data-switch-theme="' + id + '">' +
        '<span class="menu-brand" style="color:' + colors[id] + '">' + t.logo +
          '<span>' + t.name + '</span></span>' +
        (id === theme.id ? '<span class="menu-k">' + I.check + '</span>' : '') +
      '</button>';
    }).join('');

    openMenu(anchor,
      '<div class="menu-user"><span class="avatar">B</span>' +
        '<div><strong>Bow Arkwright</strong><span>bow@arkwright.dev</span></div></div>' +
      '<button class="menu-item">Settings</button>' +
      '<button class="menu-item">Language<span class="menu-k">English</span></button>' +
      '<button class="menu-item">Get help</button>' +
      '<div class="menu-sep"></div>' +
      '<div class="menu-head">Switch assistant</div>' +
      assistants +
      '<div class="menu-sep"></div>' +
      '<button class="menu-item">Log out</button>'
    );

    menuEl.querySelectorAll('[data-switch-theme]').forEach(function (b) {
      b.addEventListener('click', function () {
        switchTo(b.getAttribute('data-switch-theme'));
      });
    });
  }

  function switchTo(id) {
    closeMenu();
    if (!THEMES[id] || !theme || id === theme.id) return;
    history.replaceState(null, '', '#/' + id);
    open(id);
  }

  function openModelMenu(anchor) {
    var current = state.models[theme.id] || theme.modelMenu[0];
    var items = theme.modelMenu.map(function (name) {
      var on = name === current;
      return '<button class="menu-item" data-model="' + name + '">' + name +
        (on ? '<span class="menu-k">' + I.check + '</span>' : '') + '</button>';
    }).join('');

    openMenu(anchor, '<div class="menu-head">Model</div>' + items);

    menuEl.querySelectorAll('[data-model]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.models[theme.id] = b.getAttribute('data-model');
        save();
        qa('[data-model-label]').forEach(function (label) { label.textContent = state.models[theme.id]; });
        closeMenu();
      });
    });
  }

  document.addEventListener('click', function () { closeMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (menuEl) { closeMenu(); return; }
      if (theme && stream.busy) stop();
    }
  });

  /* ----------------------------------------------------------------- boot */

  function route() {
    var id = (location.hash || '').replace(/^#\/?/, '');
    if (THEMES[id]) {
      open(id);
    } else if (state.last && THEMES[state.last]) {
      open(state.last);
    } else {
      open('chatgpt');
    }
  }

  window.addEventListener('hashchange', route);
  route();
})();
