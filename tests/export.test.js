const fs = require('fs');
const {
  buildContent,
  buildFileName,
  renderSVG,
  writePNG,
  exportJSON,
} = require('../src/node-export.cjs');
const { getJourneyStepsLayout } = require('../src/helpers.js');
const canvasData = require('apiops-cycles-method-data/canvasData.json');
const localizedData = require('apiops-cycles-method-data/localizedData.json');
const defaultStyles = require('../src/defaultStyles');

function wrapTextApprox(text, maxWidth = defaultStyles.maxLineWidth) {
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

  test('renderSVG wraps long localized header and section titles', () => {
    const content = buildContent(canvasData, 'interactionCanvas', 'de', false);
    const svg = renderSVG(canvasData['interactionCanvas'], localizedData, content);
    const headerFragment = svg.split('<rect')[0];

    expect(headerFragment).toContain('<tspan>');
    expect(svg).toMatch(/<text[^>]*font-weight="bold"[^>]*><tspan>/);
    expect(svg).not.toContain('Eventgesteuerte Input- &amp; Output-Modelle</text>');
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

  test('imported domain canvas notes start below titles and journey steps', () => {
    const imported = JSON.parse(
      fs.readFileSync(
        'C:/Users/MarjukkaNiinioja/Downloads/specs/canvases/api-product-strategy/domainCanvas.example.json',
        'utf8',
      ),
    );

    const content = buildContent(
      canvasData,
      'domainCanvas',
      'en',
      false,
      imported,
      true,
    );

    const canvasDef = canvasData.domainCanvas;
    const cellWidth = Math.floor(
      (defaultStyles.width - canvasDef.layout.columns * defaultStyles.padding) /
        canvasDef.layout.columns,
    );
    const cellHeight = Math.floor(
      (defaultStyles.height -
        defaultStyles.headerHeight -
        defaultStyles.footerHeight -
        4 * defaultStyles.padding) /
        canvasDef.layout.rows,
    );

    const journeySectionDef = canvasDef.sections.find(
      (section) => section.id === 'selectedCustomerJourneySteps',
    );
    const journeySection = content.sections.find(
      (section) => section.sectionId === 'selectedCustomerJourneySteps',
    );
    const journeySectionBox = {
      x: journeySectionDef.gridPosition.column * cellWidth + 2 * defaultStyles.padding,
      y: journeySectionDef.gridPosition.row * cellHeight + defaultStyles.headerHeight,
      width: journeySectionDef.gridPosition.colSpan * cellWidth,
      height: journeySectionDef.gridPosition.rowSpan * cellHeight,
    };
    const journeyLayout = getJourneyStepsLayout(
      journeySectionDef,
      journeySectionBox,
      defaultStyles,
    );
    const noteGap = Math.max(4, Math.floor(defaultStyles.stickyNoteSpacing / 2));
    const journeyInsetY = Math.max(4, Math.floor(noteGap / 2));

    expect(journeySection.stickyNotes[0].position.y).toBeGreaterThanOrEqual(
      journeyLayout.boxes[0].y,
    );
    expect(journeySection.stickyNotes[0].position.y).toBeLessThanOrEqual(
      journeyLayout.boxes[0].y +
        journeyLayout.boxes[0].height -
        journeySection.stickyNotes[0].size +
        journeyInsetY,
    );

    const coreEntitiesDef = canvasDef.sections.find(
      (section) => section.id === 'coreEntitiesAndBusinessMeaning',
    );
    const coreEntities = content.sections.find(
      (section) => section.sectionId === 'coreEntitiesAndBusinessMeaning',
    );
    const coreTop =
      coreEntitiesDef.gridPosition.row * cellHeight + defaultStyles.headerHeight;
    const coreWidth = coreEntitiesDef.gridPosition.colSpan * cellWidth;
    const coreTitle = localizedData.en.domainCanvas.sections.coreEntitiesAndBusinessMeaning.section;
    const coreTitleLines = wrapTextApprox(
      coreTitle,
      coreWidth - 2 * defaultStyles.padding - defaultStyles.circleRadius,
    )
      .split('\n')
      .filter(Boolean).length || 1;
    const coreTitleBottom =
      coreTop +
      defaultStyles.padding +
      defaultStyles.circleRadius +
      (coreTitleLines - 1) * (defaultStyles.fontSize + 2);

    expect(coreEntities.stickyNotes[0].position.y).toBeGreaterThan(
      coreTitleBottom,
    );
  });

  test('renderSVG draws notes above later section backgrounds', () => {
    const content = buildContent(canvasData, 'apiBusinessModelCanvas', 'en', false);
    content.sections[0].stickyNotes.push({
      content: 'BorderNote',
      position: { x: 470, y: 120 },
      size: 80,
      color: '#C0EB6A',
    });

    const svg = renderSVG(canvasData['apiBusinessModelCanvas'], localizedData, content);
    const noteIndex = svg.indexOf('BorderNote');
    const laterSectionTitle =
      localizedData['en']['apiBusinessModelCanvas'].sections.keyActivities.section;

    expect(noteIndex).toBeGreaterThan(svg.indexOf(laterSectionTitle));
  });

  test('renderSVG includes journey steps on journey canvases', () => {
    const canvases = [
      ['customerJourneyCanvas', 'journeySteps'],
      ['domainCanvas', 'selectedCustomerJourneySteps'],
      ['apiValuePropositionCanvas', 'tasks'],
    ];

    canvases.forEach(([canvasId, sectionId]) => {
      const content = buildContent(canvasData, canvasId, 'en', false);
      const section = content.sections.find((item) => item.sectionId === sectionId);
      expect(section).toBeDefined();

      const svg = renderSVG(canvasData[canvasId], localizedData, content);
      expect(svg).toContain('url(#journey-arrowhead)');
      expect((svg.match(/stroke-dasharray="3"/g) || []).length).toBe(5);
    });
  });

  test('renderSVG keeps sticky notes above journey steps', () => {
    const content = buildContent(canvasData, 'customerJourneyCanvas', 'en', false);
    const journeySection = content.sections.find(
      (section) => section.sectionId === 'journeySteps',
    );

    journeySection.stickyNotes.push({
      content: 'JourneyNote',
      position: { x: 330, y: 420 },
      size: 80,
      color: '#C0EB6A',
    });

    const svg = renderSVG(canvasData['customerJourneyCanvas'], localizedData, content);
    expect(svg.indexOf('JourneyNote')).toBeGreaterThan(
      svg.indexOf('marker-end="url(#journey-arrowhead)"'),
    );
    expect(svg.indexOf('JourneyNote')).toBeGreaterThan(
      svg.indexOf('stroke-dasharray="3"'),
    );
  });

  test('journey notes are centered within step boxes', () => {
    const canvasIds = [
      [
        'customerJourneyCanvas',
        'journeySteps',
        ['Discover', 'Evaluate', 'Try', 'Adopt', 'Expand'],
      ],
      [
        'apiValuePropositionCanvas',
        'tasks',
        ['Search', 'Filter', 'Open', 'Compare', 'Check'],
      ],
    ];

    canvasIds.forEach(([canvasId, sectionId, notes]) => {
      const imported = {
        templateId: canvasId,
        locale: 'en',
        metadata: {},
        sections: canvasData[canvasId].sections.map((section) => ({
          sectionId: section.id,
          stickyNotes:
            section.id === sectionId
              ? notes.map((content) => ({ content, size: 80, color: '#7DC9E7' }))
              : [],
        })),
      };
      const content = buildContent(canvasData, canvasId, 'en', false, imported, true);
      const canvasDef = canvasData[canvasId];
      const noteSection = content.sections.find((section) => section.sectionId === sectionId);
      const sectionDef = canvasDef.sections.find((section) => section.id === sectionId);

      const cellWidth = Math.floor(
        (defaultStyles.width - canvasDef.layout.columns * defaultStyles.padding) /
          canvasDef.layout.columns,
      );
      const cellHeight = Math.floor(
        (defaultStyles.height -
          defaultStyles.headerHeight -
          defaultStyles.footerHeight -
          4 * defaultStyles.padding) /
          canvasDef.layout.rows,
      );
      const sectionBox = {
        x: sectionDef.gridPosition.column * cellWidth + 2 * defaultStyles.padding,
        y: sectionDef.gridPosition.row * cellHeight + defaultStyles.headerHeight,
        width: sectionDef.gridPosition.colSpan * cellWidth,
        height: sectionDef.gridPosition.rowSpan * cellHeight,
      };
      const journeyLayout = getJourneyStepsLayout(sectionDef, sectionBox, defaultStyles);
      const noteGap = Math.max(4, Math.floor(defaultStyles.stickyNoteSpacing / 2));
      const journeyInsetY = Math.max(4, Math.floor(noteGap / 2));

      const firstNote = noteSection.stickyNotes[0];
      const firstBox = journeyLayout.boxes[0];
      expect(firstNote.position.x).toBe(
        firstBox.x + Math.max(0, Math.floor((firstBox.width - firstNote.size) / 2)),
      );
      expect(firstNote.position.y).toBe(
        firstBox.y +
          Math.max(0, Math.floor((firstBox.height - firstNote.size) / 2)) +
          journeyInsetY,
      );
    });
  });

  test('writePNG export exists', () => {
    expect(typeof writePNG).toBe('function');
  });
});
