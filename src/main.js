const {
  sanitizeInput,
  validateInput,
  distributeMissingPositions,
  getJourneyStepsLayout,
} = require('./helpers');
const defaultStyles = require('./defaultStyles');
const {
  getTheme,
  getThemeNames,
  getSafeColorForTheme,
  buildPaletteSwatches,
} = require('./stickyThemes');
const canvasData = require('apiops-cycles-method-data/canvasData.json');
const localizedData = require('apiops-cycles-method-data/localizedData.json');

const BASE_WIDTH = defaultStyles.width + defaultStyles.padding * 2;
const BASE_HEIGHT = defaultStyles.height;
const SVG_NS = 'http://www.w3.org/2000/svg';

let latestInstance = null;

function getSessionStorage() {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  return window.sessionStorage;
}

function writeSessionValue(key, value) {
  const storage = getSessionStorage();
  if (storage) {
    storage.setItem(key, value);
  }
}

function readSessionValue(key) {
  const storage = getSessionStorage();
  return storage ? storage.getItem(key) : null;
}

function syncThemeStateFromSession(state) {
  const themeName = readSessionValue('selectedTheme');
  const selectedColor = readSessionValue('selectedColor');

  if (themeName && getThemeNames().includes(themeName)) {
    state.selectedTheme = themeName;
  }

  if (selectedColor) {
    state.currentColor = getSafeColorForTheme(
      state.selectedTheme,
      selectedColor,
    );
  } else {
    state.currentColor = getSafeColorForTheme(
      state.selectedTheme,
      state.currentColor,
    );
  }
}

function getLocaleKey(locale) {
  if (!locale) return defaultStyles.defaultLocale;
  const lower = String(locale).toLowerCase();
  if (localizedData[lower]) return lower;
  const base = lower.split('-')[0];
  return localizedData[base] ? base : lower;
}

function normalizeMode(options = {}) {
  if (options.mode === 'embed' || options.embed) return 'embed';
  return 'standalone';
}

function normalizeToolbar(mode, toolbar = {}) {
  const defaults =
    mode === 'embed'
      ? {
          import: true,
          metadata: true,
          export: true,
          themePicker: false,
          help: false,
          headerLinks: false,
        }
      : {
          import: true,
          metadata: true,
          export: true,
          themePicker: true,
          help: true,
          headerLinks: true,
        };

  return { ...defaults, ...toolbar };
}

