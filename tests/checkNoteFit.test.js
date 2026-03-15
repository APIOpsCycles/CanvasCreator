const fs = require('fs');
const path = require('path');
const { analyzeContentFit, wrapTextForNote } = require('../scripts/checkNoteFit');
const canvasData = require('apiops-cycles-method-data/canvasData.json');
const { buildContent } = require('../scripts/export');

describe('checkNoteFit helpers', () => {
  test('wrapTextForNote preserves long words as a detectable overflow risk', () => {
    const lines = wrapTextForNote('CanvasCreator', 80);
    expect(lines).toEqual(['CanvasCreator']);
  });

  test('analyzeContentFit reports a long overflowing note', () => {
    const imported = {
      templateId: 'apiBusinessModelCanvas',
      locale: 'en',
      metadata: {
        source: 'APIOps Cycles method',
        license: 'CC-BY-SA 4.0',
        authors: ['Test Author'],
        website: 'www.apiopscycles.com',
        date: '2026-03-15T08:00:00.000Z',
      },
      sections: [
        {
          sectionId: 'keyPartners',
          stickyNotes: [
            { content: 'CanvasCreator', size: 80, color: '#FFF399' },
          ],
        },
      ],
    };

    const content = buildContent(
      canvasData,
      'apiBusinessModelCanvas',
      'en',
      false,
      imported,
      true,
    );
    const issues = analyzeContentFit(content);

    expect(issues).toHaveLength(1);
    expect(issues[0].overflow.horizontal).toBe(true);
  });

  test('German business model example passes the fit check', () => {
    const filePath = path.join(
      __dirname,
      '..',
      'examples',
      'Canvas_apiBusinessModelCanvas_de.json',
    );
    const imported = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const content = buildContent(
      canvasData,
      imported.templateId,
      imported.locale,
      false,
      imported,
      true,
    );

    expect(analyzeContentFit(content)).toEqual([]);
  });
});
