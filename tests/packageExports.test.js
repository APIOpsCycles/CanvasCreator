const fs = require('fs');
const path = require('path');

describe('package exports', () => {
  test('style and image assets are exported through package.json', () => {
    const pkg = require('../package.json');

    expect(pkg.exports['./style.css']).toBe('./canvascreator.min.css');
    expect(pkg.exports['./img/*']).toBe('./img/*');
    expect(pkg.files).toContain('canvascreator.min.css');
  });

  test('exported asset targets exist in the repository', () => {
    expect(
      fs.existsSync(path.join(__dirname, '..', 'canvascreator.min.css')),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          __dirname,
          '..',
          'img',
          'apiops-cycles-logo-2025-64.png',
        ),
      ),
    ).toBe(true);
  });
});
