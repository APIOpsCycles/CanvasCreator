const { buildContent, buildFileName, renderSVG, writePNG } = require('../scripts/export.js');
const { exportJSON } = require('../scripts/noteManager.js');
const canvasData = require('apiops-cycles-method-data/canvasData.json');
const localizedData = require('apiops-cycles-method-data/localizedData.json');

describe('export helpers', () => {
  test('buildFileName applies prefix', () => {
    expect(buildFileName('My', 'test', 'en', 'svg')).toBe('My_test_en.svg');
    expect(buildFileName(undefined, 'test', 'en', 'svg')).toBe('Canvas_test_en.svg');
  });

  test('placeholder notes generated', () => {
    const content = buildContent(canvasData, 'apiBusinessModelCanvas', 'en', true);
    for (const section of content.sections) {
      expect(section.stickyNotes.length).toBe(1);
      expect(section.stickyNotes[0].content).toBe('Placeholder');
    }
  });

  test('exportJSON omits placeholder coordinates', () => {
    const content = buildContent(canvasData, 'apiBusinessModelCanvas', 'en', true);
    const json = JSON.parse(exportJSON(content));
    for (const section of json.sections) {
      expect(section.stickyNotes[0].position).toBeUndefined();
    }
  });

  test('renderSVG uses highlight color and descriptions without placeholders', () => {
    const content = buildContent(canvasData, 'apiBusinessModelCanvas', 'en', false);
    const svg = renderSVG(canvasData['apiBusinessModelCanvas'], localizedData, content);
    expect(svg).toContain('#d7e3fe');
    const descWord = localizedData['en']['apiBusinessModelCanvas'].sections.keyPartners.description.split(' ')[0];
    expect(svg).toContain(descWord);
    expect(svg).toContain(`fill="#1a3987"`);
    expect(svg.includes('Placeholder')).toBe(false);
  });

  test('renderSVG title has larger font size', () => {
    const content = buildContent(canvasData, 'apiBusinessModelCanvas', 'en', false);
    const svg = renderSVG(canvasData['apiBusinessModelCanvas'], localizedData, content);
    expect(svg).toContain(`font-size="${require('../src/defaultStyles').fontSize + 4}`);
  });

  test('imported content gets default positions for rendered exports', () => {
    const imported = {
      templateId: 'apiBusinessModelCanvas',
      locale: 'de',
      metadata: {
        source: 'APIOps Cycles method',
        license: 'CC-BY-SA 4.0',
        authors: ['Marjukka Niinioja'],
        website: 'www.apiopscycles.com',
        date: '2026-03-15T08:00:00.000Z',
      },
      sections: [
        {
          sectionId: 'keyPartners',
          stickyNotes: [
            { content: 'Ohne Position', size: 80, color: '#FFF399' },
          ],
        },
      ],
    };

    const content = buildContent(
      canvasData,
      'apiBusinessModelCanvas',
      'de',
      false,
      imported,
      true,
    );

    expect(content.sections[0].stickyNotes[0].position).toEqual({
      x: expect.any(Number),
      y: expect.any(Number),
    });
    expect(imported.sections[0].stickyNotes[0].position).toBeUndefined();
  });

  test('writePNG export exists', () => {
    expect(typeof writePNG).toBe('function');
  });
});
