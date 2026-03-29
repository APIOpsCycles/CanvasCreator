describe('note editing', () => {
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

  test('double-clicking a note opens an editor and saves changes on blur', async () => {
    const host = document.getElementById('host');
    const { initCanvasCreator } = require('../src/main.js');

    initCanvasCreator({
      container: host,
      locale: 'en',
      canvas: 'apiBusinessModelCanvas',
      fitToContainer: false,
    });

    const stageHost = host.querySelector('.cc-stage-host');
    const stageFrame = host.querySelector('.cc-stage-frame');
    Object.defineProperty(stageHost, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 0, top: 0, width: 1020, height: 712 }),
    });
    Object.defineProperty(stageFrame, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 0, top: 0, width: 1020, height: 712 }),
    });

    for (const [clientX, clientY] of [
      [120, 160],
      [220, 220],
      [320, 260],
      [420, 220],
    ]) {
      stageHost.dispatchEvent(
        new MouseEvent('dblclick', {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY,
        }),
      );
      if (host.querySelector('.cc-note')) {
        break;
      }
    }

    const note = host.querySelector('.cc-note');
    expect(note).not.toBeNull();

    note.dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, cancelable: true }),
    );

    const textarea = note.querySelector('textarea');
    expect(textarea).not.toBeNull();

    textarea.value = 'Updated note text';
    textarea.dispatchEvent(new Event('blur', { bubbles: true }));

    expect(host.querySelector('.cc-note').textContent).toContain(
      'Updated note text',
    );
  });
});
