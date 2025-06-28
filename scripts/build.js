const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '../src/helpers.js'),
  path.join(__dirname, '../src/main.js'),
  path.join(__dirname, '../src/index.js'),
];

let bundle = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');

const outDir = path.join(__dirname, '../dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(outDir, 'canvasCreator.js'), bundle);
console.log('Bundle written to dist/canvasCreator.js');
