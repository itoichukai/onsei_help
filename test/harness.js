const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const HTML_PATH = path.join(__dirname, '..', 'voca_app.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

/**
 * Boots the VOCA app inside a fresh jsdom instance so its inline script runs
 * exactly as it would in a browser. Returns the JSDOM instance and its window.
 *
 * @param {Object} [opts]
 * @param {Object} [opts.storage] - values to seed into localStorage before the
 *   inline script runs (keys/values are stringified as-is).
 * @param {Function} [opts.audioFactory] - factory used to stub window.Audio.
 */
function bootApp(opts = {}) {
  const { storage, audioFactory } = opts;

  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: 'http://localhost/',
    pretendToBeVisual: true,
  });
  const { window } = dom;

  // Seed localStorage before the inline script reads it on load.
  if (storage) {
    for (const [k, v] of Object.entries(storage)) {
      window.localStorage.setItem(k, v);
    }
  }

  // jsdom does not implement these; the app calls them from event handlers.
  window.alert = () => {};
  window.confirm = () => true;
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  window.HTMLMediaElement.prototype.pause = () => {};

  if (audioFactory) {
    window.Audio = audioFactory;
  }

  // Run the inline script now that stubs are in place.
  const scriptEl = window.document.querySelector('script');
  window.eval(scriptEl.textContent);

  return { dom, window, document: window.document };
}

module.exports = { bootApp, HTML_PATH, LEVELS: 3, CELLS: 20 };
