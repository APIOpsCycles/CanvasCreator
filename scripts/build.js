const fs = require('fs');
const path = require('path');
const terser = require('terser');

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
const main = stripCommon(
  fs.readFileSync(path.join(__dirname, '../src/main.js'), 'utf8'),
);

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
  } else {
    throw new Error('Terser minification failed');
  }
}

buildMin().catch((err) => {
  console.error(err);
  process.exit(1);
});
