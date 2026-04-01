const {
  buildContent,
  buildFileName,
  renderSVG,
  writePNG,
  exportJSON,
} = require('../src/node-export.cjs');
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

  test('writePNG export exists', () => {
    expect(typeof writePNG).toBe('function');
  });
});
