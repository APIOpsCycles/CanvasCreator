const { sanitizeInput } = require('./canvasCreatorUI.js');

function createStickyNote(contentData, sectionId, text, position = { x: 0, y: 0 }, color = '#FFF399') {
  const section = contentData.sections.find(s => s.sectionId === sectionId);
  if (!section) {
    throw new Error('Section not found');
  }
  const note = { content: sanitizeInput(text), position, size: contentData.stickyNoteSize || 80, color };
  section.stickyNotes.push(note);
  return note;
}

function editStickyNote(note, newContent) {
  note.content = sanitizeInput(newContent);
  return note;
}

function exportJSON(contentData) {
  const exportData = {
    templateId: contentData.templateId,
    locale: contentData.locale,
    metadata: contentData.metadata,
    sections: contentData.sections.map(section => ({
      sectionId: section.sectionId,
      stickyNotes: section.stickyNotes.map(n => ({
        content: n.content,
        position: n.position,
        size: n.size,
        color: n.color,
      }))
    }))
  };
  return JSON.stringify(exportData, null, 2);
}

function importJSON(json) {
  return JSON.parse(json);
}

function switchLocale(contentData, locale) {
  contentData.locale = locale;
}

module.exports = {
  createStickyNote,
  editStickyNote,
  exportJSON,
  importJSON,
  switchLocale,
};

