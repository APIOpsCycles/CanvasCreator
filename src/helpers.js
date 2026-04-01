const defaultStyles = require('./defaultStyles');
const localizedData = require('apiops-cycles-method-data/localizedData.json');

function getLocaleKey(locale) {
  if (!locale) return defaultStyles.defaultLocale;
  const lower = String(locale).toLowerCase();
  if (localizedData[lower]) return lower;
  const base = lower.split('-')[0];
  return localizedData[base] ? base : lower;
}

function wrapTextApprox(text, maxWidth = defaultStyles.maxLineWidth) {
  const normalized = String(text || '').replace(/\n{2,}/g, '\n');
  const words = normalized.split(' ');
  const lines = [];
  let line = '';

  for (const word of words) {
    const testLine = `${line}${word} `;
    if (testLine.length * 6 > maxWidth && line.trim()) {
      lines.push(line.trim());
      line = `${word} `;
    } else {
      line = testLine;
    }
  }

  if (line.trim()) {
    lines.push(line.trim());
  }

  return lines.join('\n');
}

function sanitizeInput(text) {
  // Remove script tags entirely
  let sanitized = text.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Strip event handler attributes such as onerror, onclick, etc.
  sanitized = sanitized.replace(/\s+on[a-z]+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  return sanitized;
}

function validateInput(text) {
  const maxLength = 200;
  return text.length > maxLength ? text.substring(0, maxLength) : text;
}

function distributeMissingPositions(content, canvasDef, styles = defaultStyles) {
  const resolvedStyles = { ...defaultStyles, ...styles };
  const cellWidth = Math.floor(
    (resolvedStyles.width - canvasDef.layout.columns * resolvedStyles.padding) /
      canvasDef.layout.columns,
  );

  const cellHeight = Math.floor(
    (resolvedStyles.height -
      resolvedStyles.headerHeight -
      resolvedStyles.footerHeight -
      4 * resolvedStyles.padding) /
      canvasDef.layout.rows,
  );
  const locale = getLocaleKey(content.locale || resolvedStyles.defaultLocale);
  const localizedCanvas =
    (localizedData[locale] && localizedData[locale][canvasDef.id]) || {};
  const noteGap = Math.max(4, Math.floor(resolvedStyles.stickyNoteSpacing / 2));
  const borderGap = Math.max(4, Math.floor(resolvedStyles.padding / 2));
  const journeyNoteInsetY = Math.max(4, Math.floor(noteGap / 2));

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
      templateSection.gridPosition.column * cellWidth + borderGap;
    const secWidth = templateSection.gridPosition.colSpan * cellWidth;
    const secHeight = templateSection.gridPosition.rowSpan * cellHeight;
    const sectionTop =
      templateSection.gridPosition.row * cellHeight + resolvedStyles.headerHeight;
    const sectionBottom = sectionTop + secHeight;
    const sectionTitle =
      (localizedCanvas.sections &&
        localizedCanvas.sections[section.sectionId] &&
        localizedCanvas.sections[section.sectionId].section) ||
      templateSection.id;
    const sectionDescription =
      (localizedCanvas.sections &&
        localizedCanvas.sections[section.sectionId] &&
        localizedCanvas.sections[section.sectionId].description) ||
      '';
    const titleLines = wrapTextApprox(
      sectionTitle,
      secWidth - 2 * resolvedStyles.padding - resolvedStyles.circleRadius,
    )
      .split('\n')
      .filter((line) => line.length > 0).length || 1;
    const titleTop = sectionTop + resolvedStyles.padding + resolvedStyles.circleRadius;
    const titleBottom =
      titleTop + titleLines * (resolvedStyles.fontSize + 6); 
    const descriptionBottom =
      titleBottom + noteGap;
    const sectionBox = {
      x: templateSection.gridPosition.column * cellWidth + 2 * resolvedStyles.padding,
      y: sectionTop,
      width: secWidth,
      height: secHeight,
    };
    const journeyLayout = templateSection.journeySteps
      ? getJourneyStepsLayout(templateSection, sectionBox, resolvedStyles)
      : null;
    const startY = templateSection.journeySteps
      ? Math.max(
          descriptionBottom + noteGap,
          journeyLayout ? journeyLayout.boxes[0].y + noteGap : titleBottom + noteGap,
        ) 
      : descriptionBottom + noteGap;

    const noteSize = resolvedStyles.stickyNoteSize;
    if (journeyLayout) {
      notesToPlace.forEach((note, index) => {
        const box = journeyLayout.boxes[index % journeyLayout.boxes.length];
        const row = Math.floor(index / journeyLayout.boxes.length);
        const rowOffset = row * (noteSize + noteGap);
        note.position = {
          x: box.x + Math.max(0, Math.floor((box.width - noteSize) / 2)),
          y: box.y + Math.max(0, Math.floor((box.height - noteSize) / 2)) +
            journeyNoteInsetY +
            rowOffset,
        };
      });
      return;
    }

    const innerLeft = sectionBox.x;
    const innerRight = sectionBox.x + secWidth;
    const availableWidth = Math.max(noteSize, innerRight - innerLeft);
    const availableHeight = sectionBottom - startY - borderGap - (resolvedStyles.circleRadius / 2);
    const maxCols = Math.max(
      1,
      Math.floor((availableWidth + noteGap) / (noteSize + noteGap)),
    );
    const maxRows = Math.max(
      1,
      Math.floor((availableHeight + noteGap) / (noteSize + noteGap)),
    );
    let cols = Math.max(
      1,
      Math.min(maxCols, Math.ceil(notesToPlace.length / maxRows)),
    );
    while (Math.ceil(notesToPlace.length / cols) > maxRows && cols < maxCols) {
      cols += 1;
    }
    const gridStartY = startY;
    const rows = Array.from({ length: Math.ceil(notesToPlace.length / cols) }, (_, rowIndex) =>
      notesToPlace.slice(rowIndex * cols, (rowIndex + 1) * cols),
    );

    rows.forEach((rowNotes, rowIndex) => {
      const rowWidth = rowNotes.length * noteSize + Math.max(0, rowNotes.length - 1) * noteGap;
      let rowStartX;
      // if (rowIndex === 0) {
        rowStartX = innerLeft + Math.max(0, Math.floor((availableWidth - rowWidth) / 2));
/*       } else {
        rowStartX = Math.max(innerLeft, innerRight - rowWidth);
      } */

      rowNotes.forEach((note, index) => {
        note.position = {
          x: rowStartX + index * (noteSize + noteGap),
          y: gridStartY + rowIndex * (noteSize + noteGap),
        };
      });
    });
  });
}

