const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const version = pkg.version;
const assetBase = process.env.ASSET_BASE || '.';

// Read the source template index.html
const src = path.join(__dirname, '..', 'index.html');
let contents = fs.readFileSync(src, 'utf8');

// Replace EJS-style placeholders with actual version number
contents = contents
  .replace(/<%=\s*version\s*%>/g, version)
  .replace(/<%=\s*assetBase\s*%>/g, assetBase);

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

// Copy canvasData.json and localizedData.json from apiops-cycles-method-data
const apiopsCyclesMethodDataDir = path.join(__dirname, '..', 'node_modules', 'apiops-cycles-method-data');
if (!fs.existsSync(apiopsCyclesMethodDataDir)) {
  console.error('apiops-cycles-method-data not found. Please run npm install.');
  process.exit(1);
}
if (!fs.existsSync(path.join(apiopsCyclesMethodDataDir, 'src', 'data', 'canvas'))) {
  console.error('Canvas data files not found in apiops-cycles-method-data. Please check the package.');
  process.exit(1);
}
if (!fs.existsSync(path.join(outDir, 'apiops-cycles-method-data'))) {
  fs.mkdirSync(path.join(outDir, 'apiops-cycles-method-data'), { recursive: true });
}
const canvasDataSrc = path.join(__dirname, '..', 'node_modules', 'apiops-cycles-method-data', 'src', 'data', 'canvas', 'canvasData.json');
const localizedDataSrc = path.join(__dirname, '..', 'node_modules', 'apiops-cycles-method-data', 'src', 'data', 'canvas', 'localizedData.json');
const canvasDataDest = path.join(outDir, 'apiops-cycles-method-data', 'canvasData.json');
const localizedDataDest = path.join(outDir, 'apiops-cycles-method-data', 'localizedData.json');
fs.copyFileSync(canvasDataSrc, canvasDataDest);
fs.copyFileSync(localizedDataSrc, localizedDataDest);
console.log('Copied canvasData.json and localizedData.json to dist directory');
