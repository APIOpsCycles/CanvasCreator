const { createStickyNote, editStickyNote, exportJSON, importJSON } = require('../scripts/noteManager.js');

describe('sticky note operations', () => {
  let contentData;

  beforeEach(() => {
    contentData = {
      canvasId: 'apiBusinessModelCanvas',
      locale: 'en-US',
      metadata: { source: 'test', license: 'MIT', authors: ['a'], website: 'example.com' },
      stickyNoteSize: 80,
      sections: [
        { sectionId: 'sec1', stickyNotes: [] },
      ],
    };
  });

  test('create sticky note', () => {
    const note = createStickyNote(contentData, 'sec1', 'hello', { x: 10, y: 20 });
    expect(contentData.sections[0].stickyNotes.length).toBe(1);
    expect(note.content).toBe('hello');
  });

  test('edit sticky note', () => {
    const note = createStickyNote(contentData, 'sec1', 'hello');
    editStickyNote(note, 'changed');
    expect(note.content).toBe('changed');
  });

  test('export and import flow', () => {
    createStickyNote(contentData, 'sec1', 'exported', { x: 1, y: 1 });
    const json = exportJSON(contentData);
    const imported = importJSON(json);
    expect(imported.sections[0].stickyNotes[0].content).toBe('exported');
    expect(imported.locale).toBe('en-US');
  });
});
