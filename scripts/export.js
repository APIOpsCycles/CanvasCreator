if (typeof TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
  global.TextDecoder = require("util").TextDecoder;
}
const fs = require('fs');
const path = require('path');
const { JSDOM } = require("jsdom");
let pdfLib;
try {
  pdfLib = require("pdf-lib");
} catch (e) {
  pdfLib = null;
}
const { createStickyNote, exportJSON } = require('./noteManager');
const { distributeMissingPositions } = require('../src/helpers');

const defaultStyles = {
  width: 1000,
  height: 712,
  headerHeight: 80,
  footerHeight: 30,
  fontSize: 12,
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f5f5ff',
  borderColor: '#1a3987',
  fontColor: '#1a3987',
  contentFontColor: '#333',
  highlightColor: '#d7e3fe',
  sectionColor: '#ffffff',
  padding: 10,
  cornerRadius: 10,
  circleRadius: 14,
  lineSize: 1,
  shadowColor: 'rgba(0, 0, 0, 0.2)',
  stickyNoteSize: 80,
  stickyNoteSpacing: 10,
  stickyNoteCornerRadius: 3,
  maxLineWidth: 70,
  stickyNoteColor: '#FFF399',
  stickyNoteBorderColor: '#333',
  defaultLocale: 'en-US',
};

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
    rect.setAttribute('fill', defaultStyles.sectionColor);
    rect.setAttribute('stroke', defaultStyles.borderColor);
    svg.appendChild(rect);

    const label =
      locCanvas.sections && locCanvas.sections[secDef.id]
        ? locCanvas.sections[secDef.id].section
        : secDef.id;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + defaultStyles.padding);
    text.setAttribute('y', y + defaultStyles.padding + defaultStyles.fontSize);
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', defaultStyles.fontColor);
    text.textContent = label;
    svg.appendChild(text);

    const section = content.sections.find((s) => s.sectionId === secDef.id);
    if (section) {
      for (const note of section.stickyNotes) {
        const noteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        noteRect.setAttribute('x', note.position.x || 0);
        noteRect.setAttribute('y', note.position.y || 0);
        noteRect.setAttribute('width', note.size);
        noteRect.setAttribute('height', note.size);
        noteRect.setAttribute('fill', note.color);
        noteRect.setAttribute('stroke', defaultStyles.stickyNoteBorderColor);
        svg.appendChild(noteRect);

        const noteText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        noteText.setAttribute('x', (note.position.x || 0) + defaultStyles.padding / 2);
        noteText.setAttribute('y', (note.position.y || 0) + defaultStyles.fontSize + defaultStyles.padding / 2);
        noteText.setAttribute('fill', defaultStyles.contentFontColor);
        noteText.textContent = note.content;
        svg.appendChild(noteText);
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

async function writePDF(svgString, outPath) {
  if (!pdfLib) {
    throw new Error('pdf-lib not installed');
  }
  const { PDFDocument } = pdfLib;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([defaultStyles.width, defaultStyles.height]);
  const svgImage = await pdfDoc.embedSvg(svgString);
  page.drawImage(svgImage, { x: 0, y: 0, width: defaultStyles.width, height: defaultStyles.height });
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outPath, pdfBytes);
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
    const content = buildContent(canvasData, id, locale, !imports[id], imports[id]);
    const filename = (ext) => path.join(process.cwd(), buildFileName(prefix, id, locale, ext));
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

module.exports = { buildContent, buildFileName };
