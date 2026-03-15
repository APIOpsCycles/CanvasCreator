# Canvas JSON checks and lookups

Use these commands to build and validate importable canvas JSON.

Prefer PowerShell or Node-based checks when working on Windows, since `jq`, `diff`, or shell temp-path examples may not be available.

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

PowerShell alternative:

```powershell
$file = "examples/Canvas_apiBusinessModelCanvas_en.json"
$json = Get-Content $file | ConvertFrom-Json
$actual = $json.sections.sectionId
$expected = (Get-Content "node_modules/apiops-cycles-method-data/src/data/canvas/canvasData.json" | ConvertFrom-Json).($json.templateId).sections.id
Compare-Object -ReferenceObject $expected -DifferenceObject $actual
```

No output means section coverage/order matches template.

## 6) Verify positions are omitted (when auto-layout is desired)

```bash
FILE="path/to/generated.json"
jq '.sections[].stickyNotes[] | has("position")' "$FILE"
```

All values should be `false` when positions are intentionally omitted.

PowerShell alternative:

```powershell
$file = "examples/Canvas_apiBusinessModelCanvas_en.json"
$json = Get-Content $file | ConvertFrom-Json
$json.sections.stickyNotes | ForEach-Object { $_.PSObject.Properties.Name -contains "position" }
```

## 7) Run the automated fit check

```bash
node scripts/checkNoteFit.js --import ./examples/Canvas_apiBusinessModelCanvas_en.json
```

Exit code meanings:

- `0`: no fit issues found
- `1`: one or more notes have horizontal or vertical overflow risk

## 8) Render the import file and inspect sticky-note fit

Render SVG first because it does not require the optional PNG dependency:

```bash
node scripts/export.js --canvas apiBusinessModelCanvas --locale en --format svg --import ./examples/Canvas_apiBusinessModelCanvas_en.json
```

Expected output:

- `export/Canvas_apiBusinessModelCanvas_en.svg`

If the environment has the optional `canvas` dependency, also render PNG:

```bash
node scripts/export.js --canvas apiBusinessModelCanvas --locale en --format png --import ./examples/Canvas_apiBusinessModelCanvas_en.json
```

When inspecting the render, check both:

- vertical fit: text stays inside the note height
- horizontal fit: no long words or lines spill past the note width

## 9) What to do when note text does not fit

Use this order:

1. Shorten the sticky-note wording while preserving the meaning.
2. Shorten or replace long compounds, labels, or unbreakable words that overflow horizontally.
3. If the wording is already concise, increase only the overflowing note's `size`.
4. Only shrink notes when the section contains so many notes that larger/default notes cannot fit in the available area.

Do not shrink all notes as a first response to overflow in one or two notes.
