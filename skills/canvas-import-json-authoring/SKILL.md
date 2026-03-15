---
name: canvas-import-json-authoring
description: Create or review importable CanvasCreator JSON files using schema-first validation, template-specific section coverage, locale-aware section descriptions, and APIOps metadata defaults. Use when generating new filled canvas examples, converting raw notes into import JSON, or validating existing import files before import/export.
---

# Canvas Import JSON Authoring

Create import JSON in two passes: (1) schema validity, (2) content quality.

## Workflow

1. Choose `templateId` and `locale`.
2. Validate JSON shape against `references/import-export-template.schema.json`.
3. Validate section IDs against `node_modules/apiops-cycles-method-data/src/data/canvas/canvasData.json`.
4. Generate sticky-note content from section `description` in `node_modules/apiops-cycles-method-data/src/data/canvas/localizedData.json` for the same locale + template.
5. Apply metadata and color conventions.
6. Return a descriptively named JSON file.

## Required authoring rules

- Include `templateId`, `metadata`, and `sections`.
- Use every section in the selected template; do not add unknown sections.
- Keep `stickyNotes` present for every section.
- Omit sticky-note `position` unless explicit coordinates are requested (auto-layout handles placement).
- Default sticky-note `size` to `80`; only reduce when needed to prevent overflow.

## Metadata defaults

For APIOps Cycles examples:

- `source`: `APIOps Cycles method`
- `license`: `CC-BY-SA 4.0`
- `website`: `www.apiopscycles.com`
- `authors`: content author(s)
- `date`: ISO-8601 creation timestamp

## Content and colors

- Write concise notes that directly answer each section description.
- Keep language aligned with selected locale.

Default theme intent:

- Tasks/journey/actions: blue
- Benefits/positive outcomes: green
- Risks/negative outcomes: pink
- Neutral/supporting items: yellow

## Filenames

Use `<usecase>_<templateId>_<locale>.json`.

Example: `example_apiBusinessModelCanvas_en.json`.

## Validation commands

Use `references/canvas-json-checks.md` for:

- template + section lookups,
- schema validation,
- section coverage validation,
- optional position-field checks.
