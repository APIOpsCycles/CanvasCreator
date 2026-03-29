describe('URL parameter handling', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host');
    Object.defineProperty(host, 'clientWidth', {
      configurable: true,
      value: 900,
    });
    Object.defineProperty(host, 'clientHeight', {
      configurable: true,
      value: 700,
    });
  });

  test('valid locale and canvas are preselected in standalone mode', () => {
    window.history.pushState(
      {},
      '',
      '?locale=en&canvas=apiBusinessModelCanvas',
    );

    const host = document.getElementById('host');
    const { initCanvasCreator } = require('../src/main.js');

    initCanvasCreator({ container: host, mode: 'standalone' });

    expect(host.querySelector('[data-cc-role="locale"]').value).toBe('en');
    expect(host.querySelector('[data-cc-role="canvas"]').value).toBe(
      'apiBusinessModelCanvas',
    );
  });

  test('locale parameter is case-insensitive and supports region variants', () => {
    window.history.pushState(
      {},
      '',
      '?locale=FI-fi&canvas=apiBusinessModelCanvas',
    );

    const host = document.getElementById('host');
    const { initCanvasCreator } = require('../src/main.js');

    initCanvasCreator({ container: host, mode: 'standalone' });

    expect(host.querySelector('[data-cc-role="locale"]').value).toBe('fi');
    expect(host.querySelector('[data-cc-role="canvas"]').value).toBe(
      'apiBusinessModelCanvas',
    );
  });

  test('malicious parameters are sanitized', () => {
    window.history.pushState(
      {},
      '',
      '?locale=<script>alert(1)</script>&canvas=<img src=x onerror=alert(1)>',
    );

    const host = document.getElementById('host');
    const { initCanvasCreator } = require('../src/main.js');

    initCanvasCreator({ container: host, mode: 'standalone' });

    expect(host.querySelector('[data-cc-role="locale"]').value).toBe('');
    expect(host.querySelector('[data-cc-role="canvas"]').value).toBe('');
  });
});
