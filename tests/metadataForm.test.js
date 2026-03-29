describe('metadata dialog', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host');
    Object.defineProperty(host, 'clientWidth', {
      configurable: true,
      value: 900,
    });
    Object.defineProperty(host, 'clientHeight', {
      configurable: true,
      value: 700,
    });
  });

  test('opening metadata dialog pre-fills values from content data', () => {
    const host = document.getElementById('host');
    const { initCanvasCreator } = require('../src/main.js');

    initCanvasCreator({
      container: host,
      locale: 'en',
      canvas: 'apiBusinessModelCanvas',
    });

    host.querySelector('[data-cc-control="metadata"]').click();
    host.querySelector('[data-cc-role="source"]').value = 'Imported Source';
    host.querySelector('[data-cc-role="license"]').value = 'CC-BY-SA 4.0';
    host.querySelector('[data-cc-role="authors"]').value =
      'Test Author,Second Author';
    host.querySelector('[data-cc-role="website"]').value = 'example.com';
    host.querySelector('[data-cc-role="saveMetadata"]').click();

    host.querySelector('[data-cc-control="metadata"]').click();

    expect(host.querySelector('[data-cc-role="source"]').value).toBe(
      'Imported Source',
    );
    expect(host.querySelector('[data-cc-role="license"]').value).toBe(
      'CC-BY-SA 4.0',
    );
    expect(host.querySelector('[data-cc-role="authors"]').value).toBe(
      'Test Author,Second Author',
    );
    expect(host.querySelector('[data-cc-role="website"]').value).toBe(
      'example.com',
    );

    const svgText = host.querySelector('.cc-stage-svg').textContent;
    expect(svgText).toContain('Imported Source');
    expect(svgText).toContain('Template by:');
  });
});
