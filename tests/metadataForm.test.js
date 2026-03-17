const chainStub = new Proxy(
  function () {},
  {
    get: (target, prop) => {
      if (prop === 'node') {
        return () => ({
          getComputedTextLength: () => 0,
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        })
      }
      return chainStub
    },
    apply: () => chainStub,
  },
)

describe('metadata form', () => {
  beforeEach(() => {
    jest.resetModules()
    document.body.innerHTML = ''
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, text: () => Promise.resolve('') }),
    )
    global.d3 = { select: () => chainStub, drag: () => chainStub }
  })

  test('opening metadata form pre-fills values from content data', () => {
    document.body.innerHTML = `
      <select id="locale"></select>
      <div id="canvasSelector" style="display:none"><select id="canvas"></select></div>
      <div id="canvasCreator" style="display:none"></div>
      <button id="metadataButton"></button>
      <div id="metadataForm" style="display:none"></div>
      <input id="source" />
      <input id="license" />
      <input id="authors" />
      <input id="website" />
      <button id="saveMetadata"></button>
      <button id="exportButton"></button>
      <button id="exportSVGButton"></button>
      <button id="exportPNGButton"></button>
      <button id="importButton"></button>
    `

    window.history.pushState(
      {},
      '',
      '?locale=en&canvas=apiBusinessModelCanvas',
    )

    const { initCanvasCreator } = require('../src/main.js')
    initCanvasCreator()

    document.getElementById('source').value = 'Imported Source'
    document.getElementById('license').value = 'CC-BY-SA 4.0'
    document.getElementById('authors').value = 'Test Author,Second Author'
    document.getElementById('website').value = 'example.com'
    document.getElementById('saveMetadata').click()

    document.getElementById('source').value = ''
    document.getElementById('license').value = ''
    document.getElementById('authors').value = ''
    document.getElementById('website').value = ''

    document.getElementById('metadataButton').click()

    expect(document.getElementById('source').value).toBe('Imported Source')
    expect(document.getElementById('license').value).toBe('CC-BY-SA 4.0')
    expect(document.getElementById('authors').value).toBe('Test Author,Second Author')
    expect(document.getElementById('website').value).toBe('example.com')
  })
})
