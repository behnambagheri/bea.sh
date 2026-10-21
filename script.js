(() => {
  const root = document.documentElement;
  const isPersian = root.lang === 'fa';
  const text = isPersian
    ? {
        light: 'حالت روشن. تغییر به حالت تیره',
        dark: 'حالت تیره. تغییر به حالت روشن',
        copy: 'کپی',
        copied: 'کپی شد',
        failed: 'کپی انجام نشد؛ متن را دستی انتخاب کنید.',
        results: (count, total) =>
          `${new Intl.NumberFormat('fa').format(count)} سرویس از ${new Intl.NumberFormat('fa').format(total)} سرویس`,
      }
    : {
        light: 'Theme: light. Switch to dark',
        dark: 'Theme: dark. Switch to light',
        copy: 'Copy',
        copied: 'Copied',
        failed: 'Copy failed. Select and copy the text manually.',
        results: (count, total) => `${count} of ${total} services`,
      };

  // Theme selection works for this visit even if the browser blocks storage.
  const themeButton = document.getElementById('themeButton');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  let selectedTheme = null;
  try {
    const stored = localStorage.getItem('bb-theme');
    if (stored === 'light' || stored === 'dark') selectedTheme = stored;
  } catch {
    /* The system preference remains the initial default. */
  }

  const currentTheme = () => selectedTheme || (prefersDark.matches ? 'dark' : 'light');
  const applyTheme = () => {
    const theme = currentTheme();
    if (selectedTheme) root.dataset.theme = theme;
    else root.removeAttribute('data-theme');
    if (!themeButton) return;
    themeButton.dataset.current = theme;
    themeButton.setAttribute('aria-label', text[theme]);
    themeButton.title = text[theme];
  };

  if (themeButton) {
    applyTheme();
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
      selectedTheme = currentTheme() === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('bb-theme', selectedTheme);
      } catch {
        /* Keep the in-memory choice. */
      }
      applyTheme();
    });
    prefersDark.addEventListener('change', applyTheme);
  }

  // All services remain readable in the HTML when JavaScript is unavailable.
  const serviceGrid = document.getElementById('serviceGrid');
  const search = document.getElementById('serviceSearch');
  const controls = document.querySelector('.service-controls');
  const results = document.getElementById('serviceResults');
  const empty = document.getElementById('serviceEmpty');
  const reset = document.getElementById('resetServices');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const normalize = (value) =>
    value
      .toLocaleLowerCase()
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[\u064B-\u065F\u200C]/g, '')
      .trim();

  if (serviceGrid && search && controls && results && empty && reset) {
    const services = [...serviceGrid.querySelectorAll('.bb-service-card')].map((card) => ({
      card,
      searchable: normalize(`${card.dataset.search} ${card.textContent}`),
    }));
    let access = 'all';
    const updateServices = () => {
      const terms = normalize(search.value).split(/\s+/).filter(Boolean);
      let count = 0;
      services.forEach(({ card, searchable }) => {
        const matches =
          (access === 'all' || card.dataset.access === access) && terms.every((term) => searchable.includes(term));
        card.hidden = !matches;
        if (matches) count += 1;
      });
      filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter.dataset.filter === access)));
      results.textContent = text.results(count, services.length);
      empty.hidden = count !== 0;
    };
    filters.forEach((filter) =>
      filter.addEventListener('click', () => {
        access = filter.dataset.filter;
        updateServices();
      }),
    );
    search.addEventListener('input', updateServices);
    reset.addEventListener('click', () => {
      search.value = '';
      access = 'all';
      updateServices();
      search.focus();
    });
    updateServices();
    controls.hidden = false;
    results.hidden = false;
  }

  document.querySelectorAll('.usage-guide').forEach((trigger) => {
    const dialog = document.getElementById(trigger.dataset.modalTarget);
    if (!dialog || typeof dialog.showModal !== 'function') return;
    trigger.hidden = false;
    trigger.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('.modal-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    });
  });

  const copyText = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement('textarea');
    const focus = document.activeElement;
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;opacity:0;';
    // Keep the fallback inside the active dialog, outside its inert siblings.
    (document.querySelector('dialog[open]') || document.body).appendChild(field);
    field.select();
    try {
      if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
    } finally {
      field.remove();
      focus?.focus();
    }
  };

  document.querySelectorAll('.usage-dialog').forEach((dialog) => {
    const status = document.createElement('p');
    status.className = 'copy-status';
    status.setAttribute('role', 'status');
    dialog.appendChild(status);
    dialog.querySelectorAll('pre').forEach((pre) => {
      const code = pre.querySelector('code');
      if (!code) return;
      pre.classList.add('bb-code');
      const wrapper = document.createElement('div');
      wrapper.className = 'bb-code-block';
      pre.before(wrapper);
      wrapper.appendChild(pre);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bb-code-copy';
      button.textContent = text.copy;
      button.setAttribute(
        'aria-label',
        `${text.copy}: ${pre.closest('.guide-block')?.querySelector('h3')?.textContent || 'APT'}`,
      );
      wrapper.appendChild(button);
      let timer;
      button.addEventListener('click', async () => {
        clearTimeout(timer);
        button.disabled = true;
        try {
          await copyText(code.textContent || '');
          button.textContent = text.copied;
          status.textContent = text.copied;
        } catch {
          status.textContent = text.failed;
        } finally {
          button.disabled = false;
          timer = setTimeout(() => {
            button.textContent = text.copy;
          }, 1800);
        }
      });
    });
  });

  const navLinks = [...document.querySelectorAll('.bb-nav a[href^="#"]')];
  const targets = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (targets.length) {
    let frame = 0;
    const updateNav = () => {
      frame = 0;
      const line = (document.querySelector('.bb-header')?.getBoundingClientRect().bottom || 0) + 40;
      const active = targets.filter((section) => section.getBoundingClientRect().top <= line).pop();
      navLinks.forEach((link) => {
        if (link.hash === `#${active?.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!frame) frame = requestAnimationFrame(updateNav);
      },
      { passive: true },
    );
    window.addEventListener('resize', updateNav);
    updateNav();
  }
})();
