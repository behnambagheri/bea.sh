import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

// Browsers may reject localStorage reads and writes (privacy settings or embeds).
const themeHarness = ({ blocked = false, stored = null, dark = true, lang = 'en' } = {}) => {
  const events = {};
  const root = {
    lang,
    dataset: {},
    removeAttribute: () => {
      delete root.dataset.theme;
    },
  };
  const button = {
    dataset: {},
    hidden: true,
    addEventListener: (event, fn) => {
      events[event] = fn;
    },
    setAttribute: (key, value) => {
      button[key] = value;
    },
  };
  const preference = {
    matches: dark,
    addEventListener: (event, fn) => {
      events.system = fn;
    },
  };
  const storage = {
    getItem: () => {
      if (blocked) throw new Error('Storage blocked');
      return stored;
    },
    setItem: (key, value) => {
      if (blocked) throw new Error('Storage blocked');
      stored = value;
    },
  };
  runInNewContext(source, {
    document: {
      documentElement: root,
      getElementById: (id) => (id === 'themeButton' ? button : null),
      querySelector: () => null,
      querySelectorAll: () => [],
    },
    window: { matchMedia: () => preference },
    localStorage: storage,
  });
  return { root, button, events, preference, stored: () => stored };
};

test('theme toggle keeps working when both storage reads and writes are blocked', () => {
  const { root, button, events, preference } = themeHarness({ blocked: true });
  assert.equal(button.hidden, false);
  assert.equal(button.dataset.current, 'dark');
  events.click();
  assert.equal(root.dataset.theme, 'light');
  events.click();
  assert.equal(root.dataset.theme, 'dark');
  preference.matches = false;
  events.system();
  assert.equal(root.dataset.theme, 'dark', 'a visitor choice survives a system preference change');
});

test('theme follows the system until a visitor saves a choice', () => {
  const { root, button, events, preference, stored } = themeHarness({ stored: 'invalid' });
  assert.equal(root.dataset.theme, undefined);
  preference.matches = false;
  events.system();
  assert.equal(button.dataset.current, 'light');
  events.click();
  assert.equal(root.dataset.theme, 'dark');
  assert.equal(stored(), 'dark');
});

test('saved theme and its control label are localized on the Persian page', () => {
  const { root, button, events } = themeHarness({ stored: 'light', lang: 'fa' });
  assert.equal(root.dataset.theme, 'light');
  assert.equal(button['aria-label'], 'حالت روشن. تغییر به حالت تیره');
  events.click();
  assert.equal(button['aria-label'], 'حالت تیره. تغییر به حالت روشن');
});
