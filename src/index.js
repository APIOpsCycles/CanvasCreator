const helpers = require('./helpers');
const canvasCreator = require('./main');
const defaultStyles = require('./defaultStyles');

module.exports = {
  // expose core canvas creation utilities
  createCanvas: canvasCreator.loadCanvas,
  loadCanvas: canvasCreator.loadCanvas,
  sanitizeInput: helpers.sanitizeInput,
  validateInput: helpers.validateInput,
  distributeMissingPositions: helpers.distributeMissingPositions,
  defaultStyles,
};
