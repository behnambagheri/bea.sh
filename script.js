const THEME_KEY = 'bb-theme';
const button = document.getElementById('themeButton');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const applyTheme = (theme) => {
  if (!theme || theme === 'auto') {
    document.body.removeAttribute('data-theme');
    button.textContent = 'Auto';
    return;
  }
  document.body.setAttribute('data-theme', theme);
  button.textContent = theme === 'dark' ? 'Dark' : 'Light';
};

const cycleTheme = () => {
  const current = localStorage.getItem(THEME_KEY) || 'auto';
  const next = current === 'auto' ? 'dark' : current === 'dark' ? 'light' : 'auto';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
};

button.addEventListener('click', cycleTheme);

prefersDark.addEventListener('change', () => {
  if ((localStorage.getItem(THEME_KEY) || 'auto') === 'auto') {
    applyTheme('auto');
  }
});

applyTheme(localStorage.getItem(THEME_KEY) || 'auto');

document.querySelectorAll('.request-access').forEach((buttonEl) => {
  buttonEl.addEventListener('click', () => {
    const panel = buttonEl.closest('.service-card')?.querySelector('.access-panel');
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

  const wrapper = document.createElement('div');
  wrapper.className = 'code-block';
  preEl.parentElement.insertBefore(wrapper, preEl);
  wrapper.appendChild(preEl);

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'code-copy';
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
