# CanvasCreator Skills

CanvasCreator ships repo-local Codex skills so they remain discoverable when the package is installed as a Node module.

## Included skills

- `canvas-import-json-authoring`
  Create or review importable CanvasCreator JSON files with schema-first validation, template section coverage checks, locale-aware note authoring, and note-fit verification guidance.

- `common-contributor-workflow`
  Follow the standard CanvasCreator contribution flow for scoping, implementation, validation, docs hygiene, and PR preparation.

- `export-cli-usage-patterns`
  Document and troubleshoot `scripts/export.js` and `canvascreator-export`, including supported flags, output naming, and format-specific behavior.

## Package layout

The bundled skill definitions live under `.agents/skills/`. Each skill includes a `SKILL.md` file with the workflow and task-specific guidance.

## Using the packaged skills

If your agent runtime supports repository or package-scoped skills, point it at the installed `canvascreator` package and load the relevant `SKILL.md` from `.agents/skills/<skill-name>/SKILL.md`.
