# Release Notes

The repository history shows twelve merged pull requests, which introduce localization features, bug fixes, and new tests. Key updates include:

## Version 1.7.0 - 1.7.2
- 1.7.0 UI is now embeddable and configurable for Astro, Vue, React etc. use
- 1.7.0 fixed export bug where sticky notes were partially hidden if on top of section line
- 1.7.1 Fixed the responsive Help toggle so hiding the Help section no longer causes layout trembling on narrower screens.
- 1.7.1 Aligned the mobile toolbar by hiding the Help button at the same breakpoint where the Help panel is unavailable.
- 1.7.2 Regression from 1.7.0 Fixed journeystep visibility in SVG and PNG exports

## Version 1.6.0-1.6.2
Canvas package for PNG generation is now a normal dependency, because it's not working as optional, and downstream modules depend on PNG generation.
Export is now exposed for downstream modules, export related scripts are refactored and UI and CLI exports share essential functionality.
CanvasCreator uses now APIOps Cycles method data 3.2.0 with improved canvas content and descriptions especially to Interaction Canvas and Location Canvas

## Version 1.5.0 (PRs 66-71)

Introduced skills for better human and agent consumption. 
Import skill can now verify with a script and with svg that the texts fit in the sticky notes. The new script checkNoteFit.js can be called with an npm command. 

Fixes export related issue #70 which threw error if imported canvas json did not include x and y coordinates.

The export.js now supports not having x and y coordinates in the imported canvas json files. Skills have openai.yml for better packaging and installation.

Improved examples.

Added support for sticky note themes for UI.

## Version 1.4.0 (PRs 58-65)
Security fixes and bug fix to CLI export

### Vulnerability and bug fixes for CLI (PR 65)
- rollup/terser related packages had vulnerabilities, updated to 1.0.0
- exports had stopped working during some changes, fixed issue in export.js causing error: TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. 
- updated package version number because of potential breaking changes with the rollup version.

### Refactor header/navigation for responsiveness (PR 64)
- Reworked header and top navigation for a more app-like flow across desktop and mobile.
- Improved toolbar/icon semantics and rendering consistency.
- Fixed import trigger behavior and polished navigation link behavior.
- Added responsive prioritization for nav actions and touch-friendly controls.

### Add CSS variables for brand primitives (PR 63)
- Introduced CSS variable tokens for CanvasCreator brand styling to centralize theme primitives.
- Synced default styling values to the new token system.
- Fixed local preview asset/module fallback behavior.

### Secure locale and canvas linking (PR 62)
- Improved URL locale handling to be case-insensitive.
- Added/updated test coverage for URL parameter handling to prevent regressions.

### Update scripts to source data from npm package (PR 61)
- Updated UI/data loading flow so canvasData and localizedData can be sourced from package-provided modules.
- Simplified paths/variables and improved support for package-consumer usage.
- Added support for configurable export output directory (outdir) when used as a dependency.
- Fixed related import issues in package-based data loading.

### Continue package-based data/externalization updates (PR #60)
- Refactored canvas data loading to use an external package source.
- Updated dependencies/exports and distribution script behavior for this model.
- Aligned Node engine declarations in package.json.
- Updated supporting method-data package integration.

### Style CanvasCreator demo page (PR 59)
- Added dedicated CSS styling for the demo/index experience.
- Modernized sticky-note and page visual treatment for cleaner embedding scenarios.
- Included minor cleanup/minification follow-up.

### Locale code standardization (PR 58)
Switched locale handling to short locale codes (e.g., en) for consistency.

### PNG export and typography improvement (PR 57)
- Added PNG export support.
- Improved title font sizing for readability.
- Updated docs around PNG export/canvas dependency expectations.
- Bumped optional canvas dependency to improve compatibility.


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

- **PR #15 – PNG export and larger title font**
  Added PNG export to the command-line and UI. Image titles now use a slightly larger font size for readability.
  Optional canvas dependency bumped to v3 for compatibility with Jest.
