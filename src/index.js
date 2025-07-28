const helpers = require('./helpers');
const canvasCreator = require('./main');
const defaultStyles = require('./defaultStyles');

exports.createCanvas = canvasCreator.loadCanvas;
exports.loadCanvas = canvasCreator.loadCanvas;
exports.sanitizeInput = helpers.sanitizeInput;
exports.validateInput = helpers.validateInput;
exports.distributeMissingPositions = helpers.distributeMissingPositions;
exports.defaultStyles = defaultStyles;

// default export for CommonJS consumers
module.exports = {
  createCanvas: exports.createCanvas,
  loadCanvas: exports.loadCanvas,
  sanitizeInput: exports.sanitizeInput,
  validateInput: exports.validateInput,
  distributeMissingPositions: exports.distributeMissingPositions,
  defaultStyles: exports.defaultStyles,
};
