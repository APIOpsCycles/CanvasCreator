const { switchLocale } = require('../scripts/noteManager.js');

const fs = require('fs');

function loadLocalizedData(locale) {
  const json = JSON.parse(fs.readFileSync('data/localizedData.json', 'utf8'));
  return json[locale];
}

describe('localization and import/export', () => {
  test('switch locale updates data', () => {
    const content = { locale: 'en' };
    switchLocale(content, 'de');
    expect(content.locale).toBe('de');
  });

  test('localized data exists for en', () => {
    const data = loadLocalizedData('en');
    expect(data).toBeDefined();
    expect(data.apiBusinessModelCanvas.title).toBeDefined();
  });
});
