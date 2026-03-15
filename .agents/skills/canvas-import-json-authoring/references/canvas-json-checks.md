# Canvas JSON checks and lookups

Use these commands to build and validate importable canvas JSON.

## 1) List valid template IDs

```bash
jq -r 'keys[]' node_modules/apiops-cycles-method-data/src/data/canvas/canvasData.json
```

## 2) List required section IDs for one template

```bash
TEMPLATE_ID="apiBusinessModelCanvas"
jq -r --arg t "$TEMPLATE_ID" '.[$t].sections[].id' node_modules/apiops-cycles-method-data/src/data/canvas/canvasData.json
```

## 3) Read locale-specific section descriptions used to guide sticky-note content

```bash
LOCALE="en"
TEMPLATE_ID="apiBusinessModelCanvas"
jq -r --arg l "$LOCALE" --arg t "$TEMPLATE_ID" '.[$l][$t].sections | to_entries[] | "\(.key): \(.value.description)"' node_modules/apiops-cycles-method-data/src/data/canvas/localizedData.json
```

## 4) Validate JSON shape with schema

Schema file:

- `skills/canvas-import-json-authoring/references/import-export-template.schema.json`

Validation command:

```bash
FILE="examples/Canvas_apiBusinessModelCanvas_en.json"
npx --yes ajv-cli validate -s skills/canvas-import-json-authoring/references/import-export-template.schema.json -d "$FILE" --spec=draft2020
```

## 5) Verify generated JSON uses template sections only (and in expected order)

```bash
FILE="examples/Canvas_apiBusinessModelCanvas_en.json"
jq -r '.sections[].sectionId' "$FILE" > /tmp/actual_sections.txt
jq -r --arg t "$(jq -r '.templateId' "$FILE")" '.[$t].sections[].id' node_modules/apiops-cycles-method-data/src/data/canvas/canvasData.json > /tmp/expected_sections.txt
diff -u /tmp/expected_sections.txt /tmp/actual_sections.txt
```

No diff means section coverage/order matches template.

## 6) Verify positions are omitted (when auto-layout is desired)

```bash
FILE="path/to/generated.json"
jq '.sections[].stickyNotes[] | has("position")' "$FILE"
```

All values should be `false` when positions are intentionally omitted.
