describe('initCanvasCreator', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="host"></div>';
    window.history.pushState({}, '', '/');
  });

  function createHost(width = 900, height = 700) {
    const host = document.getElementById('host');
    Object.defineProperty(host, 'clientWidth', {
      configurable: true,
      value: width,
    });
    Object.defineProperty(host, 'clientHeight', {
      configurable: true,
      value: height,
    });
    return host;
  }

  test('module can be required without DOM usage', () => {
    expect(() => require('../src/main.js')).not.toThrow();
  });

  test('renders into a supplied container and returns instance methods', () => {
    const host = createHost();
    const { initCanvasCreator } = require('../src/main.js');

    const instance = initCanvasCreator({
      container: host,
      locale: 'en',
      canvas: 'apiBusinessModelCanvas',
    });

    expect(typeof instance.resize).toBe('function');
    expect(typeof instance.destroy).toBe('function');
    expect(host.querySelector('.cc-root')).not.toBeNull();
    expect(host.querySelector('.cc-stage-svg svg')).not.toBeNull();
  });

  test('standalone mode shows full controls by default', () => {
    const host = createHost();
    const { initCanvasCreator } = require('../src/main.js');

    initCanvasCreator({
      container: host,
      mode: 'standalone',
      locale: 'en',
      canvas: 'apiBusinessModelCanvas',
    });

    expect(host.querySelector('[data-cc-control="import"]')).not.toBeNull();
    expect(host.querySelector('[data-cc-control="metadata"]')).not.toBeNull();
    expect(host.querySelector('[data-cc-control="export-pdf"]')).not.toBeNull();
    expect(host.querySelector('[data-cc-control="help"]')).not.toBeNull();
    expect(host.querySelector('.cc-header__links').hidden).toBe(false);
    expect(host.querySelector('.cc-theme-panel').hidden).toBe(false);
  });

  test('embed mode uses lean defaults', () => {
    const host = createHost();
    const { initCanvasCreator } = require('../src/main.js');

    initCanvasCreator({
      container: host,
      mode: 'embed',
      locale: 'en',
      canvas: 'apiBusinessModelCanvas',
    });

    expect(host.querySelector('[data-cc-control="import"]')).not.toBeNull();
    expect(host.querySelector('[data-cc-control="help"]')).toBeNull();
    expect(host.querySelector('.cc-header__links').hidden).toBe(true);
    expect(host.querySelector('.cc-theme-panel').hidden).toBe(true);
  });

  test('toolbar overrides mode defaults', () => {
    const host = createHost();
    const { initCanvasCreator } = require('../src/main.js');

    initCanvasCreator({
      container: host,
      mode: 'embed',
      locale: 'en',
      canvas: 'apiBusinessModelCanvas',
      toolbar: {
        help: true,
        headerLinks: true,
        themePicker: true,
      },
    });

    expect(host.querySelector('[data-cc-control="help"]')).not.toBeNull();
    expect(host.querySelector('.cc-header__links').hidden).toBe(false);
    expect(host.querySelector('.cc-theme-panel').hidden).toBe(false);
  });

  test('initial locale and canvas are applied through init options', () => {
    const host = createHost();
    const { initCanvasCreator } = require('../src/main.js');

    initCanvasCreator({
      container: host,
      locale: 'fi-FI',
      canvas: 'apiBusinessModelCanvas',
    });

    expect(host.querySelector('[data-cc-role="locale"]').value).toBe('fi');
    expect(host.querySelector('[data-cc-role="canvas"]').value).toBe(
      'apiBusinessModelCanvas',
    );
  });

  test('resize respects fitToContainer and max dimensions', () => {
    const host = createHost(500, 400);
    const { initCanvasCreator } = require('../src/main.js');

    const instance = initCanvasCreator({
      container: host,
      locale: 'en',
      canvas: 'apiBusinessModelCanvas',
      fitToContainer: true,
      maxWidth: 480,
      maxHeight: 320,
    });

    instance.resize();

    const stageHost = host.querySelector('.cc-stage-host');
    const stageFrame = host.querySelector('.cc-stage-frame');

    expect(stageHost.style.maxWidth).toBe('480px');
    expect(stageHost.style.maxHeight).toBe('320px');
    expect(stageFrame.style.transform).toMatch(/^scale\(/);
  });

  test('resize does not react to container height changes when maxHeight is unset', () => {
    const host = createHost(500, 300);
    const { initCanvasCreator } = require('../src/main.js');

    const instance = initCanvasCreator({
      container: host,
      locale: 'en',
      canvas: 'apiBusinessModelCanvas',
      fitToContainer: true,
    });

    const stageHost = host.querySelector('.cc-stage-host');
    const stageFrame = host.querySelector('.cc-stage-frame');
    const initialTransform = stageFrame.style.transform;
    const initialHeight = stageHost.style.height;

    Object.defineProperty(host, 'clientHeight', {
      configurable: true,
      value: 120,
    });

    instance.resize();

    expect(stageFrame.style.transform).toBe(initialTransform);
    expect(stageHost.style.height).toBe(initialHeight);
    expect(stageHost.style.maxHeight).toBe('');
  });

  test('destroy clears the mounted UI and re-init does not duplicate controls', () => {
    const host = createHost();
    const { initCanvasCreator } = require('../src/main.js');

    const first = initCanvasCreator({
      container: host,
      locale: 'en',
      canvas: 'apiBusinessModelCanvas',
    });
    expect(host.querySelectorAll('[data-cc-control="import"]')).toHaveLength(1);

    first.destroy();
    expect(host.innerHTML).toBe('');

    initCanvasCreator({
      container: host,
      locale: 'en',
      canvas: 'apiBusinessModelCanvas',
    });
    expect(host.querySelectorAll('[data-cc-control="import"]')).toHaveLength(1);
  });
});
