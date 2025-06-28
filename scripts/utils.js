function sanitizeInput(text) {
  // Remove script tags entirely
  let sanitized = text.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    '',
  );

  // Strip event handler attributes such as onerror, onclick, etc.
  sanitized = sanitized.replace(/\s+on[a-z]+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  return sanitized;
}

function distributeMissingPositions(content, canvasDef, styles) {
  const cellWidth = Math.floor(
    (styles.width - canvasDef.layout.columns * styles.padding) /
      canvasDef.layout.columns,
  );

  const cellHeight = Math.floor(
    (styles.height -
      styles.headerHeight -
      styles.footerHeight -
      4 * styles.padding) /
      canvasDef.layout.rows,
  );

  content.sections.forEach((section) => {
    const templateSection = canvasDef.sections.find(
      (sec) => sec.id === section.sectionId,
    );
    if (!templateSection) return;

    const notesToPlace = section.stickyNotes.filter(
      (n) => !n.position || n.position.x === undefined || n.position.y === undefined,
    );
    if (notesToPlace.length === 0) return;

    const startX =
      templateSection.gridPosition.column * cellWidth + 2 * styles.padding;
    const startY =
      templateSection.gridPosition.row * cellHeight + styles.headerHeight;
    const secWidth = templateSection.gridPosition.colSpan * cellWidth;
    const secHeight = templateSection.gridPosition.rowSpan * cellHeight;

    const noteSize = styles.stickyNoteSize;
    const maxCols = Math.max(1, Math.floor(secWidth / (noteSize + styles.stickyNoteSpacing)));
    const cols = Math.min(notesToPlace.length, maxCols);
    const rows = Math.ceil(notesToPlace.length / cols);

    const spaceX = Math.max(0, (secWidth - cols * noteSize) / (cols + 1));
    const spaceY = Math.max(0, (secHeight - rows * noteSize) / (rows + 1));

    notesToPlace.forEach((note, index) => {
      const c = index % cols;
      const r = Math.floor(index / cols);
      note.position = {
        x: startX + spaceX + c * (noteSize + spaceX),
        y: startY + spaceY + r * (noteSize + spaceY),
      };
    });
  });
}

module.exports = {
  sanitizeInput,
  distributeMissingPositions,
};
