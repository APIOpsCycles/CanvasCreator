const Ajv = require('ajv');
const schema = require('./import-export.schema.json');
const canvasData = require('apiops-cycles-method-data/canvasData.json');
const localizedData = require('apiops-cycles-method-data/localizedData.json');
const { getLocaleKey } = require('./helpers');

const validateSchema = new Ajv({ allErrors: true }).compile(schema);

function describeSchemaErrors(errors) {
  const groups = new Map();
  for (const error of errors) {
    const field = error.params.missingProperty || error.params.additionalProperty || error.instancePath.split('/').pop();
    // The missing-content message already explains how to fix a `text` field.
    if (error.keyword === 'additionalProperties' && field === 'text' && errors.some(
      (other) => other.instancePath === error.instancePath && other.keyword === 'required' && other.params.missingProperty === 'content',
    )) continue;
    const note = error.instancePath.match(/^\/sections\/(\d+)\/stickyNotes\/(\d+)/);
    const section = error.instancePath.match(/^\/sections\/(\d+)/);
    const location = note
      ? `Section ${Number(note[1]) + 1}, sticky note ${Number(note[2]) + 1}`
      : section ? `Section ${Number(section[1]) + 1}` : 'Canvas';
    let message;
    if (error.keyword === 'required') {
      message = `Add the required "${field}" field.`;
      if (field === 'content' && note) {
        message = 'Add a "content" field containing the note text. If the file uses "text", rename it to "content".';
      }
    } else if (error.keyword === 'additionalProperties') {
      message = `Remove the unsupported "${field}" field.`;
    } else if (error.keyword === 'type') {
      message = `The "${field || 'canvas'}" value must be ${error.params.type === 'array' ? 'a list' : `a ${error.params.type}`}.`;
    } else if (error.keyword === 'pattern' && field === 'color') {
      message = 'Use a hex color such as "#FFF399", or leave out "color" to use the default.';
    } else {
      message = `Check the "${field || 'canvas'}" value: ${error.message}.`;
    }
    const key = `${note ? 'note' : 'canvas'}:${message}`;
    const group = groups.get(key);
    if (group) group.count += 1;
    else groups.set(key, { location, message, count: 1 });
  }
  const messages = [...groups.values()].slice(0, 3).map(({ location, message, count }) =>
    `${location}: ${message}${count > 1 ? ` (${count} places need this fix.)` : ''}`,
  );
  if (groups.size > 3) messages.push(`${groups.size - 3} more types of issue remain. Fix these first, then try importing again.`);
  return messages.join('\n\n');
}

function importError(message, userMessage) {
  const error = new Error(message);
  error.userMessage = userMessage;
  return error;
}

function getImportErrorMessage(error) {
  if (error.userMessage) return error.userMessage;
  if (error instanceof SyntaxError) {
    return 'This file is not valid JSON. Check for missing commas, quotes, or brackets, then try again.';
  }
  return 'The file could not be imported. Check that it is a CanvasCreator JSON file, then try again.';
}

function validateImportedContent(content) {
  if (!validateSchema(content)) {
    const details = validateSchema.errors.map((error) => {
      let path = error.instancePath || '';
      if (error.keyword === 'required') path += `/${error.params.missingProperty}`;
      if (error.keyword === 'additionalProperties') path += `/${error.params.additionalProperty}`;
      return `${path || '/'}: ${error.message}`;
    });
    throw importError(`Invalid canvas JSON:\n${details.join('\n')}`, describeSchemaErrors(validateSchema.errors));
  }

  const template = Object.hasOwn(canvasData, content.templateId) && canvasData[content.templateId];
  if (!template) throw importError(`Invalid canvas JSON: /templateId: unknown template "${content.templateId}"`, `The canvas template "${content.templateId}" is not recognized. Check the "templateId" field.`);
  const locale = getLocaleKey(content.locale);
  if (!localizedData[locale]?.[content.templateId]) {
    throw importError(`Invalid canvas JSON: /locale: unsupported locale "${content.locale}" for this template`, `The language "${content.locale}" is not available for this canvas. Check the "locale" field.`);
  }
  const sectionIds = new Set(template.sections.map((section) => section.id));
  const seen = new Set();
  content.sections.forEach((section, index) => {
    if (!sectionIds.has(section.sectionId) || seen.has(section.sectionId)) {
      throw importError(`Invalid canvas JSON: /sections/${index}/sectionId: unknown or duplicate section "${section.sectionId}"`, `Section ${index + 1} uses an unknown or repeated section ID "${section.sectionId}". Check the "sectionId" field against the selected template.`);
    }
    seen.add(section.sectionId);
  });
  return content;
}

module.exports = { validateImportedContent, getImportErrorMessage };
