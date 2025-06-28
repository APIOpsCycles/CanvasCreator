const { distributeMissingPositions } = require('../scripts/utils.js');

test('assigns positions when missing', () => {
  const canvasDef = {
    layout: { columns: 2, rows: 2 },
    sections: [
      { id: 'sec1', gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 1 } },
    ],
  };

  const content = {
    sections: [
      { sectionId: 'sec1', stickyNotes: [{ content: 'a' }, { content: 'b' }] },
    ],
  };

  const styles = {
    width: 1000,
    height: 712,
    headerHeight: 80,
    footerHeight: 30,
    padding: 10,
    stickyNoteSize: 80,
    stickyNoteSpacing: 10,
  };

  distributeMissingPositions(content, canvasDef, styles);

  for (const note of content.sections[0].stickyNotes) {
    expect(note.position).toBeDefined();
    expect(typeof note.position.x).toBe('number');
    expect(typeof note.position.y).toBe('number');
  }
});