function getJourneyStepsLayout(sectionDef, sectionBox, styles = defaultStyles) {
  const resolvedStyles = { ...defaultStyles, ...styles };
  if (!sectionDef || !sectionDef.journeySteps || !sectionBox) {
    return null;
  }

  const stepCount = 5;
  const stepWidth = Math.max(
    sectionBox.width / stepCount - 2 * resolvedStyles.padding,
    resolvedStyles.stickyNoteSize,
  );
  const stepHeight = resolvedStyles.stickyNoteSize;
  const stepY = sectionBox.y  + sectionBox.height - stepHeight - (resolvedStyles.padding * 2);

  const boxes = Array.from({ length: stepCount }, (_, index) => ({
    x: sectionBox.x + index * (stepWidth + 2 * resolvedStyles.stickyNoteSpacing),
    y: stepY,
    width: stepWidth,
    height: stepHeight,
  }));

  const arrows = boxes.slice(0, -1).map((box, index) => {
    const nextBox = boxes[index + 1];
    const centerY = stepY + stepHeight / 2;

    return {
      x1: box.x + stepWidth,
      y1: centerY,
      x2: nextBox.x,
      y2: centerY,
    };
  });

  return { boxes, arrows };
}

module.exports = {
  sanitizeInput,
  validateInput,
  distributeMissingPositions,
  getJourneyStepsLayout,
};
