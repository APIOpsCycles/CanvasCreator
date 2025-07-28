const fs = require('fs');
const path = require('path');
const terser = require('terser');

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'),
);
const version = pkg.version;

function updateIndexHtml() {
  const indexPath = path.join(__dirname, '../index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(
    /canvascreator\.min\.css\?v=[0-9]+\.[0-9]+\.[0-9]+/i,
    `canvascreator.min.css?v=${version}`,
  );
  html = html.replace(
    /canvasCreator\.min\.js\?v=[0-9]+\.[0-9]+\.[0-9]+/,
    `canvasCreator.min.js?v=${version}`,
  );
  fs.writeFileSync(indexPath, html);
  console.log(`index.html updated to version ${version}`);
}

function stripCommon(code) {
  return code
    .replace(
      /\s*const\s+\{[^}]+\}\s*=\s*require\(['"]\.\/helpers['"]\);?\r?\n/s,
      '',
    )
    .replace(/module\.exports\s*=\s*\{[^}]*\};?\r?\n?/gs, '')
    .trim();
}

const helpers = stripCommon(
  fs.readFileSync(path.join(__dirname, '../src/helpers.js'), 'utf8'),
);

// Load main source and inject latest JSON data
let mainSrc = fs.readFileSync(
  path.join(__dirname, '../src/main.js'),
  'utf8',
);

const canvasData = JSON.stringify(
  JSON.parse(fs.readFileSync(path.join(__dirname, '../data/canvasData.json'))),
);
const localizedData = JSON.stringify(
  JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/localizedData.json')),
  ),
);

// Inline the JSON data for the browser bundle
mainSrc = mainSrc.replace(
  /const canvasData = require\(["']..\/data\/canvasData\.json["']\);/,
  `const canvasData = ${canvasData};`,
);
mainSrc = mainSrc.replace(
  /const localizedData = require\(["']..\/data\/localizedData\.json["']\);/,
  `const localizedData = ${localizedData};`,
);

const main = stripCommon(mainSrc);

let bundle = `(function(global){\n${helpers}\n\n${main}\n\n  const exportsObj = {\n    createCanvas: loadCanvas,\n    loadCanvas,\n    sanitizeInput,\n    validateInput,\n    distributeMissingPositions\n  };\n  if (typeof module !== 'undefined' && module.exports) {\n    module.exports = exportsObj;\n  }\n  global.CanvasCreator = exportsObj;\n})(typeof window !== 'undefined' ? window : this);`;

const outDir = path.join(__dirname, '../dist');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'canvasCreator.js'), bundle);
console.log('Bundle written to dist/canvasCreator.js');

async function buildMin() {
  const result = await terser.minify(bundle);
  if (result.code) {
    fs.writeFileSync(path.join(outDir, 'canvasCreator.min.js'), result.code);
    console.log('Minified bundle written to dist/canvasCreator.min.js');
    updateIndexHtml();
  } else {
    throw new Error('Terser minification failed');
  }
}

buildMin().catch((err) => {
  console.error(err);
  process.exit(1);
});
