---
name: export-cli-usage-patterns
description: Create, review, or troubleshoot CanvasCreator export CLI usage for scripts/export.js, including argument patterns, output-file expectations, and format-specific behavior for json/svg/pdf/png exports.
---

# Export CLI Usage Patterns (CanvasCreator)

Use this skill to produce accurate command examples, expected output descriptions, and troubleshooting guidance for `scripts/export.js` and the `canvascreator-export` binary.

When the task is specifically about note-fit validation, pair this skill with `scripts/checkNoteFit.js`: use the fit-check script for automated pass/fail and SVG export for visual confirmation.

## Ground truth files

- `scripts/export.js` (CLI flags, defaults, output logic)
- `README.md` section "Command Line Export" (public-facing usage)
- `tests/export.test.js` (expected helper behavior)
- `package.json` (`bin.canvascreator-export`, `scripts.export`, optional dependency notes)

## Generate canonical commands

Prefer these command shapes when documenting or demonstrating usage:

```bash
# from an installed package
npx canvascreator-export --locale en --format svg --all --prefix My

# from a local clone
npm run export -- --locale en --format svg --all --prefix My

# single canvas
npm run export -- --canvas apiBusinessModelCanvas --locale en --format json

# custom output directory
npm run export -- --canvas apiBusinessModelCanvas --format pdf --outdir ./artifacts

# import existing content JSON and render image output
npm run export -- --canvas apiBusinessModelCanvas --import ./examples/Canvas_apiBusinessModelCanvas_en.json --format png

# SVG-first verification when checking text fit
node scripts/export.js --canvas apiBusinessModelCanvas --import ./examples/Canvas_apiBusinessModelCanvas_en.json --format svg
```

## Preserve option semantics

Document options exactly as implemented:

- `--locale <code>`: default `en`
- `--format <json|svg|pdf|png>`: default `json`
- `--prefix <name>`: default `Canvas`
- `--all`: export every canvas ID from `apiops-cycles-method-data/canvasData.json`
- `--canvas <id>`: export one canvas ID
- `--import <file>`: import JSON content keyed by `templateId`
- `--outdir <folder>`: default `export` (resolved relative to current working directory)
- `--help`: print usage

Important behavior:

- Require either `--all` or `--canvas`; otherwise print usage and exit.
- Print usage and exit on unknown `--flag`.
- Write outputs as `{prefix}_{canvasId}_{locale}.{ext}`.

## State expected outputs clearly

When asked for expected results, provide both location and naming pattern:

- Default location: `./export/`
- Default file prefix: `Canvas`
- Pattern: `export/{prefix}_{canvasId}_{locale}.ext`

Examples:

- `export/Canvas_apiBusinessModelCanvas_en.json`
- `export/My_apiBusinessModelCanvas_en.svg`
- `artifacts/My_apiBusinessModelCanvas_en.pdf` (with `--outdir artifacts`)

Format-specific expectations:

- `json`: write JSON content from `exportJSON(content)`.
- `svg`: write SVG markup.
- `pdf`: always generate SVG first, then convert to PDF via `pdfkit` + `svg-to-pdfkit`.
- `png`: always generate SVG first, then rasterize with optional `canvas` module.

## Capture placeholder vs positioned-note behavior

When explaining JSON export behavior:

- If `--format json` and no matching `--import` file exists for the canvas ID, create one placeholder sticky note per section with content `Placeholder`.
- Placeholder JSON omits sticky-note coordinates.
- For imported non-JSON outputs, distribute any missing positions before rendering so UI-style auto-layout still works.
- Prefer `svg` when checking whether note text fits, because `png` depends on the optional `canvas` package.

Use this wording if needed: "JSON export defaults to scaffold content; image/document formats default to render-ready positioned content."

## Troubleshooting checklist

When outputs fail, check in this order:

1. Confirm `--canvas` value exists in `canvasData.json` (or use `--all`).
2. Confirm dependencies are installed (`apiops-cycles-method-data`, `jsdom`, `pdfkit`, `svg-to-pdfkit`).
3. For PNG issues, confirm optional dependency `canvas@^3` is installed.
4. Confirm `--import` JSON includes `templateId` matching requested canvas.
5. Confirm output directory permissions and path.

Use concise error framing:

- "PDF export requires `pdfkit` and `svg-to-pdfkit`."
- "PNG export requires optional dependency `canvas`."

## Documentation style rules

- Show exactly one minimal command per use case.
- Always include one expected filename example.
- Prefer `apiBusinessModelCanvas` as canonical sample ID.
- Keep examples synchronized with defaults in `scripts/export.js`.
- Avoid inventing unsupported flags or behavior.
