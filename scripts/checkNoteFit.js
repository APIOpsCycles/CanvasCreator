#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const defaultStyles = require('../src/defaultStyles');
const { buildContent } = require('./export');

const CHAR_WIDTH = 5.4;

function parseArgs(argv) {
  const res = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      res[key] = next;
      i++;
    } else {
      res[key] = true;
    }
  }
  return res;
}

function printUsage() {
  console.log(`Usage: node scripts/checkNoteFit.js [options]

Options:
  --import <file>       import JSON content file to validate
  --canvas <id>         canvas id (defaults to templateId from import file)
  --locale <code>       locale override (defaults to locale from import file)
  --help                show this help text`);
}

function wrapTextForNote(text, noteSize, styles = defaultStyles) {
  const maxWidth = noteSize - styles.padding;
  const normalized = text.replace(/\n{2,}/g, '\n');
  const words = normalized.split(' ');
  const lines = [];
  let line = '';

  for (const word of words) {
    const test = line + word + ' ';
    if (test.length * 6 > maxWidth) {
      if (line) lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test;
    }
  }

  if (line) lines.push(line.trim());
  return lines;
}

function analyzeNote(content, sectionId, note, noteIndex, styles = defaultStyles) {
  const size = note.size || styles.stickyNoteSize;
  const lines = wrapTextForNote(note.content, size, styles);
  const lineHeight = styles.fontSize + 2;
  const textTopOffset = styles.fontSize + styles.padding / 2;
  const estimatedBottom = textTopOffset + Math.max(0, lines.length - 1) * lineHeight + styles.fontSize;
  const verticalOverflow = estimatedBottom > size - styles.padding / 2;
  const horizontalOverflow = lines.some((line) => line.length * CHAR_WIDTH > size - styles.padding);

  if (!verticalOverflow && !horizontalOverflow) {
    return null;
  }

  return {
    sectionId,
    noteIndex,
    content: note.content,
    lines,
    size,
    overflow: {
      vertical: verticalOverflow,
      horizontal: horizontalOverflow,
    },
  };
}

function analyzeContentFit(content, styles = defaultStyles) {
  const issues = [];

  for (const section of content.sections) {
    section.stickyNotes.forEach((note, index) => {
      const issue = analyzeNote(content, section.sectionId, note, index, styles);
      if (issue) issues.push(issue);
    });
  }

  return issues;
}

function loadImportedContent(importPath) {
  return JSON.parse(fs.readFileSync(importPath, 'utf8'));
}

function formatIssue(issue) {
  const kinds = [];
  if (issue.overflow.horizontal) kinds.push('horizontal');
  if (issue.overflow.vertical) kinds.push('vertical');
  return `- ${issue.sectionId}[${issue.noteIndex}]: ${kinds.join('+')} overflow :: ${issue.content}`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return 0;
  }

  if (!args.import) {
    printUsage();
    return 1;
  }

  const canvasData = require('apiops-cycles-method-data/canvasData.json');
  const imported = loadImportedContent(path.resolve(args.import));
  const canvasId = args.canvas || imported.templateId;
  const locale = args.locale || imported.locale || defaultStyles.defaultLocale;

  if (!canvasId || !canvasData[canvasId]) {
    console.error(`Unknown canvas id: ${canvasId}`);
    return 1;
  }

  const content = buildContent(canvasData, canvasId, locale, false, imported, true);
  const issues = analyzeContentFit(content);

  if (issues.length === 0) {
    console.log(`No note-fit issues found in ${args.import}`);
    return 0;
  }

  console.error(`Found ${issues.length} note-fit issue(s) in ${args.import}`);
  for (const issue of issues) {
    console.error(formatIssue(issue));
  }
  return 1;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  analyzeContentFit,
  analyzeNote,
  wrapTextForNote,
};
