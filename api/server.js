const http = require('http');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load default canvas templates and localized data from the main data directory
const templatePath = path.join(__dirname, '../data/canvasData.json');
const localePath = path.join(__dirname, '../data/localizedData.json');
let templates = {};
let localized = {};
try {
  templates = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  localized = JSON.parse(fs.readFileSync(localePath, 'utf8'));
} catch (err) {
  console.error('Failed to load base data:', err);
}

function send(res, status, data, headers = {}) {
  res.writeHead(status, Object.assign({'Content-Type': 'application/json'}, headers));
  res.end(JSON.stringify(data));
}

function createDefaultCanvas(id, locale) {
  const tpl = templates[id];
  if (!tpl) return null;
  const canvas = {
    templateId: tpl.id,
    locale,
    metadata: Object.assign({}, tpl.metadata),
    sections: tpl.sections.map(sec => ({ sectionId: sec.id, stickyNotes: [] }))
  };
  return canvas;
}

function loadCanvas(id, locale) {
  const file = path.join(dataDir, `${id}_${locale}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return createDefaultCanvas(id, locale);
}

function saveCanvas(id, locale, canvas) {
  const file = path.join(dataDir, `${id}_${locale}.json`);
  fs.writeFileSync(file, JSON.stringify(canvas, null, 2));
}

async function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        resolve(data);
      } catch (err) { reject(err); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts[0] === 'api' && parts[1] === 'openapi') {
    const specPath = path.join(__dirname, '../openapi/openapi.yaml');
    res.writeHead(200, { 'Content-Type': 'application/yaml' });
    res.end(fs.readFileSync(specPath, 'utf8'));
    return;
  }

  if (parts[0] !== 'api' || parts[1] !== 'canvases') {
    res.writeHead(404); res.end(); return;
  }

  const id = parts[2];
  const locale = parts[3];
  if (!id || !locale) { res.writeHead(404); res.end(); return; }
  const canvas = loadCanvas(id, locale);
  if (!canvas) { res.writeHead(404); res.end(); return; }

  // /api/canvases/:id/:locale
  if (parts.length === 4) {
    if (req.method === 'GET') { send(res, 200, canvas); return; }
    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const body = await parseJSON(req);
        if (body.svg) {
          const svgFile = path.join(dataDir, `${id}_${locale}.svg`);
          fs.writeFileSync(svgFile, body.svg);
          delete body.svg;
        }
        Object.assign(canvas, body);
        saveCanvas(id, locale, canvas);
        send(res, 200, canvas);
      } catch (e) { send(res, 400, { error: 'Invalid JSON' }); }
      return;
    }
  }

  // /api/canvases/:id/:locale/metadata
  if (parts[4] === 'metadata') {
    if (req.method === 'GET') { send(res, 200, canvas.metadata || {}); return; }
    if (req.method === 'PUT') {
      try {
        const body = await parseJSON(req);
        canvas.metadata = body;
        saveCanvas(id, locale, canvas);
        send(res, 200, canvas.metadata);
      } catch (e) { send(res, 400, { error: 'Invalid JSON' }); }
      return;
    }
  }

  // /api/canvases/:id/:locale/stickynotes
  if (parts[4] === 'stickynotes') {
    canvas.sections = canvas.sections || [];
    if (req.method === 'GET' && parts.length === 5) {
      const notes = canvas.sections.flatMap(s => s.stickyNotes || []);
      send(res, 200, notes);
      return;
    }
    if (parts.length === 5 && req.method === 'POST') {
      try {
        const body = await parseJSON(req);
        const sectionId = body.sectionId;
        if (!sectionId) { send(res, 400, { error: 'sectionId required' }); return; }
        let section = canvas.sections.find(s => s.sectionId === sectionId);
        if (!section) { section = { sectionId, stickyNotes: [] }; canvas.sections.push(section); }
        const note = {
          content: body.content || '',
          position: body.position || { x: 0, y: 0 },
          size: body.size || 80,
          color: body.color || '#FFF399'
        };
        section.stickyNotes.push(note);
        saveCanvas(id, locale, canvas);
        send(res, 201, note);
      } catch (e) { send(res, 400, { error: 'Invalid JSON' }); }
      return;
    }
    if (parts.length === 6) {
      const noteIndex = parseInt(parts[5], 10);
      const allNotes = canvas.sections.flatMap(s => s.stickyNotes || []);
      const note = allNotes[noteIndex];
      if (!note) { send(res, 404, { error: 'Note not found' }); return; }
      if (req.method === 'PUT') {
        try {
          const body = await parseJSON(req);
          Object.assign(note, body);
          saveCanvas(id, locale, canvas);
          send(res, 200, note);
        } catch (e) { send(res, 400, { error: 'Invalid JSON' }); }
        return;
      }
      if (req.method === 'DELETE') {
        for (const sec of canvas.sections) {
          const idx = (sec.stickyNotes || []).indexOf(note);
          if (idx !== -1) sec.stickyNotes.splice(idx, 1);
        }
        saveCanvas(id, locale, canvas);
        send(res, 204, {});
        return;
      }
    }
  }

  // /api/canvases/:id/:locale/export/json
  if (parts[4] === 'export' && parts[5] === 'json') {
    if (req.method === 'GET') {
      const file = path.join(dataDir, `${id}_${locale}.json`);
      if (!fs.existsSync(file)) {
        send(res, 404, { error: 'Canvas not found' });
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${id}_${locale}.json"`
      });
      res.end(fs.readFileSync(file));
      return;
    }
  }

  // /api/canvases/:id/:locale/export/svg
  if (parts[4] === 'export' && parts[5] === 'svg') {
    if (req.method === 'GET') {
      const file = path.join(dataDir, `${id}_${locale}.svg`);
      if (!fs.existsSync(file)) {
        send(res, 404, { error: 'SVG not found' });
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${id}_${locale}.svg"`
      });
      res.end(fs.readFileSync(file));
      return;
    }
  }

  res.writeHead(404); res.end();
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Canvas Creator API listening on port ${port}`);
});
