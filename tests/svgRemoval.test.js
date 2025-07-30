describe('svg removal scoped to container', () => {
  test('only removes svg inside #canvasCreator', () => {
    document.body.innerHTML = `
      <div id="canvasCreator"><svg id="target"></svg></div>
      <svg id="other"></svg>
    `;

    // simulate the removal logic from src/main.js
    const svgToRemove = document.querySelector('#canvasCreator svg');
    if (svgToRemove) svgToRemove.remove();

    expect(document.querySelector('#canvasCreator svg')).toBeNull();
    expect(document.querySelector('#other')).not.toBeNull();
  });
});
