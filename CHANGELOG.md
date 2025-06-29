# Release Notes

The repository history shows twelve merged pull requests, which introduce localization features, bug fixes, and new tests. Key updates include:

### Locale Handling
- **PR #14 – Fix locale switching on JSON import**  
  JSON imports now update the locale selector and refresh the list of canvases before rendering. This is handled by calling `populateCanvasSelector(locale)` after the file is loaded.  
  The HTML page was also updated to load `dist/canvasCreator.min.js`

### Import Enhancements
- **PR #13 – Handle missing coordinates on import**  
  Added `distributeMissingPositions` to automatically place sticky notes when their coordinates are absent. A Jest test verifies the helper function’s behavior.  
  - Function implementation  
  - Test file

### Localization
- **PR #12/#11 – French localization**  
  French strings were introduced in `localizedData.json`. The README now lists English, German, Finnish and French as supported languages, and references `data/localizedData.json`

- **PR #10 – Update localization path**  
  The README’s localization section was corrected to reference `data/localizedData.json`

- **PR #8 – Customer Journey canvas description**  
  Purpose text for the Customer Journey Canvas was revised in every locale

- **PR #7 – Finnish localization**  
  Added Finnish text entries in `localizedData.json`

- **PR #1 – German localization**  
  Initial de-DE localization introduced, adding over 600 lines of content across JavaScript and localization files

### Testing and Examples
- **PR #9 – Jest setup with sanitizeInput test**  
  Introduced a sanitizeInput helper with accompanying unit tests

- **PR #6 – Example canvases**  
  Added example JSON, PNG, and SVG files demonstrating the canvas usage in different languages

### Export/Import Fixes
- **PR #5 – Resolve JSON import bug**
  Corrected JSON import handling; minified script bumped to v1_8 with significant changes (98 insertions, 116 deletions)

- **PR #3 – Fix exports for JSON and SVG**
  Export functionality now preserves the selected language and canvas settings, with 45 insertions and 62 deletions across the codebase

### Build System
- Introduced `scripts/build.js` which bundles the modular sources into
  `dist/canvasCreator.js` and `dist/canvasCreator.min.js`.
- `index.html` now loads the minified bundle with a version query so browsers
  don't cache outdated code.

These changes collectively improve localization support, example usage, and overall stability when importing or exporting canvases.
