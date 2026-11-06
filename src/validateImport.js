const Ajv = require('ajv');
const schema = require('./import-export.schema.json');
const canvasData = require('apiops-cycles-method-data/canvasData.json');
const localizedData = require('apiops-cycles-method-data/localizedData.json');
const { getLocaleKey } = require('./helpers');

const validateSchema = new Ajv({ allErrors: true }).compile(schema);

function validateImportedContent(content) {
  if (!validateSchema(content)) {
    const details = validateSchema.errors.map((error) => {
      let path = error.instancePath || '';
      if (error.keyword === 'required') path += `/${error.params.missingProperty}`;
      if (error.keyword === 'additionalProperties') path += `/${error.params.additionalProperty}`;
      return `${path || '/'}: ${error.message}`;
    });
    throw new Error(`Invalid canvas JSON:\n${details.join('\n')}`);
  }

  const template = Object.hasOwn(canvasData, content.templateId) && canvasData[content.templateId];
  if (!template) throw new Error(`Invalid canvas JSON: /templateId: unknown template "${content.templateId}"`);
  const locale = getLocaleKey(content.locale);
  if (!localizedData[locale]?.[content.templateId]) {
    throw new Error(`Invalid canvas JSON: /locale: unsupported locale "${content.locale}" for this template`);
  }
  const sectionIds = new Set(template.sections.map((section) => section.id));
  const seen = new Set();
  content.sections.forEach((section, index) => {
    if (!sectionIds.has(section.sectionId) || seen.has(section.sectionId)) {
      throw new Error(`Invalid canvas JSON: /sections/${index}/sectionId: unknown or duplicate section "${section.sectionId}"`);
    }
    seen.add(section.sectionId);
  });
  return content;
}

module.exports = { validateImportedContent };
