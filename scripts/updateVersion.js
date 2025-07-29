const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const version = pkg.version;

// Read the source template index.html
const src = path.join(__dirname, '..', 'index.html');
let contents = fs.readFileSync(src, 'utf8');

// Replace EJS-style placeholders with actual version number
contents = contents.replace(/<%=\s*version\s*%>/g, version);

// Write the processed file into dist so the original stays untouched
const outDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outFile = path.join(outDir, 'index.html');
fs.writeFileSync(outFile, contents);
console.log(`dist/index.html generated with version ${version}`);
