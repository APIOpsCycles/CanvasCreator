const { buildContent, buildFileName } = require('../scripts/export.js');
const { exportJSON } = require('../scripts/noteManager.js');
const canvasData = require('../data/canvasData.json');

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
});
