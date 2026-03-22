describe('initCanvasCreator', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
  });

  test('module can be required without DOM', () => {
    expect(() => require('../src/main.js')).not.toThrow();
  });

  test('initialization attaches without throwing', () => {
    document.body.innerHTML = `
      <select id="locale"></select>
      <div id="canvasSelector"><select id="canvas"></select></div>
      <div id="canvasCreator"></div>
      <button id="metadataButton"></button>
      <button id="saveMetadata"></button>
    `;
    const { initCanvasCreator } = require('../src/main.js');
    expect(() => initCanvasCreator()).not.toThrow();
  });

  test('first manual canvas render happens after canvas container is shown', () => {
    let hiddenAtSvgAppend = null;

    const makeChain = (selector) =>
      new Proxy(
        function () {},
        {
          get: (target, prop) => {
            if (prop === 'append') {
              return (tagName) => {
                if (selector === '#canvasCreator' && tagName === 'svg') {
                  hiddenAtSvgAppend =
                    document.getElementById('canvasCreator').style.display === 'none';
                }
                return makeChain(tagName);
              };
            }
            if (prop === 'node') {
              return () => ({
                getComputedTextLength: () => 0,
                getBoundingClientRect: () => ({ left: 0, top: 0 }),
              });
            }
            return makeChain(selector);
          },
          apply: () => makeChain(selector),
        },
      );

    document.body.innerHTML = `
      <select id="locale"></select>
      <div id="canvasSelector" style="display:none"><select id="canvas"></select></div>
      <div id="canvasCreator" style="display:none"></div>
      <button id="metadataButton"></button>
      <button id="saveMetadata"></button>
      <button id="exportButton"></button>
      <button id="exportSVGButton"></button>
      <button id="exportPNGButton"></button>
      <button id="importButton"></button>
    `;

    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, text: () => Promise.resolve('') }),
    );
    global.d3 = { select: (selector) => makeChain(selector), drag: () => makeChain('drag') };

    const { initCanvasCreator } = require('../src/main.js');
    initCanvasCreator();

    const locale = document.getElementById('locale');
    locale.value = 'en';
    locale.dispatchEvent(new Event('change'));

    const canvas = document.getElementById('canvas');
    canvas.value = 'apiBusinessModelCanvas';
    canvas.dispatchEvent(new Event('change'));

    expect(hiddenAtSvgAppend).toBe(false);
    expect(document.getElementById('canvasCreator').style.display).toBe('flex');
  });

  test('color palette stays hidden until a canvas is selected', () => {
    const chainStub = new Proxy(
      function () {},
      {
        get: (target, prop) => {
          if (prop === 'node') {
            return () => ({
              getComputedTextLength: () => 0,
              getBoundingClientRect: () => ({ left: 0, top: 0 }),
            });
          }
          return chainStub;
        },
        apply: () => chainStub,
      },
    );

    document.body.innerHTML = `
      <select id="locale"></select>
      <div id="canvasSelector" style="display:none"><select id="canvas"></select></div>
      <div id="canvasCreator" style="display:none"></div>
      <div id="colorPalette" hidden></div>
      <button id="metadataButton"></button>
      <button id="saveMetadata"></button>
      <button id="exportButton"></button>
      <button id="exportSVGButton"></button>
      <button id="exportPNGButton"></button>
      <button id="importButton"></button>
      <select id="themeSelect"></select>
      <div id="paletteSwatches"></div>
    `;

    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, text: () => Promise.resolve('') }),
    );
    global.d3 = { select: () => chainStub, drag: () => chainStub };

    const { initCanvasCreator } = require('../src/main.js');
    initCanvasCreator();

    const palette = document.getElementById('colorPalette');
    expect(palette.hidden).toBe(true);

    const locale = document.getElementById('locale');
    locale.value = 'fi';
    locale.dispatchEvent(new Event('change'));
    expect(palette.hidden).toBe(true);

    const canvas = document.getElementById('canvas');
    canvas.value = 'interactionCanvas';
    canvas.dispatchEvent(new Event('change'));
    expect(palette.hidden).toBe(false);
  });
});
