const { importJSON, exportJSON } = require('../scripts/noteManager');
const { buildContent, renderSVG } = require('../src/node-export.cjs');
const canvasData = require('apiops-cycles-method-data/canvasData.json');
const localizedData = require('apiops-cycles-method-data/localizedData.json');
const { getImportErrorMessage } = require('../src/validateImport');
const defaultStyles = require('../src/defaultStyles');

const text = 'Tarjouksen laatija: AI:lle & "quotes" / \\ {a} [b]\n<test> <img src=x onerror="alert(1)">';

function fixture(notes) {
  return {
    templateId: 'automationWorkflowCanvas',
    locale: 'fi',
    metadata: { source: '', license: '', authors: [], website: '' },
    sections: [{ sectionId: 'selectedCustomerCapabilityOutcomes', stickyNotes: notes.map(note => ({ size: 80, color: '#FFF399', ...note })) }],
  };
}

test.each([
  { content: text },
  { content: text, size: 100 },
  { content: text, color: '#123456' },
])('notes can omit size and color: %j', (note) => {
  const input = fixture([]);
  input.sections[0].stickyNotes = [note];
  const imported = importJSON(JSON.stringify(input));
  expect(imported).toEqual(input);
  expect(importJSON(exportJSON(imported))).toEqual(input);
  const content = buildContent(canvasData, input.templateId, 'fi', false, imported, true);
  const svg = renderSVG(canvasData[input.templateId], localizedData, content);
  expect(svg).toContain(note.color || defaultStyles.stickyNoteColor);
  expect(content.sections[0].stickyNotes[0].position).toEqual({ x: expect.any(Number), y: expect.any(Number) });
});

test('repeated validation errors become a short summary with a field-name fix', () => {
  const input = fixture(Array.from({ length: 33 }, () => ({ text, id: 'note-id' })));
  try {
    importJSON(JSON.stringify(input));
    throw new Error('Expected rejection');
  } catch (error) {
    const message = getImportErrorMessage(error);
    expect(message).toContain('rename it to "content"');
    expect(message).toContain('33 places need this fix');
    expect(message).toContain('unsupported "id"');
    expect(message).not.toContain('/sections/');
    expect(message.length).toBeLessThan(600);
  }
});

test('browser shows JSON syntax errors inline and clears errors on a successful retry', () => {
  document.body.innerHTML = '<div id="host"></div>';
  const { initCanvasCreator } = require('../src/main');
  const host = document.getElementById('host');
  const instance = initCanvasCreator({ container: host, locale: 'en', canvas: 'apiBusinessModelCanvas', fitToContainer: false });
  let json = '{ invalid json';
  const mock = jest.spyOn(window, 'FileReader').mockImplementation(() => ({
    readAsText() { this.onload({ target: { result: json } }); },
  }));
  try {
    Object.defineProperty(instance.fileInput, 'files', { configurable: true, value: [new File([''], 'canvas.json')] });
    const previous = instance.contentData;
    instance.importFromFile();
    expect(instance.contentData).toBe(previous);
    expect(instance.importErrorPanel.hidden).toBe(false);
    expect(instance.importErrorMessage.textContent).toContain('not valid JSON');
    host.querySelector('[data-cc-role="dismissImportError"]').click();
    expect(instance.importErrorPanel.hidden).toBe(true);
    expect(document.activeElement).toBe(instance.importButton);
    instance.importFromFile();
    expect(instance.importErrorPanel.hidden).toBe(false);
    const input = fixture([]);
    input.sections[0].stickyNotes.push({ content: 'Note: no size or color' });
    json = JSON.stringify(input);
    instance.importFromFile();
    expect(instance.importErrorPanel.hidden).toBe(true);
    const note = host.querySelector('.cc-note');
    expect(note.textContent).toBe('Note: no size or color');
    expect(note.style.width).toBe(`${defaultStyles.stickyNoteSize}px`);
    const color = document.createElement('div');
    color.style.backgroundColor = defaultStyles.stickyNoteColor;
    expect(note.style.backgroundColor).toBe(color.style.backgroundColor);
  } finally {
    mock.mockRestore();
    instance.destroy();
  }
});

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
      expect(alert).not.toHaveBeenCalled();
      const panel = host.querySelector('.cc-import-error');
      expect(panel.hidden).toBe(false);
      expect(panel.textContent).toContain('rename it to "content"');
      expect(panel.textContent).toContain('Section 1, sticky note 1');
      expect(panel.textContent).not.toContain('/sections/');
      expect(document.activeElement).toBe(panel);
      expect(instance.contentData).toBe(previous);
      expect(instance.currentCanvas).toBe('apiBusinessModelCanvas');
      expect(host.querySelector('.cc-note')).toBeNull();
      expect(instance.fileInput.value).toBe('');
      return;
    }
    expect(alert).not.toHaveBeenCalled();
    expect(host.querySelector('.cc-import-error').hidden).toBe(true);
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
