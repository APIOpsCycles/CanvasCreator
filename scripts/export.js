#!/usr/bin/env node
if (typeof TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
  global.TextDecoder = require("util").TextDecoder;
}
const fs = require('fs');
const path = require('path');
const { JSDOM } = require("jsdom");
let PDFDocument, SVGtoPDF;
try {
  PDFDocument = require("pdfkit");
  SVGtoPDF = require("svg-to-pdfkit");
} catch (e) {
  PDFDocument = null;
}
const { createStickyNote, exportJSON } = require('./noteManager');
const { distributeMissingPositions } = require('../src/helpers');
const defaultStyles = require('../src/defaultStyles');

function buildFileName(prefix, canvasId, locale, ext) {

  const base = prefix || 'Canvas';
  return `${base}_${canvasId}_${locale}.${ext}`;
}

function parseArgs(argv) {
  const res = {};
  for (let i=0; i<argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i+1];
      if (next && !next.startsWith("--")) {
        res[key] = next;
        i++;
      } else {
        res[key] = true;
      }
    }
  }
  return res;
}

function printUsage() {
  console.log(`Usage: node scripts/export.js [options]

Options:
  --locale <code>       language for the exported canvas (default en-US)
  --format <json|svg|pdf> output file type
  --prefix <name>       prefix for generated filenames (default Canvas)
  --all                 export every canvas from data/canvasData.json
  --canvas <id>         export a single canvas by id
  --import <file>       load an existing JSON content file instead of placeholders
  --help                show this help text`);
}

function buildContent(canvasData, canvasId, locale, addPlaceholder, imported) {
  if (imported) {
    return imported;
  }
  const canvasDef = canvasData[canvasId];
  const content = {
    templateId: canvasId,
    locale,
    stickyNoteSize: defaultStyles.stickyNoteSize,
    metadata: { source: '', license: '', authors: [], website: '' },
    sections: canvasDef.sections.map((s) => ({ sectionId: s.id, stickyNotes: [] })),
  };
  if (addPlaceholder) {
    for (const sec of content.sections) {
      // create placeholder without coordinates
      createStickyNote(content, sec.sectionId, 'Placeholder', {});
    }
  } else {
    distributeMissingPositions(content, canvasDef, defaultStyles);
  }
  return content;
}

function wrapText(text, maxWidth = defaultStyles.maxLineWidth) {
  const normalized = text.replace(/\n{2,}/g, '\n');
  const words = normalized.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (test.length * 6 > maxWidth) {
      if (line) lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test;
    }
  }
  if (line) lines.push(line.trim());
  return lines.join('\n');
}

