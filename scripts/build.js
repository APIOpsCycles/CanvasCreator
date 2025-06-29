const fs = require('fs');
const path = require('path');

// Very small minifier to avoid external deps
function simpleMinify(code) {
  let out = '';
  let inString = false;
  let quote = '';
  let escape = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    const next = code[i + 1];

    if (inLineComment) {
      if (c === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (c === '*' && next === '/') {
        inBlockComment = false;
        i++; // skip /
      }
      continue;
    }

    if (inString) {
      out += c;
      if (escape) {
        escape = false;
      } else if (c === '\\') {
        escape = true;
      } else if (c === quote) {
        inString = false;
      }
      continue;
    }

    if (c === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }

    if (c === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }

    if (c === '\"' || c === "'" || c === '`') {
      inString = true;
      quote = c;
      out += c;
      continue;
    }

    if (!/\S/.test(c)) {
      if (out[out.length - 1] !== ' ') {
        out += ' ';
      }
      continue;
    }

    out += c;
  }

  return out.trim();
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
const main = stripCommon(
  fs.readFileSync(path.join(__dirname, '../src/main.js'), 'utf8'),
);

let bundle = `(function(global){\n${helpers}\n\n${main}\n\n  const exportsObj = {\n    createCanvas: loadCanvas,\n    loadCanvas,\n    sanitizeInput,\n    validateInput,\n    distributeMissingPositions\n  };\n  if (typeof module !== 'undefined' && module.exports) {\n    module.exports = exportsObj;\n  }\n  global.CanvasCreator = exportsObj;\n})(typeof window !== 'undefined' ? window : this);`;

const outDir = path.join(__dirname, '../dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(outDir, 'canvasCreator.js'), bundle);
console.log('Bundle written to dist/canvasCreator.js');

const minified = simpleMinify(bundle);
fs.writeFileSync(path.join(outDir, 'canvasCreator.min.js'), minified);
console.log('Minified bundle written to dist/canvasCreator.min.js');
