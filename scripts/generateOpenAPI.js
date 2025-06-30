const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const spec = `openapi: 3.1.0
info:
  title: Canvas Creator API
  version: ${pkg.version}
paths:
  /api/canvases/{id}/{locale}:
    get:
      summary: Get canvas
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
        - in: path
          name: locale
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Canvas JSON
          content:
            application/json:
              example:
                templateId: exampleCanvas
                locale: en-US
                metadata: {}
                sections: []
    post:
      summary: Create or update canvas
      requestBody:
        required: true
        content:
          application/json:
            example:
              templateId: exampleCanvas
              locale: en-US
              sections: []
      responses:
        '200':
          description: Saved canvas
          content:
            application/json:
              example:
                templateId: exampleCanvas
                locale: en-US
                sections: []
  /api/canvases/{id}/{locale}/metadata:
    get:
      summary: Get canvas metadata
      responses:
        '200':
          description: Metadata
          content:
            application/json:
              example:
                source: APIOps
    put:
      summary: Update canvas metadata
      requestBody:
        required: true
        content:
          application/json:
            example:
              source: MySource
              license: CC-BY-SA 4.0
      responses:
        '200':
          description: Updated metadata
  /api/canvases/{id}/{locale}/stickynotes:
    get:
      summary: List sticky notes
      responses:
        '200':
          description: Array of notes
          content:
            application/json:
              example:
                - content: Hello
                  color: '#FFF399'
    post:
      summary: Add sticky note
      requestBody:
        required: true
        content:
          application/json:
            example:
              sectionId: sec1
              content: Example
              position:
                x: 10
                y: 20
              color: '#FFF399'
      responses:
        '201':
          description: Created note
  /api/canvases/{id}/{locale}/stickynotes/{index}:
    put:
      summary: Update sticky note
      requestBody:
        required: true
        content:
          application/json:
            example:
              content: Updated
              color: '#FFFFFF'
      responses:
        '200':
          description: Updated note
    delete:
      summary: Delete sticky note
      responses:
        '204':
          description: Deleted
  /api/canvases/{id}/{locale}/export/json:
    get:
      summary: Download saved canvas as JSON
      responses:
        '200':
          description: Canvas JSON file
          headers:
            Content-Disposition:
              schema:
                type: string
              description: attachment filename
        '404':
          description: Canvas not found
  /api/canvases/{id}/{locale}/export/svg:
    get:
      summary: Download saved canvas SVG
      responses:
        '200':
          description: SVG image
          content:
            image/svg+xml:
              schema:
                type: string
                format: binary
          headers:
            Content-Disposition:
              schema:
                type: string
              description: attachment filename
        '404':
          description: SVG not found
`;

const outDir = path.join(__dirname, '../openapi');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'openapi.yaml'), spec);
console.log('OpenAPI spec generated at openapi/openapi.yaml');
