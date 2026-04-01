if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
}

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
let PDFDocument;
let SVGtoPDF;
const Canvas = require('canvas');

try {
  PDFDocument = require('pdfkit');
  SVGtoPDF = require('svg-to-pdfkit');
} catch (e) {
  PDFDocument = null;
}

const { createStickyNote, exportJSON } = require('../scripts/noteManager');
const { distributeMissingPositions, getJourneyStepsLayout } = require('./helpers');
const defaultStyles = require('./defaultStyles');

function buildFileName(prefix, canvasId, locale, ext) {
  const base = prefix || 'Canvas';
  return `${base}_${canvasId}_${locale}.${ext}`;
}

function cloneContent(content) {
  return JSON.parse(JSON.stringify(content));
}

function buildContent(
  canvasData,
  canvasId,
  locale,
  addPlaceholder,
  imported,
  forRender = false,
) {
  const canvasDef = canvasData[canvasId];
  if (imported) {
    const content = cloneContent(imported);
    if (forRender) {
      distributeMissingPositions(content, canvasDef, defaultStyles);
    }
    return content;
  }
  const content = {
    templateId: canvasId,
    locale,
    stickyNoteSize: defaultStyles.stickyNoteSize,
    metadata: { source: '', license: '', authors: [], website: '' },
    sections: canvasDef.sections.map((s) => ({ sectionId: s.id, stickyNotes: [] })),
  };
  if (addPlaceholder) {
    for (const sec of content.sections) {
      createStickyNote(content, sec.sectionId, 'Placeholder', {});
    }
  } else {
    distributeMissingPositions(content, canvasDef, defaultStyles);
  }
  return content;
}

function wrapText(text, maxWidth = defaultStyles.maxLineWidth) {
  const normalized = (text || '').replace(/\n{2,}/g, '\n');
  const words = normalized.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (test.length * 6 > maxWidth) {
      if (line) {
        lines.push(line.trim());
      }
      line = word + ' ';
    } else {
      line = test;
    }
  }
  if (line) {
    lines.push(line.trim());
  }
  return lines.join('\n');
}

function appendWrappedText(document, parent, {
  x,
  y,
  text,
  maxWidth,
  fontFamily = defaultStyles.fontFamily,
  fontSize = defaultStyles.fontSize,
  fontWeight = null,
  fill = defaultStyles.fontColor,
  lineHeight = fontSize + 2,
}) {
  const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  textNode.setAttribute('x', x);
  textNode.setAttribute('y', y);
  textNode.setAttribute('text-anchor', 'start');
  textNode.setAttribute('font-family', fontFamily);
  textNode.setAttribute('font-size', fontSize);
  textNode.setAttribute('fill', fill);
  if (fontWeight) {
    textNode.setAttribute('font-weight', fontWeight);
  }

  const lines = wrapText(text, maxWidth).split('\n').filter((line) => line.length > 0);
  const lineCount = Math.max(lines.length, 1);
  lines.forEach((line, idx) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    if (idx > 0) {
      tspan.setAttribute('x', x);
      tspan.setAttribute('dy', lineHeight);
    }
    tspan.textContent = line;
    textNode.appendChild(tspan);
  });

  parent.appendChild(textNode);
  return {
    lineCount,
    bottomY: y + (lineCount - 1) * lineHeight,
  };
}

function appendJourneyStepsSvg(document, parent, sectionDef, sectionBox) {
  const layout = getJourneyStepsLayout(sectionDef, sectionBox, defaultStyles);
  if (!layout) {
    return;
  }

  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('class', 'cc-journey-steps');

  layout.boxes.forEach((box) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', box.x);
    rect.setAttribute('y', box.y);
    rect.setAttribute('width', box.width);
    rect.setAttribute('height', box.height);
    rect.setAttribute('fill', '#fff');
    rect.setAttribute('stroke', defaultStyles.borderColor);
    rect.setAttribute('stroke-width', defaultStyles.lineSize);
    rect.setAttribute('stroke-dasharray', 3 * defaultStyles.lineSize);
    rect.setAttribute('rx', defaultStyles.cornerRadius / 2);
    rect.setAttribute('ry', defaultStyles.cornerRadius / 2);
    group.appendChild(rect);
  });

  layout.arrows.forEach((arrow) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', arrow.x1);
    line.setAttribute('y1', arrow.y1);
    line.setAttribute('x2', arrow.x2);
    line.setAttribute('y2', arrow.y2);
    line.setAttribute('stroke', defaultStyles.borderColor);
    line.setAttribute('stroke-width', 2 * defaultStyles.lineSize);
    line.setAttribute('marker-end', 'url(#journey-arrowhead)');
    group.appendChild(line);
  });

  parent.appendChild(group);
}

