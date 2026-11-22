#!/usr/bin/env node
// Copies what the teacher's script needs from the page into Code.gs, so they
// always match: the recorded answers with their highest scores (ANSWERS, from
// js/format.js) and the versions, one per article (ARTICLES, from
// js/versions.js). Then split the script again:
//
//   node scripts/exam-gs.mjs && node scripts/split-gs.mjs   (npm run gs)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RESPONSES } from '../js/format.js';
import { VERSIONS } from '../js/versions.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'google-apps-script', 'Code.gs');

// id, label and highest score of each recorded answer.
export const answerRows = () => RESPONSES.map((r) => [r.id, r.label, r.max]);
// The article of each version, as the «Versions» tab names it.
export const articleNames = () => VERSIONS.map((v) => `${v.article.title} (${v.article.outlet}, ${v.article.date})`);

export function examBlock() {
  return [
    '/* exam:start */',
    '/* The recorded answers (id, label, highest score) and the article of each version.',
    '   Made from js/format.js and js/versions.js: npm run gs. */',
    `const ANSWERS = [\n${answerRows().map((row) => `  ${JSON.stringify(row)},`).join('\n')}\n];`,
    `const ARTICLES = [\n${articleNames().map((a) => `  ${JSON.stringify(a)},`).join('\n')}\n];`,
    '/* exam:end */',
  ].join('\n');
}

export const EXAM_RE = /\/\* exam:start \*\/[\s\S]*?\/\* exam:end \*\//;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const code = readFileSync(SRC, 'utf8');
  if (!EXAM_RE.test(code)) throw new Error('the exam block (exam:start … exam:end) is not in Code.gs');
  // A function as the replacement: the text could have "$", which replace() would read as a pattern.
  writeFileSync(SRC, code.replace(EXAM_RE, () => examBlock()));
  console.log(`Code.gs: ${answerRows().length} answers, ${VERSIONS.length} versions`);
}
