const fs = require('fs');
const path = require('path');
const canvasData = require('apiops-cycles-method-data/canvasData.json');

describe('shipped example JSON', () => {
  test('api business model example is importable and template-complete', () => {
    const filePath = path.join(
      __dirname,
      '..',
      'examples',
      'Canvas_apiBusinessModelCanvas_en.json',
    );
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const expectedSections = canvasData[content.templateId].sections.map(
      (section) => section.id,
    );

    expect(content.templateId).toBe('apiBusinessModelCanvas');
    expect(content.locale).toBe('en');
    expect(content.metadata.source).toBe('APIOps Cycles method');
    expect(content.metadata.license).toBe('CC-BY-SA 4.0');
    expect(content.metadata.website).toBe('www.apiopscycles.com');
    expect(Array.isArray(content.metadata.authors)).toBe(true);
    expect(content.metadata.authors.length).toBeGreaterThan(0);
    expect(content.sections.map((section) => section.sectionId)).toEqual(
      expectedSections,
    );

    for (const section of content.sections) {
      expect(Array.isArray(section.stickyNotes)).toBe(true);
      for (const note of section.stickyNotes) {
        expect(note.content).toBe(note.content.trim());
        expect(note.content.length).toBeGreaterThan(0);
        expect(note.size).toBe(80);
        expect(note.color).toMatch(/^#([0-9A-Fa-f]{6})$/);
        expect(note.position).toBeUndefined();
      }
    }
  });
});