function renderSVG(canvasDef, localizedData, content) {
  const logo = fs.readFileSync(
    path.join(__dirname, '../img/apiops-cycles-logo2025-blue.svg'),
    'utf8',
  );

  const dom = new JSDOM(`<!DOCTYPE html><svg xmlns="http://www.w3.org/2000/svg"></svg>`);
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
  const cellHeight = Math.floor(
    (defaultStyles.height -
      defaultStyles.headerHeight -
      defaultStyles.footerHeight -
      4 * defaultStyles.padding) /
      canvasDef.layout.rows,
  );

  const title = locCanvas.title || canvasDef.id;
  const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleText.setAttribute('x', defaultStyles.headerHeight + 2 * defaultStyles.padding);
  titleText.setAttribute('y', 2 * defaultStyles.padding + defaultStyles.fontSize);
  titleText.setAttribute('font-weight', 'bold');
  titleText.setAttribute('fill', defaultStyles.fontColor);
  titleText.textContent = title;
  svg.appendChild(titleText);

  if (locCanvas.purpose) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', defaultStyles.headerHeight + 2 * defaultStyles.padding);
    t.setAttribute('y', defaultStyles.headerHeight - 3 * defaultStyles.padding);
    t.setAttribute('text-anchor', 'start');
    t.setAttribute('font-family', defaultStyles.fontFamily);
    t.setAttribute('font-size', defaultStyles.fontSize + 2);
    t.setAttribute('fill', defaultStyles.fontColor);
    t.textContent = locCanvas.purpose;
    svg.appendChild(t);
  }

  if (locCanvas.howToUse) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', defaultStyles.headerHeight + 2 * defaultStyles.padding);
    t.setAttribute('y', defaultStyles.headerHeight - defaultStyles.padding);
    t.setAttribute('text-anchor', 'start');
    t.setAttribute('font-family', defaultStyles.fontFamily);
    t.setAttribute('font-size', defaultStyles.fontSize + 2);
    t.setAttribute('fill', defaultStyles.fontColor);
    t.textContent = locCanvas.howToUse;
    svg.appendChild(t);
  }

  for (const secDef of canvasDef.sections) {
    const x = secDef.gridPosition.column * cellWidth + 2 * defaultStyles.padding;
    const y = secDef.gridPosition.row * cellHeight + defaultStyles.headerHeight;
    const w = secDef.gridPosition.colSpan * cellWidth;
    const h = secDef.gridPosition.rowSpan * cellHeight;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute(
      'fill',
      secDef.highlight ? defaultStyles.highlightColor : defaultStyles.sectionColor
    );
    rect.setAttribute('stroke', defaultStyles.borderColor);
    rect.setAttribute('rx', defaultStyles.cornerRadius);
    rect.setAttribute('ry', defaultStyles.cornerRadius);
    svg.appendChild(rect);

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

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + defaultStyles.padding + defaultStyles.circleRadius);
    text.setAttribute('y', y + defaultStyles.padding + defaultStyles.circleRadius);
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', defaultStyles.fontColor);
    text.textContent = label;
    svg.appendChild(text);

    const section = content.sections.find((s) => s.sectionId === secDef.id);
    if (section && section.stickyNotes.length > 0) {
      for (const note of section.stickyNotes) {
        const noteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        noteRect.setAttribute('x', note.position.x || 0);
        noteRect.setAttribute('y', note.position.y || 0);
        noteRect.setAttribute('width', note.size);
        noteRect.setAttribute('height', note.size);
        noteRect.setAttribute('fill', note.color);
        noteRect.setAttribute('stroke', defaultStyles.stickyNoteBorderColor);
        noteRect.setAttribute('rx', defaultStyles.stickyNoteCornerRadius);
        noteRect.setAttribute('ry', defaultStyles.stickyNoteCornerRadius);
        svg.appendChild(noteRect);

        const noteText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        noteText.setAttribute('x', (note.position.x || 0) + defaultStyles.padding / 2);
        noteText.setAttribute('y', (note.position.y || 0) + defaultStyles.fontSize + defaultStyles.padding / 2);
        noteText.setAttribute('fill', defaultStyles.contentFontColor);
        const lines = wrapText(
          note.content,
          note.size - defaultStyles.padding
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
        svg.appendChild(noteText);
      }
    } else {
      const desc =
        locCanvas.sections &&
        locCanvas.sections[secDef.id] &&
        locCanvas.sections[secDef.id].description;
      if (desc) {
        const dText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dText.setAttribute('x', x + defaultStyles.padding);
        dText.setAttribute(
          'y',
          y + defaultStyles.padding + defaultStyles.circleRadius + defaultStyles.fontSize
        );
        dText.setAttribute('fill', defaultStyles.fontColor);
        const lines = wrapText(
          desc,
          w - 2 * defaultStyles.padding
        ).split('\n');
        lines.forEach((line, idx) => {
          const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          if (idx > 0) {
            tspan.setAttribute('x', x + defaultStyles.padding);
            tspan.setAttribute('dy', defaultStyles.fontSize + 2);
          }
          tspan.textContent = line;
          dText.appendChild(tspan);
        });
        svg.appendChild(dText);
      }
    }
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }
  const known = ['locale', 'format', 'prefix', 'all', 'canvas', 'import', 'help'];
  for (const k of Object.keys(args)) {
    if (!known.includes(k)) {
      printUsage();
      return;
    }
  }
  const locale = args.locale || 'en-US';
  const format = args.format || 'json';
  const prefix = args.prefix || 'Canvas';
  const canvasData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/canvasData.json'), 'utf8'));
  const localizedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/localizedData.json'), 'utf8'));

  const canvasIds = args.all ? Object.keys(canvasData) : ([]).concat(args.canvas || []);
  if (canvasIds.length === 0) {
    printUsage();
    return;
  }
  const imports = {};
  if (args.import) {
    const files = Array.isArray(args.import) ? args.import : [args.import];
    for (const file of files) {
      const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
      imports[obj.templateId] = obj;
    }
  }
  for (const id of canvasIds) {
    const addPlaceholder = format === 'json' && !imports[id];
    const content = buildContent(
      canvasData,
      id,
      locale,
      addPlaceholder,
      imports[id]
    );
    const outDir = path.join(process.cwd(), 'export');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const filename = (ext) => path.join(outDir, buildFileName(prefix, id, locale, ext));
    if (format === 'json') {
      fs.writeFileSync(filename('json'), exportJSON(content));
    } else {
      const svg = renderSVG(canvasData[id], localizedData, content);
      fs.writeFileSync(filename('svg'), svg);
      if (format === 'pdf') {
        await writePDF(svg, filename('pdf'));
      }
    }
    if (localizedData[locale] && localizedData[locale][id]) {
      // nothing yet but loaded to ensure locale exists
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { buildContent, buildFileName, renderSVG };
