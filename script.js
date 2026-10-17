const THEME_KEY = 'bb-theme';
const button = document.getElementById('themeButton');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// The design system reads data-theme from <html>.
const root = document.documentElement;

// Light or dark only: the OS preference decides until the visitor picks one, then the pick is remembered.
const savedTheme = () => {
  const theme = localStorage.getItem(THEME_KEY);
  return theme === 'light' || theme === 'dark' ? theme : null;
};

const currentTheme = () => savedTheme() || (prefersDark.matches ? 'dark' : 'light');

const applyTheme = () => {
  const theme = currentTheme();
  if (savedTheme()) {
    root.setAttribute('data-theme', theme);
  } else {
    root.removeAttribute('data-theme');
  }
  // The button's icon shows the theme on screen (sun or moon); clicking switches to the other one.
  const label = `Theme: ${theme}. Switch to ${theme === 'dark' ? 'light' : 'dark'}`;
  button.dataset.current = theme;
  button.setAttribute('aria-label', label);
  button.title = label;
};

if (button) {
  button.addEventListener('click', () => {
    localStorage.setItem(THEME_KEY, currentTheme() === 'dark' ? 'light' : 'dark');
    applyTheme();
  });

  prefersDark.addEventListener('change', applyTheme);

  applyTheme();
}

document.querySelectorAll('.request-access').forEach((buttonEl) => {
  buttonEl.addEventListener('click', () => {
    const panel = buttonEl.closest('.bb-service-card')?.querySelector('.access-panel');
    if (!panel) return;
    const isHidden = panel.hasAttribute('hidden');
    if (isHidden) {
      panel.removeAttribute('hidden');
      buttonEl.setAttribute('aria-expanded', 'true');
      buttonEl.textContent = 'Hide contact';
    } else {
      panel.setAttribute('hidden', '');
      buttonEl.setAttribute('aria-expanded', 'false');
      buttonEl.textContent = 'Request access';
    }
  });
});

const modalBackdrop = document.getElementById('modalBackdrop');
const modalCloseButtons = document.querySelectorAll('.modal-close');
let activeModal = null;

const openModal = (modalId) => {
  if (!modalBackdrop) return;
  const modal = document.getElementById(modalId);
  if (!modal) return;
  activeModal = modal;
  modalBackdrop.removeAttribute('hidden');
  document.body.classList.add('modal-open');
  modal.focus();
};

const closeModal = () => {
  if (!modalBackdrop || !activeModal) return;
  modalBackdrop.setAttribute('hidden', '');
  document.body.classList.remove('modal-open');
  activeModal = null;
};

document.querySelectorAll('.usage-guide').forEach((buttonEl) => {
  buttonEl.addEventListener('click', () => {
    const modalTarget = buttonEl.getAttribute('data-modal-target');
    if (!modalTarget) return;
    openModal(modalTarget);
  });
});

modalCloseButtons.forEach((buttonEl) => {
  buttonEl.addEventListener('click', closeModal);
});

if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && activeModal) {
    closeModal();
  }
});

const copyTextToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  textArea.remove();
};

document.querySelectorAll('.modal pre').forEach((preEl) => {
  const codeEl = preEl.querySelector('code');
  if (!codeEl || !preEl.parentElement) return;

  preEl.classList.add('bb-code');
  const wrapper = document.createElement('div');
  wrapper.className = 'bb-code-block';
  preEl.parentElement.insertBefore(wrapper, preEl);
  wrapper.appendChild(preEl);

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'bb-code-copy';
  copyButton.textContent = 'Copy';
  wrapper.appendChild(copyButton);

  copyButton.addEventListener('click', async () => {
    const code = codeEl.textContent || '';
    if (!code) return;
    try {
      await copyTextToClipboard(code);
      copyButton.textContent = 'Copied';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 1200);
    } catch {
      copyButton.textContent = 'Failed';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 1200);
    }
  });
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const navLinks = [...document.querySelectorAll('.bb-nav a[href^="#"]')];
const navTargets = navLinks
  .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
  .filter(Boolean)
  .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

const setCurrentNav = (id) => {
  navLinks.forEach((link) => {
    if (link.getAttribute('href') === `#${id}`) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

// The current section is the last nav target whose top has reached the sticky
// header (sections use scroll-margin-top: 108px, so anchor jumps land just above this line).
const NAV_LINE = 120;
let navFrame = 0;

const updateCurrentNav = () => {
  navFrame = 0;
  const current = navTargets.filter((target) => target.getBoundingClientRect().top <= NAV_LINE).pop();
  setCurrentNav(current?.id);
};

if (navTargets.length) {
  window.addEventListener('scroll', () => {
    if (!navFrame) navFrame = requestAnimationFrame(updateCurrentNav);
  }, { passive: true });
  window.addEventListener('resize', updateCurrentNav);
  updateCurrentNav();
}
