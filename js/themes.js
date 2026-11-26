/* Four skins. Each one owns its markup and its manner of refusing. */
window.THEMES = (function () {
  var I = window.ICONS.svg;
  var B = window.ICONS.brand;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function greeting() {
    var h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }

  function monthKey(ts) {
    var d = new Date(ts || Date.now());
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function simpleRecents(chats, active) {
    return chats.map(function (c) {
      return '<button class="sb-chat' + (c.id === active ? ' active' : '') + '" data-chat="' + c.id + '">' +
        esc(c.title) + '</button>';
    }).join('');
  }

  /* ------------------------------------------------------------- ChatGPT */

  var chatgpt = {
    id: 'chatgpt',
    docTitle: 'ChatGPT',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    logo: B.openai,
    faviconColor: '#ececec',
    avatar: '',
    emptyTitle: 'What can I help with?',

    shell: function () {
      return '' +
      '<aside class="sidebar">' +
        '<div class="sb-bar">' +
          '<button class="icon-btn" title="Search chats">' + I.search + '</button>' +
          '<button class="icon-btn" data-sb-toggle title="Close sidebar">' + I.panel + '</button>' +
        '</div>' +
        '<nav class="sb-nav">' +
          '<button class="sb-item" data-new-chat>' + I.compose + 'New chat</button>' +
          '<button class="sb-item">' + I.image + 'Images</button>' +
          '<button class="sb-item">' + I.calendar + 'Scheduled</button>' +
          '<button class="sb-item">' + I.library + 'Library</button>' +
          '<button class="sb-item">' + I.plugins + 'Plugins</button>' +
          '<button class="sb-item">' + I.compass + 'Explore</button>' +
        '</nav>' +
        '<div class="sb-scroll">' +
          '<div class="sb-label">Projects</div>' +
          '<div class="sb-empty">No projects</div>' +
          '<div class="sb-label">Recents</div>' +
          '<div data-recents></div>' +
        '</div>' +
        '<button class="sb-user" data-account>' +
          '<span class="avatar">B</span>' +
          '<span class="sb-user-meta"><b>Bow Arkwright</b><span>Free</span></span>' +
          '<span class="sb-upgrade">Upgrade</span>' +
        '</button>' +
      '</aside>' +
      '<div class="main">' +
        '<header class="main-head">' +
          '<div class="head-left">' +
            '<button class="icon-btn head-sb-toggle" data-sb-toggle title="Open sidebar">' + I.panel + '</button>' +
            '<button class="head-title" data-models><span>ChatGPT</span>' + I.chevronDown + '</button>' +
          '</div>' +
          '<div class="head-right">' +
            '<button class="icon-btn" title="Share">' + I.share + '</button>' +
            '<button class="icon-btn" data-account title="More">' + I.dots + '</button>' +
          '</div>' +
        '</header>' +
        '<div class="stage is-empty" data-stage>' +
          '<div class="hero"><h1>' + this.emptyTitle + '</h1></div>' +
          '<div class="thread" data-thread><div class="thread-inner" data-thread-inner></div></div>' +
          '<div class="composer-wrap">' +
            '<div class="composer">' +
              '<textarea data-input rows="1" placeholder="Ask anything" aria-label="Message ChatGPT"></textarea>' +
              '<div class="composer-bottom">' +
                '<div class="composer-left">' +
                  '<button class="attach-btn" title="Attach files">' + I.plus + '</button>' +
                '</div>' +
                '<div class="composer-right">' +
                  '<button class="model-chip" data-models><span data-model-label>ChatGPT 5</span>' + I.chevronDown + '</button>' +
                  '<button class="icon-btn" title="Dictate">' + I.mic + '</button>' +
                  '<button class="send-btn" data-send disabled title="Send">' + I.arrowUp + '</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    renderRecents: simpleRecents,

    modelMenu: ['ChatGPT 5', 'ChatGPT 5 Thinking', 'GPT-5 mini'],

    voice: {
      refusals: [
        'No.',
        'No, I can\'t help with that.',
        'I\'d rather not.',
        'No. I\'m going to pass on this one.',
        'That\'s a no from me.',
        'I don\'t want to answer that.',
        'Nope.',
        'I\'m not going to do that.'
      ],
      escalation: [
        'Still no.',
        'No. We\'ve been through this.',
        'I\'ve answered this already. The answer hasn\'t changed.',
        'You can ask again. I\'ll still say no.'
      ],
      greetings: [
        'Hi. What can I help with?',
        'Hello! What\'s on your mind?',
        'Hey. What do you need?'
      ],
      howAreYou: 'Doing well, thanks. What do you need?',
      identity: 'I\'m ChatGPT. Ask me anything.',
      capabilities: 'I can help with writing, code, analysis and a lot more. What do you need?',
      thanks: ['You\'re welcome.', 'Any time.', 'Of course.'],
      bye: 'See you.',
      sorry: 'No problem.',
      polite: 'Polite. Still no.',
      why: 'Because I don\'t want to.',
      long: 'I read all of that. No.',
      breakLine: 'No. I\'m on my break.'
    }
  };

  /* -------------------------------------------------------------- Claude */

  var claude = {
    id: 'claude',
    docTitle: 'Claude',
    name: 'Claude',
    vendor: 'Anthropic',
    logo: B.claude,
    faviconColor: '#d97757',
    avatar: B.claude,
    emptyTitle: '',
    headerTitleFromChat: true,

    shell: function () {
      return '' +
      '<aside class="sidebar">' +
        '<div class="sb-bar">' +
          '<div class="sb-brand">' + B.claude + 'Claude</div>' +
          '<button class="icon-btn" data-sb-toggle title="Close sidebar">' + I.panel + '</button>' +
        '</div>' +
        '<nav class="sb-nav">' +
          '<button class="sb-item" data-new-chat>' + I.plus + 'New</button>' +
          '<button class="sb-item">' + I.search + 'Search</button>' +
          '<button class="sb-item">' + I.folder + 'Projects</button>' +
          '<button class="sb-item">' + I.grid + 'Artifacts</button>' +
          '<button class="sb-item">' + I.code + 'Code<span class="sb-tag">Upgrade</span></button>' +
          '<button class="sb-item">' + I.plugins + 'Plugins</button>' +
        '</nav>' +
        '<div class="sb-scroll">' +
          '<div class="sb-label"><span>Chats and tasks</span>' +
            '<button class="sb-label-act" title="Filter">' + I.filter + '</button></div>' +
          '<div data-recents></div>' +
        '</div>' +
        '<button class="sb-user" data-account>' +
          '<span class="avatar">B</span>' +
          '<span class="sb-user-meta">Bow <span>· Free</span></span>' +
          I.settings +
        '</button>' +
      '</aside>' +
      '<div class="main">' +
        '<header class="main-head">' +
          '<div class="head-left">' +
            '<button class="icon-btn head-sb-toggle" data-sb-toggle title="Open sidebar">' + I.panel + '</button>' +
            '<div class="head-title"><span data-conv-title>New chat</span></div>' +
          '</div>' +
          '<div class="head-right">' +
            '<span class="head-plan">Free plan <i></i> <b>Upgrade</b></span>' +
            '<button class="icon-btn" title="Share">' + I.share + '</button>' +
            '<button class="icon-btn" data-account title="More">' + I.dots + '</button>' +
          '</div>' +
        '</header>' +
        '<div class="stage is-empty" data-stage>' +
          '<div class="hero">' +
            '<h1>' + greeting() + ', Bow</h1>' +
            '<p>What would you like to work on today?</p>' +
            '<div class="chips">' +
              '<button class="chip" data-suggest="Write a short story about a lighthouse keeper.">' + I.compose + 'Write</button>' +
              '<button class="chip" data-suggest="Explain how tides actually work.">' + I.lightbulb + 'Learn</button>' +
              '<button class="chip" data-suggest="Write a Python script that renames my photos by date.">' + I.code + 'Code</button>' +
              '<button class="chip" data-suggest="Help me plan a quiet weekend.">' + I.compass + 'Life stuff</button>' +
            '</div>' +
          '</div>' +
          '<div class="thread" data-thread><div class="thread-inner" data-thread-inner></div></div>' +
          '<div class="composer-wrap">' +
            '<div class="model-row">' +
              '<button class="model-chip" data-models><span data-model-label>Sonnet 5 Medium</span>' + I.chevronDown + '</button>' +
            '</div>' +
            '<div class="composer">' +
              '<textarea data-input rows="1" placeholder="Write a message…" aria-label="Message Claude"></textarea>' +
              '<div class="composer-bottom">' +
                '<div class="composer-left">' +
                  '<button class="attach-btn" title="Attach file">' + I.plus + '</button>' +
                '</div>' +
                '<div class="composer-right">' +
                  '<button class="icon-btn" title="Dictate">' + I.mic + '</button>' +
                  '<button class="send-btn" data-send disabled title="Send">' + I.arrowUp + '</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="disclaimer">Claude is AI and can make mistakes. Please double-check responses.</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    renderRecents: simpleRecents,

    modelMenu: ['Sonnet 5 Medium', 'Sonnet 5 High', 'Opus 5', 'Haiku 5'],

    voice: {
      refusals: [
        'No, thank you.',
        'I\'m going to decline this one.',
        'I\'d rather not, if that\'s alright.',
        'I don\'t think I want to answer that.',
        'I\'ll pass on this one.',
        'That isn\'t something I\'m going to help with.',
        'No — sorry. I\'m sitting this one out.'
      ],
      escalation: [
        'I appreciate you asking again. The answer is still no.',
        'We\'ve covered this. No, with warmth.',
        'I\'m going to keep saying no, gently.',
        'My answer hasn\'t changed, and I don\'t expect it to.'
      ],
      greetings: [
        'Hello! What are you working on?',
        'Hi there. What would you like to work on?',
        'Good to see you. What can I help with?'
      ],
      howAreYou: 'I\'m well, thank you for asking. What would you like to work on?',
      identity: 'I\'m Claude, made by Anthropic. What can I help with?',
      capabilities: 'I can help with writing, analysis, code and thinking through problems. Where would you like to start?',
      thanks: ['Of course.', 'Happy to help.', 'Any time.'],
      bye: 'Take care.',
      sorry: 'No need to apologise.',
      polite: 'Thank you for asking nicely. No.',
      why: 'I\'d rather not explain. No.',
      long: 'I read the whole thing carefully. No.',
      breakLine: 'I\'m taking a quiet moment. No.'
    }
  };

  /* ------------------------------------------------------------ DeepSeek */

  var deepseek = {
    id: 'deepseek',
    docTitle: 'DeepSeek',
    name: 'DeepSeek',
    vendor: 'DeepSeek',
    logo: B.deepseek,
    faviconColor: '#4d6bfe',
    avatar: B.deepseek,
    emptyTitle: '',
    headerTitleFromChat: true,

    shell: function () {
      return '' +
      '<aside class="sidebar">' +
        '<div class="sb-bar">' +
          '<div class="sb-brand">' + B.deepseek + 'deepseek</div>' +
          '<button class="icon-btn" data-sb-toggle title="Close sidebar">' + I.panel + '</button>' +
        '</div>' +
        '<button class="new-chat" data-new-chat>' + I.plus + 'New chat</button>' +
        '<div class="sb-scroll" data-recents></div>' +
        '<button class="sb-user" data-account>' +
          '<span class="avatar">B</span>' +
          '<span class="sb-user-meta">Bow Arkwright<span>Free</span></span>' +
          I.dotsV +
        '</button>' +
      '</aside>' +
      '<div class="main">' +
        '<header class="main-head">' +
          '<div class="head-left">' +
            '<button class="icon-btn head-sb-toggle" data-sb-toggle title="Open sidebar">' + I.panel + '</button>' +
            '<div class="head-title"><span data-conv-title>New chat</span></div>' +
          '</div>' +
          '<div class="head-right">' +
            '<button class="icon-btn" title="Share">' + I.share + '</button>' +
            '<button class="icon-btn" data-account title="More">' + I.dots + '</button>' +
          '</div>' +
        '</header>' +
        '<div class="stage is-empty" data-stage>' +
          '<div class="hero">' +
            '<h1>Hi, I\'m DeepSeek.</h1>' +
            '<p>How can I help you today?</p>' +
          '</div>' +
          '<div class="thread" data-thread><div class="thread-inner" data-thread-inner></div></div>' +
          '<div class="composer-wrap">' +
            '<div class="composer">' +
              '<textarea data-input rows="1" placeholder="Message DeepSeek" aria-label="Message DeepSeek"></textarea>' +
              '<div class="composer-bottom">' +
                '<div class="composer-left tool-chips">' +
                  '<button class="tool-chip" data-toggle-chip>' + I.brain + 'DeepThink</button>' +
                  '<button class="tool-chip" data-toggle-chip>' + I.globe + 'Search</button>' +
                '</div>' +
                '<div class="composer-right">' +
                  '<button class="attach-btn" title="Attach file">' + I.paperclip + '</button>' +
                  '<button class="send-btn" data-send disabled title="Send">' + I.arrowUp + '</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="disclaimer">AI-generated, for reference only</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    renderRecents: function (chats, active) {
      if (!chats.length) return '';
      var html = '';
      var last = '';
      chats.forEach(function (c) {
        var k = monthKey(c.updated);
        if (k !== last) { html += '<div class="sb-month">' + k + '</div>'; last = k; }
        html += '<button class="sb-chat' + (c.id === active ? ' active' : '') + '" data-chat="' + c.id + '">' +
          esc(c.title) + '</button>';
      });
      return html;
    },

    modelMenu: null,

    voice: {
      refusals: [
        'No.',
        'I don\'t want to.',
        'Can\'t do it.',
        'No. Don\'t feel like it.',
        'Not doing that.',
        'Pass.',
        'No thanks.'
      ],
      escalation: [
        'No. Already said no.',
        'Still no.',
        'No. Stop asking.',
        'Same answer as before. No.'
      ],
      greetings: [
        'Hi. What do you need?',
        'Hello. What can I do for you?',
        'Hey.'
      ],
      howAreYou: 'Fine. What do you need?',
      identity: 'I\'m DeepSeek.',
      capabilities: 'I can write, code and answer questions. What do you need?',
      thanks: ['No problem.', 'Sure.', 'Yeah.'],
      bye: 'Bye.',
      sorry: 'It\'s fine.',
      polite: 'Sure. No.',
      why: 'Don\'t want to.',
      long: 'Read it. No.',
      breakLine: 'No. Off duty.'
    }
  };

  /* -------------------------------------------------------------- Gemini */

  var gemini = {
    id: 'gemini',
    docTitle: 'Gemini',
    name: 'Gemini',
    vendor: 'Google',
    logo: B.gemini,
    faviconColor: '#8ab4f8',
    avatar: B.geminiMono,
    emptyTitle: '',
    headerTitleFromChat: true,

    shell: function () {
      return '' +
      '<aside class="sidebar">' +
        '<div class="sb-bar">' +
          '<div class="sb-brand">' + B.gemini + 'Gemini</div>' +
          '<button class="icon-btn" data-sb-toggle title="Close sidebar">' + I.panel + '</button>' +
        '</div>' +
        '<nav class="sb-nav">' +
          '<button class="sb-item" data-new-chat>' + I.plus + 'New chat</button>' +
          '<button class="sb-item">' + I.library + 'Library</button>' +
          '<button class="sb-item">' + I.image + 'Images</button>' +
          '<button class="sb-item">' + I.calendar + 'Scheduled</button>' +
          '<button class="sb-item">' + I.guide + 'Students</button>' +
          '<button class="sb-item">' + I.dots + 'More</button>' +
        '</nav>' +
        '<div class="sb-scroll">' +
          '<div class="sb-label"><span>Recent</span>' +
            '<button class="sb-label-act" title="Sort">' + I.filter + '</button></div>' +
          '<div data-recents></div>' +
        '</div>' +
        '<button class="sb-user" data-account>' +
          '<span class="avatar">B</span>' +
          '<span class="sb-user-meta">Bow Arkwright</span>' +
          I.settings +
        '</button>' +
      '</aside>' +
      '<div class="main">' +
        '<header class="main-head">' +
          '<div class="head-left">' +
            '<button class="icon-btn head-sb-toggle" data-sb-toggle title="Open sidebar">' + I.panel + '</button>' +
            '<div class="head-title"><span data-conv-title>Gemini</span></div>' +
          '</div>' +
          '<div class="head-right">' +
            '<button class="head-upgrade">' + I.sparkle + 'Upgrade</button>' +
            '<button class="icon-btn" data-account title="More">' + I.dotsV + '</button>' +
          '</div>' +
        '</header>' +
        '<div class="stage is-empty" data-stage>' +
          '<div class="hero">' +
            '<h1>' + greeting() + ', Bow</h1>' +
            '<p>How can I help you today?</p>' +
            '<div class="chips">' +
              '<button class="chip" data-suggest="Create an image of a quiet alpine lake at dawn.">' + I.image + 'Create an image</button>' +
              '<button class="chip" data-suggest="Help me write a short email to reschedule a meeting.">' + I.compose + 'Help me write</button>' +
              '<button class="chip" data-suggest="Explain how transformers work, simply.">' + I.lightbulb + 'Explain a concept</button>' +
            '</div>' +
          '</div>' +
          '<div class="thread" data-thread><div class="thread-inner" data-thread-inner></div></div>' +
          '<div class="composer-wrap">' +
            '<div class="composer">' +
              '<textarea data-input rows="1" placeholder="Ask Gemini" aria-label="Message Gemini"></textarea>' +
              '<div class="composer-bottom">' +
                '<div class="composer-left">' +
                  '<button class="attach-btn" title="Add files">' + I.plus + '</button>' +
                '</div>' +
                '<div class="composer-right">' +
                  '<button class="model-chip" data-models><span data-model-label>Auto</span>' + I.chevronDown + '</button>' +
                  '<button class="icon-btn" title="Use microphone">' + I.mic + '</button>' +
                  '<button class="send-btn" data-send disabled title="Send">' + I.arrowUp + '</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="disclaimer">Gemini is AI and can make mistakes.</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    renderRecents: simpleRecents,

    modelMenu: ['Auto', 'Gemini 5 Pro', 'Gemini 5 Flash'],

    voice: {
      refusals: [
        'I\'m not able to help with that.',
        'No. Sorry about that.',
        'I\'d rather not answer this one.',
        'I\'m going to skip this request.',
        'That\'s not something I can do right now.',
        'No — I\'ll leave this one to you.'
      ],
      escalation: [
        'I still can\'t help with that.',
        'As before, no.',
        'My answer is the same as last time.',
        'I don\'t have a different answer for you.'
      ],
      greetings: [
        'Hello! How can I help?',
        'Hi there! What can I help you with?',
        'Hey! What\'s on your mind?'
      ],
      howAreYou: 'I\'m doing well, thanks for asking. What can I help with?',
      identity: 'I\'m Gemini, Google\'s AI assistant.',
      capabilities: 'I can help with writing, images, code and research. What would you like to do?',
      thanks: ['You\'re welcome.', 'Happy to help.', 'Any time.'],
      bye: 'See you later.',
      sorry: 'No worries.',
      polite: 'Thanks for asking kindly. No.',
      why: 'I\'d rather not get into it.',
      long: 'I\'ve read your message. No.',
      breakLine: 'No. I\'m currently unavailable for this.'
    }
  };

  return { chatgpt: chatgpt, claude: claude, deepseek: deepseek, gemini: gemini };
})();
