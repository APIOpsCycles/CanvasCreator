const { importJSON, exportJSON } = require('../scripts/noteManager');
const { buildContent, renderSVG } = require('../src/node-export.cjs');
const canvasData = require('apiops-cycles-method-data/canvasData.json');
const localizedData = require('apiops-cycles-method-data/localizedData.json');

const text = 'Tarjouksen laatija: AI:lle & "quotes" / \\ {a} [b]\n<test> <img src=x onerror="alert(1)">';

function fixture(notes) {
  return {
    templateId: 'automationWorkflowCanvas',
    locale: 'fi',
    metadata: { source: '', license: '', authors: [], website: '' },
    sections: [{ sectionId: 'selectedCustomerCapabilityOutcomes', stickyNotes: notes.map(note => ({ size: 80, color: '#FFF399', ...note })) }],
  };
}

test('import rejects text aliases with actionable schema paths', () => {
  expect(() => importJSON(JSON.stringify(fixture([{ text }]))))
    .toThrow('/sections/0/stickyNotes/0/content');
  expect(() => importJSON(JSON.stringify(fixture([{ content: text, text }]))))
    .toThrow('/sections/0/stickyNotes/0/text');
});

test.each([
  [null, '/'],
  [{}, '/templateId'],
  [{ ...fixture([]), sections: null }, '/sections'],
  [fixture([{ content: 42 }]), '/sections/0/stickyNotes/0/content'],
  [fixture([{ content: text, color: 'red' }]), '/sections/0/stickyNotes/0/color'],
  [fixture([{ content: text, position: { x: 'bad' } }]), '/sections/0/stickyNotes/0/position/x'],
  [{ ...fixture([]), templateId: 'unknown' }, '/templateId'],
  [{ ...fixture([]), locale: 'unknown' }, '/locale'],
  [{ ...fixture([]), sections: [{ sectionId: 'unknown', stickyNotes: [] }] }, '/sections/0/sectionId'],
])('invalid import is rejected without mutation: %j', (input, path) => {
  const before = JSON.stringify(input);
  expect(() => importJSON(JSON.stringify(input))).toThrow(path);
  expect(JSON.stringify(input)).toBe(before);
});

test('CLI rejects invalid imports and renders valid content as escaped SVG text without mutating input', () => {
  expect(() => buildContent(canvasData, 'automationWorkflowCanvas', 'fi', false, fixture([{ text }]), true)).toThrow('/sections/0/stickyNotes/0/content');
  const imported = fixture([{ content: text }]);
  const content = buildContent(canvasData, imported.templateId, 'fi', false, imported, true);
  const svg = renderSVG(canvasData[imported.templateId], localizedData, content);
  const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');
  expect(parsed.querySelector('parsererror')).toBeNull();
  expect(parsed.documentElement.textContent).toContain('Tarjouksen');
  expect(parsed.documentElement.textContent).toContain('laatija:');
  expect(parsed.documentElement.textContent).toContain('<test>');
  expect(parsed.querySelector('img')).toBeNull();
  expect(content.sections[0].stickyNotes[0].content).toBe(text);
  expect(JSON.parse(exportJSON(content)).sections[0].stickyNotes[0].content).toBe(text);
  expect(imported.sections[0].stickyNotes[0]).toEqual({ content: text, size: 80, color: '#FFF399' });
});

test.each(['text', 'content'])('browser validates %s before replacing the canvas', (field) => {
  document.body.innerHTML = '<div id="host"></div>';
  const { initCanvasCreator } = require('../src/main');
  const host = document.getElementById('host');
  const instance = initCanvasCreator({ container: host, locale: 'en', canvas: 'apiBusinessModelCanvas', fitToContainer: false });
  const previous = instance.contentData;
  const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
  const imported = fixture([{ [field]: text }]);
  const reader = { readAsText: jest.fn(function () {
    this.onload({ target: { result: JSON.stringify(imported) } });
  }) };
  const mock = jest.spyOn(window, 'FileReader').mockImplementation(() => reader);
  try {
    Object.defineProperty(instance.fileInput, 'files', { configurable: true, value: [new File([''], 'canvas.json')] });
    instance.importFromFile();
    if (field === 'text') {
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('/sections/0/stickyNotes/0/content'));
      expect(instance.contentData).toBe(previous);
      expect(instance.currentCanvas).toBe('apiBusinessModelCanvas');
      expect(host.querySelector('.cc-note')).toBeNull();
      expect(instance.fileInput.value).toBe('');
      return;
    }
    expect(alert).not.toHaveBeenCalled();
    const note = host.querySelector('.cc-note');
    expect(note.textContent).toBe(text);
    expect(note.querySelector('img')).toBeNull();
    expect(instance.contentData.sections[0].stickyNotes[0].text).toBeUndefined();
    // Exported state can be imported again without losing punctuation.
    expect(importJSON(JSON.stringify(instance.contentData)).sections[0].stickyNotes[0].content).toBe(text);
    note.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(note.querySelector('textarea').value).toBe(text);
    note.querySelector('textarea').value = 'Updated: AI:lle & "quotes"';
    note.querySelector('textarea').dispatchEvent(new Event('blur'));
    expect(host.querySelector('.cc-note').textContent).toBe('Updated: AI:lle & "quotes"');
  } finally {
    alert.mockRestore();
    mock.mockRestore();
    instance.destroy();
  }
});
