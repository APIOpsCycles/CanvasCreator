const helpers = require('./helpers');
const legacy = require('./main');

module.exports = {
  createCanvas: legacy.loadCanvas,
  loadCanvas: legacy.loadCanvas,
  sanitizeInput: helpers.sanitizeInput,
  validateInput: helpers.validateInput,
  distributeMissingPositions: helpers.distributeMissingPositions,
};
