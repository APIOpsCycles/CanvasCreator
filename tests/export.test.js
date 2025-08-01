const { buildContent, buildFileName, renderSVG, writePNG } = require('../scripts/export.js');
const { exportJSON } = require('../scripts/noteManager.js');
const canvasData = require('../data/canvasData.json');
const localizedData = require('../data/localizedData.json');

describe('export helpers', () => {
  test('buildFileName applies prefix', () => {
    expect(buildFileName('My', 'test', 'en-US', 'svg')).toBe('My_test_en-US.svg');
    expect(buildFileName(undefined, 'test', 'en-US', 'svg')).toBe('Canvas_test_en-US.svg');
  });

  test('placeholder notes generated', () => {
    const content = buildContent(canvasData, 'apiBusinessModelCanvas', 'en-US', true);
    for (const section of content.sections) {
      expect(section.stickyNotes.length).toBe(1);
      expect(section.stickyNotes[0].content).toBe('Placeholder');
    }
  });

  test('exportJSON omits placeholder coordinates', () => {
    const content = buildContent(canvasData, 'apiBusinessModelCanvas', 'en-US', true);
    const json = JSON.parse(exportJSON(content));
    for (const section of json.sections) {
      expect(section.stickyNotes[0].position).toBeUndefined();
    }
  });

  test('renderSVG uses highlight color and descriptions without placeholders', () => {
    const content = buildContent(canvasData, 'apiBusinessModelCanvas', 'en-US', false);
    const svg = renderSVG(canvasData['apiBusinessModelCanvas'], localizedData, content);
    expect(svg).toContain('#d7e3fe');
    const descWord = localizedData['en-US']['apiBusinessModelCanvas'].sections.keyPartners.description.split(' ')[0];
    expect(svg).toContain(descWord);
    expect(svg).toContain(`fill="#1a3987"`);
    expect(svg.includes('Placeholder')).toBe(false);
  });

  test('renderSVG title has larger font size', () => {
    const content = buildContent(canvasData, 'apiBusinessModelCanvas', 'en-US', false);
    const svg = renderSVG(canvasData['apiBusinessModelCanvas'], localizedData, content);
    expect(svg).toContain(`font-size="${require('../src/defaultStyles').fontSize + 4}`);
  });

  test('writePNG export exists', () => {
    expect(typeof writePNG).toBe('function');
  });
});
