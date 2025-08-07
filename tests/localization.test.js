const { switchLocale } = require('../scripts/noteManager.js');

const localizedData = require('apiops-cycles-method-data/localizedData.json');

function loadLocalizedData(locale) {
  return localizedData[locale];
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
