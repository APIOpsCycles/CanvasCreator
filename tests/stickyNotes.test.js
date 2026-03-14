const { createStickyNote, editStickyNote, exportJSON, importJSON } = require('../scripts/noteManager.js');
const {
  getTheme,
  getThemeNames,
  getSafeColorForTheme,
  buildPaletteSwatches,
} = require('../src/stickyThemes');

describe('sticky note operations', () => {
  let contentData;

  beforeEach(() => {
    contentData = {
      templateId: 'apiBusinessModelCanvas',
      locale: 'en',
      metadata: { source: 'test', license: 'MIT', authors: ['a'], website: 'example.com' },
      stickyNoteSize: 80,
      sections: [
        { sectionId: 'sec1', stickyNotes: [] },
      ],
    };
  });

  test('create sticky note', () => {
    const note = createStickyNote(contentData, 'sec1', 'hello', { x: 10, y: 20 });
    expect(contentData.sections[0].stickyNotes.length).toBe(1);
    expect(note.content).toBe('hello');
  });

  test('edit sticky note', () => {
    const note = createStickyNote(contentData, 'sec1', 'hello');
    editStickyNote(note, 'changed');
    expect(note.content).toBe('changed');
  });

  test('export and import flow', () => {
    createStickyNote(contentData, 'sec1', 'exported', { x: 1, y: 1 });
    const json = exportJSON(contentData);
    const imported = importJSON(json);
    expect(imported.sections[0].stickyNotes[0].content).toBe('exported');
    expect(imported.locale).toBe('en');
  });
});

describe('sticky theme palette behavior', () => {
  test('lists named presets and exposes swatches', () => {
    const themeNames = getThemeNames();
    expect(themeNames.length).toBeGreaterThan(1);

    const theme = getTheme(themeNames[0]);
    expect(Array.isArray(theme.swatches)).toBe(true);
    expect(theme.swatches.length).toBeGreaterThan(0);
  });

  test('falls back to first swatch when selected color does not exist in theme', () => {
    const safeColor = getSafeColorForTheme('classic', '#000000');
    expect(safeColor).toBe(getTheme('classic').swatches[0]);
  });

  test('marks only one swatch selected for active palette rendering', () => {
    const palette = buildPaletteSwatches('sunset', '#FFADAD');
    const selectedEntries = palette.filter((item) => item.isSelected);

    expect(selectedEntries).toHaveLength(1);
    expect(selectedEntries[0].color).toBe('#FFADAD');
  });

  test('switching theme normalizes selected color to valid palette color', () => {
    const selectedColor = getSafeColorForTheme('ocean', '#FFADAD');
    const palette = buildPaletteSwatches('ocean', selectedColor);

    expect(getTheme('ocean').swatches).toContain(selectedColor);
    expect(palette.some((swatch) => swatch.isSelected)).toBe(true);
  });
});
