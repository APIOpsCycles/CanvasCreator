const { validateInput } = require('../src/helpers.js');

describe('validateInput', () => {
  test('truncates strings longer than 200 characters', () => {
    const longInput = 'a'.repeat(205);
    const result = validateInput(longInput);
    expect(result).toBe(longInput.substring(0, 200));
    expect(result.length).toBe(200);
  });

  test('passes through short strings unchanged', () => {
    const shortInput = 'Short text';
    const result = validateInput(shortInput);
    expect(result).toBe(shortInput);
  });
});
