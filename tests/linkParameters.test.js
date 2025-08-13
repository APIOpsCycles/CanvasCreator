const chainStub = new Proxy(
  function () {},
  {
    get: (target, prop) => {
      if (prop === 'node') {
        return () => ({ getComputedTextLength: () => 0 })
      }
      return chainStub
    },
    apply: () => chainStub,
  }
)

describe('URL parameter handling', () => {
  beforeEach(() => {
    jest.resetModules()
    document.body.innerHTML = ''
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, text: () => Promise.resolve('') })
    )
    global.d3 = { select: () => chainStub, drag: () => chainStub }
  })

  test('valid locale and canvas are preselected', () => {
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
    `
    window.history.pushState(
      {},
      '',
      '?locale=en&canvas=apiBusinessModelCanvas'
    )
    const { initCanvasCreator } = require('../src/main.js')
    initCanvasCreator()
    expect(document.getElementById('locale').value).toBe('en')
    expect(document.getElementById('canvas').value).toBe(
      'apiBusinessModelCanvas'
    )
  })

  test('malicious parameters are sanitized', () => {
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
    `
    window.history.pushState(
      {},
      '',
      '?locale=<script>alert(1)</script>&canvas=<img src=x onerror=alert(1)>'
    )
    const { initCanvasCreator } = require('../src/main.js')
    initCanvasCreator()
    expect(document.getElementById('locale').value).toBe('')
    expect(document.getElementById('canvas').value).toBe('')
  })
})
