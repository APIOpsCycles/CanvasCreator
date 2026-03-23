#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  buildContent,
  buildFileName,
  renderSVG,
  writePDF,
  writePNG,
  exportJSON,
} = require('../src/node-export.cjs');

function parseArgs(argv) {
  const res = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
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
  --locale <code>       language for the exported canvas (default en)
  --format <json|svg|pdf|png> output file type
  --prefix <name>       prefix for generated filenames (default Canvas)
  --all                 export every canvas from apiops-cycles-method-data
  --canvas <id>         export a single canvas by id
  --import <file>       load an existing JSON content file instead of placeholders
  --outdir <folder>     output directory for exported files (default export)
  --help                show this help text`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }
  const known = ['locale', 'format', 'prefix', 'all', 'canvas', 'import', 'outdir', 'help'];
  for (const k of Object.keys(args)) {
    if (!known.includes(k)) {
      printUsage();
      return;
    }
  }

  const locale = args.locale || 'en';
  const format = args.format || 'json';
  const prefix = args.prefix || 'Canvas';
  const outDir = path.resolve(process.cwd(), args.outdir || 'export');
  const canvasData = require('apiops-cycles-method-data/canvasData.json');
  const localizedData = require('apiops-cycles-method-data/localizedData.json');

  const canvasIds = args.all ? Object.keys(canvasData) : [].concat(args.canvas || []);
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

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const id of canvasIds) {
    const addPlaceholder = format === 'json' && !imports[id];
    const content = buildContent(
      canvasData,
      id,
      locale,
      addPlaceholder,
      imports[id],
      format !== 'json',
    );
    const filename = (ext) => path.join(outDir, buildFileName(prefix, id, locale, ext));

    if (format === 'json') {
      fs.writeFileSync(filename('json'), exportJSON(content));
      continue;
    }

    const svg = renderSVG(canvasData[id], localizedData, content);
    fs.writeFileSync(filename('svg'), svg);
    if (format === 'pdf') {
      await writePDF(svg, filename('pdf'));
    } else if (format === 'png') {
      await writePNG(svg, filename('png'));
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { parseArgs, printUsage, main };
