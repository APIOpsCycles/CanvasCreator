const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const version = pkg.version;

// Read the source template index.html
const src = path.join(__dirname, '..', 'index.html');
let contents = fs.readFileSync(src, 'utf8');

// Replace EJS-style placeholders with actual version number
contents = contents.replace(/<%=\s*version\s*%>/g, version);

// Adjust asset paths for the dist folder
contents = contents
  .replace(/href="\/canvascreator.min.css\?v=[^"]+"/, `href="canvascreator.min.css?v=${version}"`)
  .replace(/src="dist\/canvascreator.esm.min.js\?v=[^"]+"/, `src="./canvascreator.esm.min.js?v=${version}"`)
  .replace(/(["'])\.\/dist\/canvascreator\.esm\.min\.js/g, `$1./canvascreator.esm.min.js`)
  .replace(/src="\/img\//g, 'src="img/')
  .replace(/href="\/img\//g, 'href="img/');

// Write the processed file into dist so the original stays untouched
const outDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outFile = path.join(outDir, 'index.html');
fs.writeFileSync(outFile, contents);
console.log(`dist/index.html generated with version ${version}`);

// Copy the minified CSS
const cssSrc = path.join(__dirname, '..', 'canvascreator.min.css');
const cssDest = path.join(outDir, 'canvascreator.min.css');
fs.copyFileSync(cssSrc, cssDest);

// Copy images used by the HTML
const imgDir = path.join(__dirname, '..', 'img');
const imgDestDir = path.join(outDir, 'img');
if (!fs.existsSync(imgDestDir)) {
  fs.mkdirSync(imgDestDir, { recursive: true });
}
for (const file of fs.readdirSync(imgDir)) {
  fs.copyFileSync(path.join(imgDir, file), path.join(imgDestDir, file));
}
