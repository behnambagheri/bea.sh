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