function normalizeAssetBase(assetBase = '') {
  let normalized = String(assetBase);
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

function resolveAssetUrl(assetBase, relativePath) {
  return assetBase ? `${assetBase}/${relativePath}` : relativePath;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapText(text, maxWidth = defaultStyles.maxLineWidth) {
  const normalized = String(text || '').replace(/\n{2,}/g, '\n');
  const words = normalized.split(' ');
  const lines = [];
  let line = '';

  for (const word of words) {
    const testLine = `${line}${word} `;
    if (testLine.length * 6 > maxWidth && line.trim()) {
      lines.push(line.trim());
      line = `${word} `;
    } else {
      line = testLine;
    }
  }

  if (line.trim()) {
    lines.push(line.trim());
  }

  return lines.join('\n');
}

function getCanvasGeometry(canvasDef, locale, content) {
  const localizedCanvas =
    (localizedData[locale] && localizedData[locale][content.templateId]) || {};
  const cellWidth = Math.floor(
    (defaultStyles.width - canvasDef.layout.columns * defaultStyles.padding) /
      canvasDef.layout.columns,
  );

  const headerWidth =
    defaultStyles.width -
    (defaultStyles.headerHeight + 2 * defaultStyles.padding) -
    2 * defaultStyles.padding;

  const titleLines = wrapText(
    localizedCanvas.title || canvasDef.id,
    headerWidth,
  ).split('\n').length;
  let headerBottomY =
    2 * defaultStyles.padding +
    defaultStyles.fontSize +
    (titleLines - 1) * (defaultStyles.fontSize + 6);

  if (localizedCanvas.purpose) {
    const purposeLines = wrapText(localizedCanvas.purpose, headerWidth).split(
      '\n',
    ).length;
    headerBottomY +=
      defaultStyles.padding +
      2 +
      (purposeLines - 1) * (defaultStyles.fontSize + 3);
  }

  if (localizedCanvas.howToUse) {
    const howToUseLines = wrapText(
      localizedCanvas.howToUse,
      headerWidth,
    ).split('\n').length;
    headerBottomY +=
      defaultStyles.padding +
      4 +
      (howToUseLines - 1) * (defaultStyles.fontSize + 2);
  }

  const gridTop = Math.max(
    defaultStyles.headerHeight,
    headerBottomY + 2 * defaultStyles.padding,
  );

  const cellHeight = Math.floor(
    (defaultStyles.height -
      gridTop -
      defaultStyles.footerHeight -
      3 * defaultStyles.padding) /
      canvasDef.layout.rows,
  );

  return {
    localizedCanvas,
    cellWidth,
    cellHeight,
    gridTop,
    sections: canvasDef.sections.map((section) => ({
      id: section.id,
      x:
        section.gridPosition.column * cellWidth + 2 * defaultStyles.padding,
      y: section.gridPosition.row * cellHeight + gridTop,
      width: section.gridPosition.colSpan * cellWidth,
      height: section.gridPosition.rowSpan * cellHeight,
    })),
  };
}

function appendWrappedSvgText(parts, config) {
  const {
    x,
    y,
    text,
    maxWidth,
    fontFamily = defaultStyles.fontFamily,
    fontSize = defaultStyles.fontSize,
    fontWeight = '',
    fill = defaultStyles.fontColor,
    lineHeight = fontSize + 2,
    anchor = 'start',
  } = config;
  const lines = wrapText(text, maxWidth)
    .split('\n')
    .filter((line) => line.length > 0);
  const safeLines = lines.length > 0 ? lines : [''];
  const weightAttr = fontWeight ? ` font-weight="${fontWeight}"` : '';
  const tspanMarkup = safeLines
    .map((line, index) => {
      const dy = index === 0 ? '0' : String(lineHeight);
      return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('');

  parts.push(
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${escapeXml(
      fontFamily,
    )}" font-size="${fontSize}" fill="${escapeXml(fill)}"${weightAttr}>${tspanMarkup}</text>`,
  );

  return {
    lineCount: safeLines.length,
    bottomY: y + (safeLines.length - 1) * lineHeight,
  };
}

function appendJourneyStepsSvg(parts, sectionDef, sectionBox) {
  const layout = getJourneyStepsLayout(sectionDef, sectionBox, defaultStyles);
  if (!layout) {
    return;
  }

  parts.push(
    '<g class="cc-journey-steps">',
    ...layout.boxes.map(
      (box) =>
        `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" fill="#fff" stroke="${escapeXml(
          defaultStyles.borderColor,
        )}" stroke-width="${defaultStyles.lineSize}" stroke-dasharray="${
          3 * defaultStyles.lineSize
        }" rx="${defaultStyles.cornerRadius / 2}" ry="${
          defaultStyles.cornerRadius / 2
        }" />`,
    ),
    ...layout.arrows.map(
      (arrow) =>
        `<line x1="${arrow.x1}" y1="${arrow.y1}" x2="${arrow.x2}" y2="${arrow.y2}" stroke="${escapeXml(
          defaultStyles.borderColor,
        )}" stroke-width="${2 * defaultStyles.lineSize}" marker-end="url(#journey-arrowhead)" />`,
    ),
    '</g>',
  );
}

function buildCanvasSvgMarkup({
  assetBase,
  content,
  includeNotes = false,
  inlineLogo = null,
}) {
  const canvasDef = canvasData[content.templateId];
  const locale = getLocaleKey(content.locale || defaultStyles.defaultLocale);

  if (!canvasDef) {
    return '';
  }

  const geometry = getCanvasGeometry(canvasDef, locale, content);
  const { localizedCanvas } = geometry;
  const noteParts = [];
  const hasJourneySteps = canvasDef.sections.some((section) => section.journeySteps);
  const hasStickyNotes = content.sections.some(
    (section) => section.stickyNotes && section.stickyNotes.length > 0,
  );
  const parts = [
    `<svg xmlns="${SVG_NS}" width="${BASE_WIDTH}" height="${BASE_HEIGHT}" viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}" font-family="${escapeXml(
      defaultStyles.fontFamily,
    )}" font-size="${defaultStyles.fontSize}" style="background-color:${escapeXml(
      defaultStyles.backgroundColor,
    )}">`,
  ];

  if (hasJourneySteps) {
    parts.push(
      '<defs><marker id="journey-arrowhead" markerWidth="4" markerHeight="7" refX="5" refY="3.5" orient="auto"><polygon points="0 0, 5 3.5, 0 7" fill="#1a3987" /></marker></defs>',
    );
  }

  if (inlineLogo && inlineLogo.markup) {
    parts.push(
      `<svg x="${defaultStyles.padding}" y="${
        defaultStyles.padding / 2
      }" width="${defaultStyles.headerHeight}" height="${
        defaultStyles.headerHeight
      }" viewBox="${escapeXml(inlineLogo.viewBox)}">${inlineLogo.markup}</svg>`,
    );
  } else {
    const logoUrl = resolveAssetUrl(
      assetBase,
      'img/apiops-cycles-logo2025-blue.svg',
    );
    parts.push(
      `<image href="${escapeXml(logoUrl)}" x="${defaultStyles.padding}" y="${
        defaultStyles.padding / 2
      }" width="${defaultStyles.headerHeight}" height="${
        defaultStyles.headerHeight
      }" />`,
    );
  }

  const headerTextX = defaultStyles.headerHeight + 2 * defaultStyles.padding;
  const headerTextWidth = defaultStyles.width - headerTextX;
  let headerBottomY = 0;

  const titleLayout = appendWrappedSvgText(parts, {
    x: headerTextX,
    y: 2 * defaultStyles.padding + defaultStyles.fontSize,
    text: localizedCanvas.title || canvasDef.id,
    maxWidth: headerTextWidth,
    fontSize: defaultStyles.fontSize + 4,
    fontWeight: 'bold',
    lineHeight: defaultStyles.fontSize + 6,
  });
  headerBottomY = titleLayout.bottomY;

  if (localizedCanvas.purpose) {
    const purposeLayout = appendWrappedSvgText(parts, {
      x: headerTextX,
      y: headerBottomY + defaultStyles.padding + 2,
      text: localizedCanvas.purpose,
      maxWidth: headerTextWidth,
      fontSize: defaultStyles.fontSize + 2,
      lineHeight: defaultStyles.fontSize + 3,
    });
    headerBottomY = purposeLayout.bottomY;
  }

  if (localizedCanvas.howToUse) {
    const howToUseLayout = appendWrappedSvgText(parts, {
      x: headerTextX,
      y: headerBottomY + defaultStyles.padding + 4,
      text: localizedCanvas.howToUse,
      maxWidth: headerTextWidth,
      fontSize: defaultStyles.fontSize + 2,
      lineHeight: defaultStyles.fontSize + 2,
    });
    headerBottomY = howToUseLayout.bottomY;
  }

  canvasDef.sections.forEach((sectionDef) => {
    const sectionBox = geometry.sections.find(
      (section) => section.id === sectionDef.id,
    );
    if (!sectionBox) return;

    const sectionLocale =
      localizedCanvas.sections && localizedCanvas.sections[sectionDef.id]
        ? localizedCanvas.sections[sectionDef.id]
        : {};
    const sectionTitle = sectionLocale.section || sectionDef.id;

    parts.push(
      `<rect x="${sectionBox.x}" y="${sectionBox.y}" width="${sectionBox.width}" height="${sectionBox.height}" fill="${escapeXml(
        sectionDef.highlight
          ? defaultStyles.highlightColor
          : defaultStyles.sectionColor,
      )}" stroke="${escapeXml(defaultStyles.borderColor)}" rx="${
        defaultStyles.cornerRadius
      }" ry="${defaultStyles.cornerRadius}" />`,
    );

    if (sectionDef.journeySteps) {
      appendJourneyStepsSvg(parts, sectionDef, sectionBox);
    }

    parts.push(
      `<circle cx="${sectionBox.x + defaultStyles.padding}" cy="${
        sectionBox.y + defaultStyles.padding
      }" r="${defaultStyles.circleRadius}" fill="${escapeXml(
        defaultStyles.borderColor,
      )}" />`,
    );
    parts.push(
      `<text x="${sectionBox.x + defaultStyles.padding}" y="${
        sectionBox.y + defaultStyles.padding + 5
      }" text-anchor="middle" font-family="${escapeXml(
        defaultStyles.fontFamily,
      )}" font-size="${defaultStyles.fontSize}" fill="${escapeXml(
        defaultStyles.highlightColor,
      )}">${escapeXml(sectionDef.fillOrder)}</text>`,
    );

    const titleLayoutInSection = appendWrappedSvgText(parts, {
      x: sectionBox.x + defaultStyles.padding + defaultStyles.circleRadius,
      y: sectionBox.y + defaultStyles.padding + defaultStyles.circleRadius,
      text: sectionTitle,
      maxWidth:
        sectionBox.width -
        2 * defaultStyles.padding -
        defaultStyles.circleRadius,
      fontWeight: 'bold',
    });

    const sectionContent = content.sections.find(
      (section) => section.sectionId === sectionDef.id,
    );

    if (includeNotes && sectionContent && sectionContent.stickyNotes.length > 0) {
      sectionContent.stickyNotes.forEach((note) => {
        const noteX = note.position ? note.position.x || 0 : 0;
        const noteY = note.position ? note.position.y || 0 : 0;
        const noteSize = note.size || defaultStyles.stickyNoteSize;
        noteParts.push(
          `<rect x="${noteX}" y="${noteY}" width="${noteSize}" height="${noteSize}" fill="${escapeXml(
            note.color || defaultStyles.stickyNoteColor,
          )}" stroke="${escapeXml(
            note.color || defaultStyles.stickyNoteBorderColor,
          )}" rx="${defaultStyles.stickyNoteCornerRadius}" ry="${
            defaultStyles.stickyNoteCornerRadius
          }" />`,
        );

        const noteLines = wrapText(
          note.content,
          noteSize - defaultStyles.padding,
        ).split('\n');
        const tspans = noteLines
          .map((line, index) => {
            const dy = index === 0 ? '0' : String(defaultStyles.fontSize + 2);
            return `<tspan x="${
              noteX + defaultStyles.padding / 2
            }" dy="${dy}">${escapeXml(line)}</tspan>`;
          })
          .join('');

        noteParts.push(
          `<text x="${noteX + defaultStyles.padding / 2}" y="${
            noteY + defaultStyles.fontSize + defaultStyles.padding / 2
          }" fill="${escapeXml(
            defaultStyles.contentFontColor,
          )}" font-family="${escapeXml(
            defaultStyles.fontFamily,
          )}" font-size="${defaultStyles.fontSize}">${tspans}</text>`,
        );
      });
    } else if (!hasStickyNotes && sectionLocale.description) {
      appendWrappedSvgText(parts, {
        x: sectionBox.x + defaultStyles.padding,
        y: titleLayoutInSection.bottomY + defaultStyles.padding + 2,
        text: sectionLocale.description,
        maxWidth: sectionBox.width - 2 * defaultStyles.padding,
      });
    }
  });

  if (noteParts.length > 0) {
    parts.push(noteParts.join(''));
  }

  const contentMetadataLine = formatMetadataLine(content.metadata);
  const templateMetadataLine = `Template by: ${canvasDef.metadata.source} | ${canvasDef.metadata.license} | ${canvasDef.metadata.authors.join(
    ', ',
  )} | ${canvasDef.metadata.website}`;

  const footerLines = [];
  if (contentMetadataLine) {
    footerLines.push(contentMetadataLine);
  }
  footerLines.push(templateMetadataLine);

  parts.push(
    footerLines
      .map((line, index) => {
        const y =
          defaultStyles.height -
          defaultStyles.footerHeight +
          index * (defaultStyles.fontSize + 4);
        return `<text x="${defaultStyles.width / 2}" y="${y}" text-anchor="middle" font-family="${escapeXml(
          defaultStyles.fontFamily,
        )}" font-size="${defaultStyles.fontSize}" fill="${escapeXml(
          defaultStyles.fontColor,
        )}">${escapeXml(line)}</text>`;
      })
      .join(''),
  );

  parts.push('</svg>');
  return parts.join('');
}

function cloneContent(content) {
  return JSON.parse(JSON.stringify(content));
}

function buildEmptyContent(locale, canvasId) {
  return {
    templateId: canvasId,
    locale,
    metadata: {
      source: '',
      license: '',
      authors: [],
      website: '',
    },
    sections: (canvasData[canvasId]?.sections || []).map((section) => ({
      sectionId: section.id,
      stickyNotes: [],
    })),
  };
}

function downloadBlob(documentRef, blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = fileName;
  documentRef.body.appendChild(link);
  link.click();
  documentRef.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getExportBaseName(content) {
  const source = (content.metadata && content.metadata.source) || 'Canvas';
  return `${source}_${content.templateId}_${content.locale}`.replace(/\s+/g, '_');
}

function formatMetadataLine(metadata = {}) {
  const parts = [];
  if (metadata.source) parts.push(metadata.source);
  if (metadata.license) parts.push(metadata.license);
  if (Array.isArray(metadata.authors) && metadata.authors.length > 0) {
    parts.push(metadata.authors.join(', '));
  } else if (metadata.authors) {
    parts.push(String(metadata.authors));
  }
  if (metadata.website) parts.push(metadata.website);
  return parts.join(' | ');
}

function extractInlineSvgData(svgText) {
  if (!svgText) return { markup: '', viewBox: '0 0 567 567.000005' };
  const source = String(svgText);
  const viewBoxMatch = source.match(/viewBox="([^"]+)"/i);
  return {
    viewBox: viewBoxMatch ? viewBoxMatch[1] : '0 0 567 567.000005',
    markup: source
    .replace(/<\?xml[\s\S]*?\?>/i, '')
    .replace(/<!DOCTYPE[\s\S]*?>/i, '')
    .replace(/<sodipodi:namedview[\s\S]*?<\/sodipodi:namedview>/i, '')
    .replace(/<sodipodi:namedview[\s\S]*?\/>/i, '')
    .replace(/^[\s\S]*?<svg[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .trim(),
  };
}

class CanvasCreatorInstance {
  constructor(options = {}) {
    const { container } = options;
    if (!container || !container.ownerDocument) {
      throw new Error('initCanvasCreator requires a container HTMLElement.');
    }

    if (container.__canvasCreatorInstance) {
      container.__canvasCreatorInstance.destroy();
    }

    this.container = container;
    this.document = container.ownerDocument;
    this.window = this.document.defaultView || window;
    this.assetBase = normalizeAssetBase(options.assetBase);
    this.mode = normalizeMode(options);
    this.toolbar = normalizeToolbar(this.mode, options.toolbar);
    this.fitToContainer = options.fitToContainer !== false;
    this.maxWidth = options.maxWidth;
    this.maxHeight = options.maxHeight;
    this.compact = Boolean(options.compact || this.mode === 'embed');
    this.currentScale = 1;
    this.contentData = null;
    this.currentLocale = null;
    this.currentCanvas = null;
    this.selectedNoteRef = null;
    this.dragState = null;
    this.currentColor = getTheme(getThemeNames()[0]).swatches[0];
    this.selectedTheme = getThemeNames()[0];
    this.inlineLogo = null;
    this.isEditingNote = false;
    syncThemeStateFromSession(this);

    this.handleWindowResize = this.resize.bind(this);
    this.handlePointerMove = this.onPointerMove.bind(this);
    this.handlePointerUp = this.onPointerUp.bind(this);
    this.handleBeforeUnload = this.checkForUnsavedChanges.bind(this);

    this.buildShell();
    this.attachStaticEvents();
    this.initializeSelections(options);
    this.installAutoResize();
    this.preloadInlineLogo();

    container.__canvasCreatorInstance = this;
  }

  preloadInlineLogo() {
    const logoUrl = resolveAssetUrl(
      this.assetBase,
      'img/apiops-cycles-logo2025-blue.svg',
    );

    if (!this.window.fetch) return;

    this.window
      .fetch(logoUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load logo SVG');
        }
        return response.text();
      })
      .then((svgText) => {
        this.inlineLogo = extractInlineSvgData(svgText);
        if (this.contentData) {
          this.render();
        }
      })
      .catch(() => {
        this.inlineLogo = null;
      });
  }

  buildShell() {
    this.container.innerHTML = '';

    const root = this.document.createElement('div');
    root.className = 'cc-root';
    root.dataset.mode = this.mode;
    if (this.compact) {
      root.classList.add('cc-root--compact');
    }

    root.innerHTML = `
      <div class="cc-shell">
        <header class="cc-header">
          <a class="cc-brand" href="https://www.apiopscycles.com/resources/customer-journey-canvas/" target="_blank" rel="noopener noreferrer">
            <img class="cc-brand__logo" alt="CanvasCreator logo" width="64" height="64" />
            <span class="cc-brand__title">CanvasCreator</span>
          </a>
          <div class="cc-header__links"></div>
        </header>
        <section class="cc-toolbar">
          <div class="cc-toolbar__primary"></div>
          <div class="cc-toolbar__selectors">
            <label class="cc-field">
              <span>Language</span>
              <select data-cc-role="locale"></select>
            </label>
            <label class="cc-field">
              <span>Canvas</span>
              <select data-cc-role="canvas"></select>
            </label>
          </div>
          <div class="cc-toolbar__secondary"></div>
        </section>
        <section class="cc-workspace">
          <div class="cc-help" hidden></div>
          <div class="cc-stage-shell">
            <div class="cc-stage-host">
              <div class="cc-stage-frame">
                <div class="cc-stage-svg"></div>
                <div class="cc-notes-layer"></div>
              </div>
            </div>
            <div class="cc-theme-panel" hidden>
              <label class="cc-field cc-field--inline">
                <span>Theme</span>
                <select data-cc-role="theme"></select>
              </label>
              <div class="cc-swatches" data-cc-role="swatches"></div>
            </div>
          </div>
        </section>
        <dialog class="cc-metadata-dialog">
          <form method="dialog" class="cc-metadata-form">
            <h2>Content Metadata</h2>
            <label class="cc-field">
              <span>Source</span>
              <input type="text" data-cc-role="source" />
            </label>
            <label class="cc-field">
              <span>License</span>
              <input type="text" data-cc-role="license" />
            </label>
            <label class="cc-field">
              <span>Authors</span>
              <input type="text" data-cc-role="authors" />
            </label>
            <label class="cc-field">
              <span>Website</span>
              <input type="text" data-cc-role="website" />
            </label>
            <div class="cc-dialog-actions">
              <button type="button" data-cc-role="saveMetadata">Save</button>
              <button type="button" data-cc-role="closeMetadata">Close</button>
            </div>
          </form>
        </dialog>
      </div>
    `;

    this.root = root;
    this.container.appendChild(root);

    this.headerLinks = root.querySelector('.cc-header__links');
    this.primaryToolbar = root.querySelector('.cc-toolbar__primary');
    this.secondaryToolbar = root.querySelector('.cc-toolbar__secondary');
    this.localeSelect = root.querySelector('[data-cc-role="locale"]');
    this.canvasSelect = root.querySelector('[data-cc-role="canvas"]');
    this.themeSelect = root.querySelector('[data-cc-role="theme"]');
    this.swatches = root.querySelector('[data-cc-role="swatches"]');
    this.helpPanel = root.querySelector('.cc-help');
    this.stageHost = root.querySelector('.cc-stage-host');
    this.stageFrame = root.querySelector('.cc-stage-frame');
    this.svgHost = root.querySelector('.cc-stage-svg');
    this.notesLayer = root.querySelector('.cc-notes-layer');
    this.themePanel = root.querySelector('.cc-theme-panel');
    this.metadataDialog = root.querySelector('.cc-metadata-dialog');
    this.metadataSource = root.querySelector('[data-cc-role="source"]');
    this.metadataLicense = root.querySelector('[data-cc-role="license"]');
    this.metadataAuthors = root.querySelector('[data-cc-role="authors"]');
    this.metadataWebsite = root.querySelector('[data-cc-role="website"]');
    this.fileInput = this.document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'application/json';
    this.fileInput.hidden = true;
    this.root.appendChild(this.fileInput);

    this.stageFrame.style.width = `${BASE_WIDTH}px`;
    this.stageFrame.style.height = `${BASE_HEIGHT}px`;
    this.stageFrame.style.transformOrigin = 'top left';

    const brandLogo = root.querySelector('.cc-brand__logo');
    brandLogo.src = resolveAssetUrl(
      this.assetBase,
      'img/apiops-cycles-logo-2025-64.png',
    );

    this.renderHeaderLinks();
    this.renderToolbar();
    this.renderThemeControls();
    this.renderHelp();
  }

  renderHeaderLinks() {
    this.headerLinks.innerHTML = '';
    if (!this.toolbar.headerLinks) {
      this.headerLinks.hidden = true;
      return;
    }

    this.headerLinks.hidden = false;
    this.headerLinks.innerHTML = `
      <a href="https://github.com/APIOpsCycles/CanvasCreator.git" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://www.apiopscycles.com/getting-started/partners/" target="_blank" rel="noopener noreferrer">Partners</a>
      <a href="https://tally.so/r/3yQEpp" target="_blank" rel="noopener noreferrer">Contact</a>
    `;
  }

  createButton(label, control, className = '') {
    const button = this.document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.ccControl = control;
    button.className = className || 'cc-button';
    return button;
  }

  renderToolbar() {
    this.primaryToolbar.innerHTML = '';
    this.secondaryToolbar.innerHTML = '';

    if (this.toolbar.import) {
      this.importButton = this.createButton(
        'Import JSON',
        'import',
        'cc-button cc-button--primary',
      );
      this.primaryToolbar.appendChild(this.importButton);
    } else {
      this.importButton = null;
    }

    if (this.toolbar.metadata) {
      this.metadataButton = this.createButton('Metadata', 'metadata');
      this.secondaryToolbar.appendChild(this.metadataButton);
    } else {
      this.metadataButton = null;
    }

    if (this.toolbar.export) {
      this.exportJsonButton = this.createButton('Export JSON', 'export-json');
      this.exportSvgButton = this.createButton('Export SVG', 'export-svg');
      this.exportPngButton = this.createButton('Export PNG', 'export-png');
      this.secondaryToolbar.append(
        this.exportJsonButton,
        this.exportSvgButton,
        this.exportPngButton,
      );
    } else {
      this.exportJsonButton = null;
      this.exportSvgButton = null;
      this.exportPngButton = null;
    }

    if (this.toolbar.help) {
      this.helpButton = this.createButton('Help', 'help');
      this.secondaryToolbar.appendChild(this.helpButton);
    } else {
      this.helpButton = null;
    }
  }

  renderThemeControls() {
    if (!this.toolbar.themePicker) {
      this.themePanel.hidden = true;
      return;
    }

    this.themePanel.hidden = !this.contentData;
    this.themeSelect.innerHTML = '';
    getThemeNames().forEach((themeName) => {
      const option = this.document.createElement('option');
      option.value = themeName;
      option.textContent = getTheme(themeName).label;
      option.selected = themeName === this.selectedTheme;
      this.themeSelect.appendChild(option);
    });
    this.renderSwatches();
  }

  renderSwatches() {
    if (!this.swatches) return;
    this.swatches.innerHTML = '';
    buildPaletteSwatches(this.selectedTheme, this.currentColor).forEach(
      ({ color, isSelected }) => {
        const swatch = this.document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'cc-swatch';
        if (isSelected) {
          swatch.classList.add('is-selected');
        }
        swatch.dataset.color = color;
        swatch.style.backgroundColor = color;
        swatch.setAttribute('aria-label', `Select ${color} note color`);
        this.swatches.appendChild(swatch);
      },
    );
  }

  renderHelp() {
    if (!this.toolbar.help) {
      this.helpPanel.hidden = true;
      return;
    }

    this.helpPanel.hidden = this.mode !== 'standalone';
    this.helpPanel.innerHTML = `
      <strong>Canvas Help</strong>
      <ul>
        <li>Choose a locale and canvas, or import a canvas JSON file.</li>
        <li>Double-click the canvas to add a note.</li>
        <li>Drag notes to reposition them.</li>
        <li>Double-click a note to edit it and right-click to remove it.</li>
        <li>Use the toolbar to manage metadata and exports.</li>
      </ul>
    `;
  }

  initializeSelections(options) {
    this.populateLocaleSelector();

    const routeParams =
      this.mode === 'standalone' && typeof this.window !== 'undefined'
        ? new URLSearchParams(this.window.location.search)
        : null;
    const rawRouteLocale = routeParams ? routeParams.get('locale') || '' : '';
    const rawRouteCanvas = routeParams ? routeParams.get('canvas') || '' : '';
    const sanitizedRouteLocale = rawRouteLocale
      ? validateInput(sanitizeInput(rawRouteLocale))
      : '';
    const sanitizedRouteCanvas = rawRouteCanvas
      ? validateInput(sanitizeInput(rawRouteCanvas))
      : '';

    const localeFromOptions = options.locale
      ? getLocaleKey(validateInput(sanitizeInput(options.locale)))
      : null;
    const canvasFromOptions = options.canvas
      ? validateInput(sanitizeInput(options.canvas))
      : null;

    const localeFromRoute =
      sanitizedRouteLocale && !localeFromOptions
        ? getLocaleKey(sanitizedRouteLocale)
        : null;
    const canvasFromRoute =
      sanitizedRouteCanvas && !canvasFromOptions
        ? sanitizedRouteCanvas
        : null;

    const initialLocale =
      localeFromOptions ||
      (localeFromRoute && localizedData[localeFromRoute] ? localeFromRoute : '') ||
      '';
    const initialCanvas = canvasFromOptions || canvasFromRoute || '';

    if (initialLocale) {
      this.localeSelect.value = initialLocale;
      this.populateCanvasSelector(initialLocale);
    } else {
      this.populateCanvasSelector('');
    }

    if (
      initialLocale &&
      initialCanvas &&
      localizedData[initialLocale] &&
      localizedData[initialLocale][initialCanvas]
    ) {
      this.canvasSelect.value = initialCanvas;
      this.loadCanvas(initialLocale, initialCanvas);
    } else {
      this.clearCanvas();
    }
  }

  attachStaticEvents() {
    this.localeSelect.addEventListener('change', () => {
      const locale = this.localeSelect.value;
      if (this.hasStickyNotes() && !this.window.confirm(
        'Are you sure you want to remove sticky notes and change language?'
      )) {
        this.localeSelect.value = this.currentLocale || '';
        return;
      }
      this.currentLocale = locale || null;
      this.populateCanvasSelector(locale);
      this.clearCanvas();
    });

    this.canvasSelect.addEventListener('change', () => {
      const locale = this.localeSelect.value;
      const canvasId = this.canvasSelect.value;
      if (this.hasStickyNotes() && !this.window.confirm(
        'Are you sure you want to remove sticky notes and change canvas?'
      )) {
        this.canvasSelect.value = this.currentCanvas || '';
        return;
      }
      if (!locale || !canvasId) {
        this.clearCanvas();
        return;
      }
      this.loadCanvas(locale, canvasId);
    });

    if (this.importButton) {
      this.importButton.addEventListener('click', () => this.fileInput.click());
    }

    this.fileInput.addEventListener('change', () => this.importFromFile());

    if (this.metadataButton) {
      this.metadataButton.addEventListener('click', () =>
        this.openMetadataDialog(),
      );
    }

    if (this.exportJsonButton) {
      this.exportJsonButton.addEventListener('click', () => this.exportJSON());
      this.exportSvgButton.addEventListener('click', () => this.exportSVG());
      this.exportPngButton.addEventListener('click', () => this.exportPNG());
    }

    if (this.helpButton) {
      this.helpButton.addEventListener('click', () => {
        this.helpPanel.hidden = !this.helpPanel.hidden;
      });
    }

    this.themeSelect.addEventListener('change', () => {
      this.selectedTheme = this.themeSelect.value;
      this.currentColor = getSafeColorForTheme(
        this.selectedTheme,
        this.currentColor,
      );
      writeSessionValue('selectedTheme', this.selectedTheme);
      writeSessionValue('selectedColor', this.currentColor);
      this.renderSwatches();
    });

    this.swatches.addEventListener('click', (event) => {
      const swatch = event.target.closest('.cc-swatch');
      if (!swatch) return;

      this.currentColor = swatch.dataset.color;
      writeSessionValue('selectedColor', this.currentColor);

      const selectedNote = this.getSelectedNote();
      if (selectedNote) {
        selectedNote.note.color = this.currentColor;
        this.render();
      } else {
        this.renderSwatches();
      }
    });

    this.root
      .querySelector('[data-cc-role="saveMetadata"]')
      .addEventListener('click', () => this.saveMetadata());
    this.root
      .querySelector('[data-cc-role="closeMetadata"]')
      .addEventListener('click', () => this.closeMetadataDialog());

    this.notesLayer.addEventListener('click', (event) => this.onNoteClick(event));
    this.notesLayer.addEventListener('dblclick', (event) =>
      this.onNoteDoubleClick(event),
    );
    this.notesLayer.addEventListener('contextmenu', (event) =>
      this.onNoteContextMenu(event),
    );
    this.notesLayer.addEventListener('pointerdown', (event) =>
      this.onNotePointerDown(event),
    );

    this.stageHost.addEventListener('dblclick', (event) => {
      if (event.target.closest('.cc-note')) return;
      this.createStickyNoteAtEvent(event);
    });
  }

  installAutoResize() {
    if (this.window && this.window.addEventListener) {
      this.window.addEventListener('resize', this.handleWindowResize);
      this.window.addEventListener('beforeunload', this.handleBeforeUnload);
    }

    if (typeof this.window.ResizeObserver === 'function') {
      this.resizeObserver = new this.window.ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.container);
    }
  }

  populateLocaleSelector() {
    this.localeSelect.innerHTML = '';
    const empty = this.document.createElement('option');
    empty.value = '';
    empty.textContent = 'Select Locale';
    this.localeSelect.appendChild(empty);

    Object.keys(localizedData).forEach((locale) => {
      const option = this.document.createElement('option');
      option.value = locale;
      option.textContent = locale;
      this.localeSelect.appendChild(option);
    });
  }

  populateCanvasSelector(locale) {
    this.canvasSelect.innerHTML = '';
    const empty = this.document.createElement('option');
    empty.value = '';
    empty.textContent = 'Select Canvas';
    this.canvasSelect.appendChild(empty);

    if (!locale || !localizedData[locale]) return;

    Object.keys(localizedData[locale]).forEach((canvasId) => {
      const option = this.document.createElement('option');
      option.value = canvasId;
      option.textContent = localizedData[locale][canvasId].title;
      this.canvasSelect.appendChild(option);
    });
  }

  clearCanvas() {
    this.contentData = null;
    this.currentCanvas = this.canvasSelect.value || null;
    this.selectedNoteRef = null;
    this.render();
  }

  hasStickyNotes() {
    return Boolean(
      this.contentData &&
        this.contentData.sections &&
        this.contentData.sections.some(
          (section) => section.stickyNotes && section.stickyNotes.length > 0,
        ),
    );
  }

  loadCanvas(locale, canvasId, preserveContentData = false) {
    const normalizedLocale = getLocaleKey(locale);
    const canvasDef = canvasData[canvasId];
    if (!canvasDef || !localizedData[normalizedLocale]?.[canvasId]) {
      this.clearCanvas();
      return null;
    }

    this.currentLocale = normalizedLocale;
    this.currentCanvas = canvasId;
    this.localeSelect.value = normalizedLocale;
    this.populateCanvasSelector(normalizedLocale);
    this.canvasSelect.value = canvasId;

    if (!preserveContentData || !this.contentData) {
      this.contentData = buildEmptyContent(normalizedLocale, canvasId);
    } else {
      this.contentData.locale = normalizedLocale;
      this.contentData.templateId = canvasId;
    }

    this.selectedNoteRef = null;
    this.render();
    return this.contentData;
  }

  createCanvas(locale, canvasId, preserveContentData = false) {
    return this.loadCanvas(locale, canvasId, preserveContentData);
  }

  render() {
    this.root.dataset.mode = this.mode;
    this.root.classList.toggle('cc-root--compact', this.compact);

    if (!this.contentData) {
      this.svgHost.innerHTML = `
        <div class="cc-empty-state">
          <strong>Select a canvas to start</strong>
          <span>Choose a locale and template, or import a saved canvas JSON file.</span>
        </div>
      `;
      this.notesLayer.innerHTML = '';
      this.themePanel.hidden = true;
      this.resize();
      return;
    }

    this.svgHost.innerHTML = buildCanvasSvgMarkup({
      assetBase: this.assetBase,
      content: this.contentData,
      includeNotes: false,
      inlineLogo: this.inlineLogo,
    });

    this.geometry = getCanvasGeometry(
      canvasData[this.contentData.templateId],
      this.contentData.locale,
      this.contentData,
    );

    this.renderNotes();
    this.renderThemeControls();
    this.resize();
  }

  renderNotes() {
    this.notesLayer.innerHTML = '';
    this.contentData.sections.forEach((section, sectionIndex) => {
      section.stickyNotes.forEach((note, noteIndex) => {
        const noteElement = this.document.createElement('div');
        noteElement.className = 'cc-note';
        noteElement.dataset.sectionIndex = String(sectionIndex);
        noteElement.dataset.noteIndex = String(noteIndex);
        noteElement.style.left = `${note.position?.x || 0}px`;
        noteElement.style.top = `${note.position?.y || 0}px`;
        noteElement.style.width = `${note.size || defaultStyles.stickyNoteSize}px`;
        noteElement.style.height = `${note.size || defaultStyles.stickyNoteSize}px`;
        noteElement.style.backgroundColor =
          note.color || defaultStyles.stickyNoteColor;
        noteElement.textContent = note.content;

        if (
          this.selectedNoteRef &&
          this.selectedNoteRef.sectionIndex === sectionIndex &&
          this.selectedNoteRef.noteIndex === noteIndex
        ) {
          noteElement.classList.add('is-selected');
        }

        this.notesLayer.appendChild(noteElement);
      });
    });
  }

  updateNoteSelectionStyles() {
    const selected = this.selectedNoteRef;
    this.notesLayer.querySelectorAll('.cc-note').forEach((noteElement) => {
      const sectionIndex = Number(noteElement.dataset.sectionIndex);
      const noteIndex = Number(noteElement.dataset.noteIndex);
      const isSelected =
        selected &&
        selected.sectionIndex === sectionIndex &&
        selected.noteIndex === noteIndex;
      noteElement.classList.toggle('is-selected', Boolean(isSelected));
    });
  }

  getSelectedNote() {
    if (!this.selectedNoteRef || !this.contentData) return null;
    const section = this.contentData.sections[this.selectedNoteRef.sectionIndex];
    if (!section) return null;
    const note = section.stickyNotes[this.selectedNoteRef.noteIndex];
    if (!note) return null;
    return { section, note };
  }

  openMetadataDialog() {
    if (!this.contentData) return;
    const metadata = this.contentData.metadata || {};
    this.metadataSource.value = metadata.source || '';
    this.metadataLicense.value = metadata.license || '';
    this.metadataAuthors.value = Array.isArray(metadata.authors)
      ? metadata.authors.join(',')
      : metadata.authors || '';
    this.metadataWebsite.value = metadata.website || '';

    if (typeof this.metadataDialog.showModal === 'function') {
      this.metadataDialog.showModal();
    } else {
      this.metadataDialog.setAttribute('open', 'open');
    }
  }

  closeMetadataDialog() {
    if (typeof this.metadataDialog.close === 'function') {
      this.metadataDialog.close();
    } else {
      this.metadataDialog.removeAttribute('open');
    }
  }

  saveMetadata() {
    if (!this.contentData) return;
    this.contentData.metadata = {
      source: this.metadataSource.value,
      license: this.metadataLicense.value,
      authors: this.metadataAuthors.value
        .split(',')
        .map((author) => author.trim())
        .filter(Boolean),
      website: this.metadataWebsite.value,
    };
    this.closeMetadataDialog();
    this.render();
  }

  importFromFile() {
    const file = this.fileInput.files && this.fileInput.files[0];
    if (!file) return;

    const reader = new this.window.FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (
          !imported.templateId ||
          !imported.metadata ||
          !Array.isArray(imported.sections)
        ) {
          throw new Error('Invalid JSON file format.');
        }

        const locale = getLocaleKey(imported.locale || defaultStyles.defaultLocale);
        const cloned = cloneContent(imported);
        distributeMissingPositions(
          cloned,
          canvasData[imported.templateId],
          defaultStyles,
        );

        this.contentData = cloned;
        this.contentData.locale = locale;
        this.currentLocale = locale;
        this.currentCanvas = imported.templateId;
        this.localeSelect.value = locale;
        this.populateCanvasSelector(locale);
        this.canvasSelect.value = imported.templateId;
        this.selectedNoteRef = null;
        this.render();
      } catch (error) {
        this.window.alert(`Failed to import canvas JSON: ${error.message}`);
      } finally {
        this.fileInput.value = '';
      }
    };

    reader.readAsText(file);
  }

  onNoteClick(event) {
    const noteElement = event.target.closest('.cc-note');
    if (!noteElement || this.isEditingNote || event.target.closest('.cc-note-editor')) {
      return;
    }
    this.selectedNoteRef = {
      sectionIndex: Number(noteElement.dataset.sectionIndex),
      noteIndex: Number(noteElement.dataset.noteIndex),
    };
    this.updateNoteSelectionStyles();
    this.renderSwatches();
  }

  onNoteDoubleClick(event) {
    const noteElement = event.target.closest('.cc-note');
    if (!noteElement) return;

    event.preventDefault();
    event.stopPropagation();
    const sectionIndex = Number(noteElement.dataset.sectionIndex);
    const noteIndex = Number(noteElement.dataset.noteIndex);
    const section = this.contentData.sections[sectionIndex];
    const note = section && section.stickyNotes[noteIndex];
    if (!note) return;

    if (noteElement.querySelector('textarea')) return;

    this.isEditingNote = true;
    noteElement.textContent = '';
    const textarea = this.document.createElement('textarea');
    textarea.className = 'cc-note-editor';
    textarea.value = note.content;
    noteElement.appendChild(textarea);
    textarea.focus();

    const finishEditing = () => {
      note.content = validateInput(sanitizeInput(textarea.value.trim()));
      if (!note.content) {
        note.content = ' ';
      }
      this.isEditingNote = false;
      this.render();
    };

    textarea.addEventListener('blur', finishEditing, { once: true });
    textarea.addEventListener('keydown', (keyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.preventDefault();
        this.isEditingNote = false;
        this.render();
      }
      if (
        keyboardEvent.key === 'Enter' &&
        (keyboardEvent.ctrlKey || keyboardEvent.metaKey)
      ) {
        keyboardEvent.preventDefault();
        textarea.blur();
      }
    });
  }

  onNoteContextMenu(event) {
    const noteElement = event.target.closest('.cc-note');
    if (!noteElement) return;
    event.preventDefault();

    const sectionIndex = Number(noteElement.dataset.sectionIndex);
    const noteIndex = Number(noteElement.dataset.noteIndex);
    const section = this.contentData.sections[sectionIndex];
    if (!section) return;

    if (this.window.confirm('Are you sure you want to delete this sticky note?')) {
      section.stickyNotes.splice(noteIndex, 1);
      this.selectedNoteRef = null;
      this.render();
    }
  }

  onNotePointerDown(event) {
    const noteElement = event.target.closest('.cc-note');
    if (!noteElement) return;

    const sectionIndex = Number(noteElement.dataset.sectionIndex);
    const noteIndex = Number(noteElement.dataset.noteIndex);
    const section = this.contentData.sections[sectionIndex];
    const note = section && section.stickyNotes[noteIndex];
    if (!note) return;

    const frameRect = this.stageFrame.getBoundingClientRect();
    this.dragState = {
      sectionIndex,
      noteIndex,
      pointerId: event.pointerId,
      offsetX: event.clientX - frameRect.left - note.position.x * this.currentScale,
      offsetY: event.clientY - frameRect.top - note.position.y * this.currentScale,
    };

    this.selectedNoteRef = { sectionIndex, noteIndex };
    this.updateNoteSelectionStyles();

    this.window.addEventListener('pointermove', this.handlePointerMove);
    this.window.addEventListener('pointerup', this.handlePointerUp);
  }

  onPointerMove(event) {
    if (!this.dragState || !this.contentData) return;

    const frameRect = this.stageFrame.getBoundingClientRect();
    const section = this.contentData.sections[this.dragState.sectionIndex];
    const note = section && section.stickyNotes[this.dragState.noteIndex];
    if (!note) return;

    note.position.x = Math.max(
      0,
      (event.clientX - frameRect.left - this.dragState.offsetX) /
        this.currentScale,
    );
    note.position.y = Math.max(
      0,
      (event.clientY - frameRect.top - this.dragState.offsetY) /
        this.currentScale,
    );
    this.renderNotes();
  }

  onPointerUp() {
    this.dragState = null;
    this.window.removeEventListener('pointermove', this.handlePointerMove);
    this.window.removeEventListener('pointerup', this.handlePointerUp);
  }

  checkForUnsavedChanges(event) {
    if (!this.hasStickyNotes()) return;

    const message =
      'You have unsaved changes. Are you sure you want to leave this page?';
    event.preventDefault();
    event.returnValue = message;
    return message;
  }

  createStickyNoteAtEvent(event) {
    if (!this.contentData || !this.geometry) return;

    const frameRect = this.stageFrame.getBoundingClientRect();
    const x = (event.clientX - frameRect.left) / this.currentScale;
    const y = (event.clientY - frameRect.top) / this.currentScale;

    const targetSection = this.geometry.sections.find(
      (section) =>
        x >= section.x &&
        x <= section.x + section.width &&
        y >= section.y &&
        y <= section.y + section.height,
    );

    if (!targetSection) return;

    const sectionContent = this.contentData.sections.find(
      (section) => section.sectionId === targetSection.id,
    );
    if (!sectionContent) return;

    sectionContent.stickyNotes.push({
      content: 'Double-click to edit',
      position: {
        x: Math.max(0, x - defaultStyles.stickyNoteSize / 2),
        y: Math.max(0, y - defaultStyles.stickyNoteSize / 2),
      },
      size: defaultStyles.stickyNoteSize,
      color: this.currentColor,
    });

    this.selectedNoteRef = {
      sectionIndex: this.contentData.sections.indexOf(sectionContent),
      noteIndex: sectionContent.stickyNotes.length - 1,
    };
    this.render();
  }

  exportJSON() {
    if (!this.contentData) return;
    const blob = new Blob([JSON.stringify(this.contentData, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(
      this.document,
      blob,
      `${getExportBaseName(this.contentData)}.json`,
    );
  }

  exportSVG() {
    if (!this.contentData) return;
    const svgMarkup = buildCanvasSvgMarkup({
      assetBase: this.assetBase,
      content: this.contentData,
      includeNotes: true,
      inlineLogo: this.inlineLogo,
    });
    const blob = new Blob([svgMarkup], {
      type: 'image/svg+xml;charset=utf-8',
    });
    downloadBlob(
      this.document,
      blob,
      `${getExportBaseName(this.contentData)}.svg`,
    );
  }

  exportPNG() {
    if (!this.contentData) return;
    const svgMarkup = buildCanvasSvgMarkup({
      assetBase: this.assetBase,
      content: this.contentData,
      includeNotes: true,
      inlineLogo: this.inlineLogo,
    });
    const image = new this.window.Image();
    const canvas = this.document.createElement('canvas');
    canvas.width = BASE_WIDTH;
    canvas.height = BASE_HEIGHT;

    image.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        downloadBlob(
          this.document,
          blob,
          `${getExportBaseName(this.contentData)}.png`,
        );
      });
    };

    image.src = `data:image/svg+xml;base64,${this.window.btoa(
      unescape(encodeURIComponent(svgMarkup)),
    )}`;
  }

  resize() {
    const maxWidth = this.resolveDimension(this.maxWidth, this.container.clientWidth);
    const maxHeight = this.resolveDimension(this.maxHeight, null);

    let scale = 1;
    if (this.fitToContainer) {
      const widthScale = maxWidth ? maxWidth / BASE_WIDTH : 1;
      const heightScale = maxHeight ? maxHeight / BASE_HEIGHT : 1;
      const containerWidthScale = this.container.clientWidth
        ? this.container.clientWidth / BASE_WIDTH
        : 1;
      scale = Math.min(widthScale, heightScale, containerWidthScale, 1);
      if (!Number.isFinite(scale) || scale <= 0) {
        scale = 1;
      }
    }

    this.currentScale = scale;
    this.stageHost.style.maxWidth = maxWidth ? `${maxWidth}px` : '';
    this.stageHost.style.maxHeight = maxHeight ? `${maxHeight}px` : '';
    this.stageHost.style.width = `${BASE_WIDTH * scale}px`;
    this.stageHost.style.height = `${BASE_HEIGHT * scale}px`;
    this.stageFrame.style.transform = `scale(${scale})`;
  }

  resolveDimension(value, fallback) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.endsWith('px')) {
        return Number(trimmed.replace('px', ''));
      }
      if (trimmed.endsWith('%') && this.container.clientWidth) {
        return (
          (Number(trimmed.replace('%', '')) / 100) * this.container.clientWidth
        );
      }
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric)) {
        return numeric;
      }
    }
    return fallback;
  }

  destroy() {
    this.onPointerUp();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.window && this.window.removeEventListener) {
      this.window.removeEventListener('resize', this.handleWindowResize);
      this.window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    if (this.container.__canvasCreatorInstance === this) {
      delete this.container.__canvasCreatorInstance;
    }

    if (latestInstance === this) {
      latestInstance = null;
    }

    this.container.innerHTML = '';
  }
}

function initCanvasCreator(options = {}) {
  latestInstance = new CanvasCreatorInstance(options);
  return latestInstance;
}

function requireLatestInstance() {
  if (!latestInstance) {
    throw new Error(
      'No active CanvasCreator instance. Call initCanvasCreator({ container }) first.',
    );
  }
  return latestInstance;
}

function loadCanvas(locale, canvasId, preserveContentData = false) {
  return requireLatestInstance().loadCanvas(locale, canvasId, preserveContentData);
}

function createCanvas(locale, canvasId, preserveContentData = false) {
  return requireLatestInstance().createCanvas(
    locale,
    canvasId,
    preserveContentData,
  );
}

module.exports = {
  CanvasCreatorInstance,
  initCanvasCreator,
  loadCanvas,
  createCanvas,
  getSessionStorage,
  syncThemeStateFromSession: () =>
    latestInstance ? syncThemeStateFromSession(latestInstance) : null,
};
