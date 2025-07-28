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

const defaultStyles = {
  width: 1000,
  height: 712,
  headerHeight: 80,
  footerHeight: 30,
  padding: 10,
  stickyNoteSize: 80,
  stickyNoteSpacing: 10,
  stickyNoteColor: '#FFF399',
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
      createStickyNote(content, sec.sectionId, 'Placeholder');
    }
  }
  distributeMissingPositions(content, canvasDef, defaultStyles);
  return content;
}

function renderSVG(canvasDef, content) {
  const dom = new JSDOM(`<!DOCTYPE html><svg xmlns="http://www.w3.org/2000/svg"></svg>`);
  const document = dom.window.document;
  const svg = document.querySelector('svg');
  svg.setAttribute('width', defaultStyles.width);
  svg.setAttribute('height', defaultStyles.height);

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
    rect.setAttribute('fill', '#ffffff');
    rect.setAttribute('stroke', '#000000');
    svg.appendChild(rect);

    const section = content.sections.find((s) => s.sectionId === secDef.id);
    if (section) {
      for (const note of section.stickyNotes) {
        const noteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        noteRect.setAttribute('x', note.position.x);
        noteRect.setAttribute('y', note.position.y);
        noteRect.setAttribute('width', note.size);
        noteRect.setAttribute('height', note.size);
        noteRect.setAttribute('fill', note.color);
        noteRect.setAttribute('stroke', '#333');
        svg.appendChild(noteRect);
      }
    }
  }

  return svg.outerHTML;
}

function writePDF(svgString, outPath) {
  return new Promise((resolve, reject) => {
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
  const locale = args.locale || 'en-US';
  const format = args.format || 'json';
  const prefix = args.prefix || 'Canvas';
  const canvasData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/canvasData.json'), 'utf8'));
  const localizedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/localizedData.json'), 'utf8'));

  const canvasIds = args.all ? Object.keys(canvasData) : ([]).concat(args.canvas || []);
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
      const svg = renderSVG(canvasData[id], content);
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