function renderSVG(canvasDef, localizedData, content) {
  const logo = fs.readFileSync(
    path.join(__dirname, '../img/apiops-cycles-logo2025-blue.svg'),
    'utf8',
  );

  const dom = new JSDOM('<!DOCTYPE html><svg xmlns="http://www.w3.org/2000/svg"></svg>');
  const document = dom.window.document;
  const svg = document.querySelector('svg');
  svg.setAttribute('width', defaultStyles.width + defaultStyles.padding * 2);
  svg.setAttribute('height', defaultStyles.height);
  svg.setAttribute('font-family', defaultStyles.fontFamily);
  svg.setAttribute('font-size', defaultStyles.fontSize);
  svg.setAttribute('style', `background-color: ${defaultStyles.backgroundColor}`);

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', 'shadow');
  const drop = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
  drop.setAttribute('dx', 3);
  drop.setAttribute('dy', 3);
  drop.setAttribute('stdDeviation', 2);
  drop.setAttribute('flood-color', defaultStyles.shadowColor);
  filter.appendChild(drop);
  defs.appendChild(filter);
  svg.appendChild(defs);

  const logoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  logoGroup.setAttribute(
    'transform',
    `translate(${defaultStyles.padding}, ${defaultStyles.padding / 2}) scale(0.1,0.1)`,
  );
  logoGroup.innerHTML = logo;
  svg.appendChild(logoGroup);

  const locCanvas =
    (localizedData[content.locale] && localizedData[content.locale][canvasDef.id]) || {};

  const cellWidth = Math.floor(
    (defaultStyles.width - canvasDef.layout.columns * defaultStyles.padding) /
      canvasDef.layout.columns,
  );

  const headerTextX = defaultStyles.headerHeight + 2 * defaultStyles.padding;
  const headerTextWidth = defaultStyles.width - headerTextX - 2 * defaultStyles.padding;
  let headerBottomY = 0;

  const titleLayout = appendWrappedText(document, svg, {
    x: headerTextX,
    y: 2 * defaultStyles.padding + defaultStyles.fontSize,
    text: locCanvas.title || canvasDef.id,
    maxWidth: headerTextWidth,
    fontSize: defaultStyles.fontSize + 4,
    fontWeight: 'bold',
    fill: defaultStyles.fontColor,
    lineHeight: defaultStyles.fontSize + 6,
  });
  headerBottomY = titleLayout.bottomY;

  if (locCanvas.purpose) {
    const purposeLayout = appendWrappedText(document, svg, {
      x: headerTextX,
      y: headerBottomY + defaultStyles.padding + 2,
      text: locCanvas.purpose,
      maxWidth: headerTextWidth,
      fontSize: defaultStyles.fontSize + 2,
      fill: defaultStyles.fontColor,
      lineHeight: defaultStyles.fontSize + 3,
    });
    headerBottomY = purposeLayout.bottomY;
  }

  if (locCanvas.howToUse) {
    const howToUseLayout = appendWrappedText(document, svg, {
      x: headerTextX,
      y: headerBottomY + defaultStyles.padding + 4,
      text: locCanvas.howToUse,
      maxWidth: headerTextWidth,
      fontSize: defaultStyles.fontSize + 2,
      fill: defaultStyles.fontColor,
      lineHeight: defaultStyles.fontSize + 2,
    });
    headerBottomY = howToUseLayout.bottomY;
  }

  const gridTop = Math.max(
    defaultStyles.headerHeight,
    headerBottomY + 2 * defaultStyles.padding,
  );
  const cellHeight = Math.floor(
    (defaultStyles.height -
      gridTop -
      defaultStyles.footerHeight -
      3 * defaultStyles.padding) /
      canvasDef.layout.rows,
  );
  const noteParts = [];
  const hasStickyNotes = content.sections.some(
    (section) => section.stickyNotes && section.stickyNotes.length > 0,
  );
  const hasJourneySteps = canvasDef.sections.some((section) => section.journeySteps);

  if (hasJourneySteps) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'journey-arrowhead');
    marker.setAttribute('markerWidth', 4);
    marker.setAttribute('markerHeight', 7);
    marker.setAttribute('refX', 5);
    marker.setAttribute('refY', 3.5);
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 5 3.5, 0 7');
    polygon.setAttribute('fill', defaultStyles.borderColor);
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
  }

  for (const secDef of canvasDef.sections) {
    const x = secDef.gridPosition.column * cellWidth + 2 * defaultStyles.padding;
    const y = secDef.gridPosition.row * cellHeight + gridTop;
    const w = secDef.gridPosition.colSpan * cellWidth;
    const h = secDef.gridPosition.rowSpan * cellHeight;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute(
      'fill',
      secDef.highlight ? defaultStyles.highlightColor : defaultStyles.sectionColor,
    );
    rect.setAttribute('stroke', defaultStyles.borderColor);
    rect.setAttribute('rx', defaultStyles.cornerRadius);
    rect.setAttribute('ry', defaultStyles.cornerRadius);
    svg.appendChild(rect);

    if (secDef.journeySteps) {
      appendJourneyStepsSvg(document, svg, secDef, { x, y, width: w, height: h });
    }

    const label =
      locCanvas.sections && locCanvas.sections[secDef.id]
        ? locCanvas.sections[secDef.id].section
        : secDef.id;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x + defaultStyles.padding);
    circle.setAttribute('cy', y + defaultStyles.padding);
    circle.setAttribute('r', defaultStyles.circleRadius);
    circle.setAttribute('fill', defaultStyles.borderColor);
    svg.appendChild(circle);

    const numText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    numText.setAttribute('x', x + defaultStyles.padding);
    numText.setAttribute('y', y + defaultStyles.padding + 5);
    numText.setAttribute('text-anchor', 'middle');
    numText.setAttribute('font-family', defaultStyles.fontFamily);
    numText.setAttribute('font-size', defaultStyles.fontSize);
    numText.setAttribute('fill', defaultStyles.highlightColor);
    numText.textContent = secDef.fillOrder;
    svg.appendChild(numText);

    const titleLayoutInSection = appendWrappedText(document, svg, {
      x: x + defaultStyles.padding + defaultStyles.circleRadius,
      y: y + defaultStyles.padding + defaultStyles.circleRadius,
      text: label,
      maxWidth: w - 2 * defaultStyles.padding - defaultStyles.circleRadius,
      fontWeight: 'bold',
      fill: defaultStyles.fontColor,
      lineHeight: defaultStyles.fontSize + 2,
    });

    const section = content.sections.find((s) => s.sectionId === secDef.id);
    if (section && section.stickyNotes.length > 0) {
      for (const note of section.stickyNotes) {
        const noteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        noteRect.setAttribute('x', note.position.x || 0);
        noteRect.setAttribute('y', note.position.y || 0);
        noteRect.setAttribute('width', note.size);
        noteRect.setAttribute('height', note.size);
        noteRect.setAttribute('fill', note.color);
        noteRect.setAttribute('stroke', note.color || defaultStyles.stickyNoteBorderColor);
        noteRect.setAttribute('rx', defaultStyles.stickyNoteCornerRadius);
        noteRect.setAttribute('ry', defaultStyles.stickyNoteCornerRadius);
        noteParts.push(noteRect);

        const noteText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        noteText.setAttribute('x', (note.position.x || 0) + defaultStyles.padding / 2);
        noteText.setAttribute(
          'y',
          (note.position.y || 0) + defaultStyles.fontSize + defaultStyles.padding / 2,
        );
        noteText.setAttribute('fill', defaultStyles.contentFontColor);
        const lines = wrapText(
          note.content,
          note.size - defaultStyles.padding,
        ).split('\n');
        lines.forEach((line, idx) => {
          const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          if (idx > 0) {
            tspan.setAttribute('x', (note.position.x || 0) + defaultStyles.padding / 2);
            tspan.setAttribute('dy', defaultStyles.fontSize + 2);
          }
          tspan.textContent = line;
          noteText.appendChild(tspan);
        });
        noteParts.push(noteText);
      }
    } else if (!hasStickyNotes) {
      const desc =
        locCanvas.sections &&
        locCanvas.sections[secDef.id] &&
        locCanvas.sections[secDef.id].description;
      if (desc) {
        appendWrappedText(document, svg, {
          x: x + defaultStyles.padding,
          y: titleLayoutInSection.bottomY + defaultStyles.padding + 2,
          text: desc,
          maxWidth: w - 2 * defaultStyles.padding,
          fill: defaultStyles.fontColor,
          lineHeight: defaultStyles.fontSize + 2,
        });
      }
    }
  }

  for (const node of noteParts) {
    svg.appendChild(node);
  }

  const footer = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  footer.setAttribute('class', 'footer');
  footer.setAttribute('x', defaultStyles.width / 2);
  footer.setAttribute('y', defaultStyles.height - defaultStyles.footerHeight);
  footer.setAttribute('text-anchor', 'middle');
  footer.setAttribute('font-family', defaultStyles.fontFamily);
  footer.setAttribute('font-size', defaultStyles.fontSize);
  footer.setAttribute('fill', defaultStyles.fontColor);
  footer.innerHTML =
    `Template by: ${canvasDef.metadata.source} | ${canvasDef.metadata.license} | ${canvasDef.metadata.authors.join(', ')} | <a href='http://${canvasDef.metadata.website}' target='_blank'>${canvasDef.metadata.website}</a>`;
  svg.appendChild(footer);

  return svg.outerHTML;
}

function writePDF(svgString, outPath) {
  return new Promise((resolve, reject) => {
    if (!PDFDocument) {
      reject(new Error('pdfkit not installed'));
      return;
    }
    const doc = new PDFDocument({ size: [defaultStyles.width, defaultStyles.height] });
    SVGtoPDF(doc, svgString, 0, 0);
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);
    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

function writePNG(svgString, outPath) {
  return new Promise((resolve, reject) => {
    const { createCanvas, loadImage } = Canvas;
    const canvas = createCanvas(
      defaultStyles.width + defaultStyles.padding * 2,
      defaultStyles.height,
    );
    loadImage(`data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`)
      .then((img) => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const out = fs.createWriteStream(outPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', resolve);
        out.on('error', reject);
      })
      .catch(reject);
  });
}

module.exports = {
  buildContent,
  buildFileName,
  renderSVG,
  writePDF,
  writePNG,
  exportJSON,
};
