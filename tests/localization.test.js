const { switchLocale } = require('../scripts/noteManager.js');

const fs = require('fs');

function loadLocalizedData(locale) {
  const json = JSON.parse(fs.readFileSync('data/localizedData.json', 'utf8'));
  return json[locale];
}

describe('localization and import/export', () => {
  test('switch locale updates data', () => {
    const content = { locale: 'en-US' };
    switchLocale(content, 'de-DE');
    expect(content.locale).toBe('de-DE');
  });

  test('localized data exists for en-US', () => {
    const data = loadLocalizedData('en-US');
    expect(data).toBeDefined();
    expect(data.apiBusinessModelCanvas.title).toBeDefined();
  });
});
