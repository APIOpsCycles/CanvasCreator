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
});
