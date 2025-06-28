const { sanitizeInput } = require('../scripts/utils.js');

describe('sanitizeInput', () => {
  test('removes <script> tags', () => {
    const input = 'Hello<script>alert("XSS")</script>World';
    const result = sanitizeInput(input);
    expect(result).toBe('HelloWorld');
  });

  test('keeps other HTML intact', () => {
    const input = 'Hello <b>World</b>';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello <b>World</b>');
  });
});
