const helpers = require('./helpers');
const canvasCreator = require('./main');
const defaultStyles = require('./defaultStyles');

exports.createCanvas = canvasCreator.loadCanvas;
exports.loadCanvas = canvasCreator.loadCanvas;
exports.initCanvasCreator = canvasCreator.initCanvasCreator;
exports.sanitizeInput = helpers.sanitizeInput;
exports.validateInput = helpers.validateInput;
exports.distributeMissingPositions = helpers.distributeMissingPositions;
exports.defaultStyles = defaultStyles;
exports.ApiOpsCyclesMethodDataCanvasData = require('apiops-cycles-method-data/canvasData.json');
exports.ApiOpsCyclesMethodDataLocalizedData = require('apiops-cycles-method-data/localizedData.json');

// default export for CommonJS consumers
module.exports = {
  createCanvas: exports.createCanvas,
  loadCanvas: exports.loadCanvas,
  initCanvasCreator: exports.initCanvasCreator,
  sanitizeInput: exports.sanitizeInput,
  validateInput: exports.validateInput,
  distributeMissingPositions: exports.distributeMissingPositions,
  defaultStyles: exports.defaultStyles,
  ApiOpsCyclesMethodDataCanvasData: exports.ApiOpsCyclesMethodDataCanvasData,
  ApiOpsCyclesMethodDataLocalizedData: exports.ApiOpsCyclesMethodDataLocalizedData
};
exports.default = module.exports;
