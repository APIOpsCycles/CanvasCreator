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
7. Verify the file imports and that all texts fit inside sticky notes by running `scripts/checkNoteFit.js`. Use SVG rendering from the export-cli-usage-patterns skill as a visual confirmation step.

## Required authoring rules

- Include `templateId`, `metadata`, and `sections`.
- Use every section in the selected template; do not add unknown sections.
- Keep `stickyNotes` present for every section.
- Omit sticky-note `position` unless explicit coordinates are requested (auto-layout handles placement).
- Default sticky-note `size` to `80`.
- If text does not fit, first shorten the wording while preserving meaning.
- If wording is already concise and a specific note still overflows, increase that note's `size` before considering smaller notes.
- Reduce note sizes only when section density is so high that notes cannot fit into the section at the default size.

## Template-specific rules

### `apiBusinessModelCanvas`

- In the `apiValueProposition` section, place one sticky note first that names the API or API family being assessed.
- Then add the concise value proposition notes for that named API.
- Use this naming note even when the API name is provisional, because the rest of the canvas should clearly refer to one concrete API or API family rather than an unnamed capability.

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
- Expect some locales to need shorter wording than English to fit the same canvas.
- Treat "render and inspect fit" as a required quality pass, not an optional polish step.
- Check both vertical fit and horizontal fit. Long compounds, labels, and unbreakable words can overflow even when line count looks acceptable.

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
- optional position-field checks,
- render-and-fit checks.
