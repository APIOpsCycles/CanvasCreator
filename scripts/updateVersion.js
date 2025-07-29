const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const version = pkg.version;

const file = path.join(__dirname, '..', 'index.html');
let contents = fs.readFileSync(file, 'utf8');

// Replace EJS-style placeholders with actual version number
contents = contents.replace(/<%=\s*version\s*%>/g, version);

fs.writeFileSync(file, contents);
console.log(`index.html updated with version ${version}`);
