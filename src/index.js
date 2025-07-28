const helpers = require('./helpers');
const legacy = require('./main');
const defaultStyles = require('./defaultStyles');

module.exports = {
  createCanvas: legacy.loadCanvas,
  loadCanvas: legacy.loadCanvas,
  sanitizeInput: helpers.sanitizeInput,
  validateInput: helpers.validateInput,
  distributeMissingPositions: helpers.distributeMissingPositions,
  defaultStyles,
};
