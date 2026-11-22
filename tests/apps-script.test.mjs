import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { splitCode, stripMarkers, MAX_LINES } from '../scripts/split-gs.mjs';
import { answerRows, articleNames } from '../scripts/exam-gs.mjs';
import { RESPONSES, TOTAL_POINTS } from '../js/format.js';
import { VERSIONS } from '../js/versions.js';
import { SCRIPT_VERSION, SCRIPT_APP } from '../js/config.js';

const DIR = new URL('../google-apps-script/', import.meta.url);
const code = readFileSync(new URL('Code.gs', DIR), 'utf8');
const ROOT = 'Speaking Test — Recordings';

// A small stand-in for the Google services the script uses.
function makeEnv(src = code) {
  const sheets = new Map();
  const makeSheet = (name) => {
    const data = [];
    const formulas = new Map(); // "r,c" → formula
    const rules = new Map(); // "r,c" → the score rule
    const sheet = {
      name,
      data,
      formulas,
      rules,
      getLastRow: () => data.length,
      getLastColumn: () => Math.max(0, ...data.map((r) => r.length)),
      appendRow: (row) => data.push([...row]),
      setFrozenRows: () => {},
      getRange: (r, c, nr = 1, nc = 1) => ({
        setValues: (vals) => {
          vals.forEach((row, i) => row.forEach((v, j) => ((data[r - 1 + i] ??= [])[c - 1 + j] = v)));
          return { setFontWeight: () => {} };
        },
        setValue: (v) => ((data[r - 1] ??= [])[c - 1] = v),
        setFormula: (f) => formulas.set(`${r},${c}`, f),
        setDataValidation: (rule) => rules.set(`${r},${c}`, rule),
        clearContent: () => data.splice(r - 1, nr),
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => data[r - 1 + i]?.[c - 1 + j] ?? '')),
        getFormulas: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => formulas.get(`${r + i},${c + j}`) ?? '')),
        setFontWeight: () => {},
      }),
    };
    return sheet;
  };
  const folders = new Map();
  const files = [];
  const props = new Map();
  let made = 0; // how many times a folder was created at the top of the Drive
  const makeFolder = (path) => {
    if (folders.has(path)) return folders.get(path);
    const f = {
      path,
      trashed: false,
      getId: () => `folder:${path}`,
      isTrashed: () => f.trashed,
      getUrl: () => `https://drive/${encodeURIComponent(path)}`,
      getFoldersByName: (name) => iter(folders.has(`${path}/${name}`) ? [folders.get(`${path}/${name}`)] : []),
      createFolder: (name) => makeFolder(`${path}/${name}`),
      createFile: (blob) => {
        const n = files.length;
        const file = { blob, folder: path, getUrl: () => `https://drive/file/${n}`, getId: () => `id${n}`, setDescription: (d) => (file.description = d) };
        files.push(file);
        return file;
      },
    };
    folders.set(path, f);
    return f;
  };
  const iter = (items) => {
    let i = 0;
    return { hasNext: () => i < items.length, next: () => items[i++] };
  };
  const ctx = {
    console,
    Logger: { log: () => {} },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getName: () => 'Speaking Test 2026',
        getSheetByName: (n) => sheets.get(n) || null,
        insertSheet: (n) => {
          const s = makeSheet(n);
          sheets.set(n, s);
          return s;
        },
      }),
      newDataValidation: () => {
        const rule = {};
        const b = {
          requireNumberBetween: (min, max) => ((rule.min = min), (rule.max = max), b),
          setAllowInvalid: (allow) => ((rule.allowInvalid = allow), b),
          setHelpText: (text) => ((rule.help = text), b),
          build: () => rule,
        };
        return b;
      },
    },
    DriveApp: {
      getFoldersByName: (name) => iter(folders.has(name) && !folders.get(name).trashed ? [folders.get(name)] : []),
      createFolder: (name) => (made++, makeFolder(name)),
      getFolderById: (id) => {
        const f = [...folders.values()].find((x) => x.getId() === id);
        if (!f) throw new Error('No item with the given ID could be found.');
        return f;
      },
    },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: (k) => props.get(k) ?? null, setProperty: (k, v) => props.set(k, v) }),
    },
    Utilities: {
      base64Decode: (s) => [...Buffer.from(s, 'base64')],
      newBlob: (bytes, type, name) => ({ bytes, type, name }),
    },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (body) => ({ body, setMimeType() { return this; } }),
    },
  };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  const post = (payload) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(payload) } }).body);
  return { ctx, post, sheets, files, folders, props, madeAtTop: () => made };
}

const plain = (x) => JSON.parse(JSON.stringify(x));
const who = { attempt: 'mg1abc-x7y8z9', student: 'Ana Pérez', version: 2 };
const audio = Buffer.from('fake webm').toString('base64');

test('setup makes the sheets, the rubric and the Drive folder', () => {
  const { ctx, sheets, folders } = makeEnv();
  assert.match(ctx.setup(), /Listo/);
  assert.deepEqual([...sheets.keys()], ['Exams', 'Responses', 'Versions', 'Rubric']);
  assert.deepEqual(sheets.get('Exams').data[0], [
    'Started', 'Student', 'Version', 'Status', 'Answers', 'Finished', 'Left the page', 'Restarts', `Total (of ${TOTAL_POINTS})`, 'Folder', 'Attempt',
  ]);
  assert.deepEqual(sheets.get('Versions').data[0], ['Given', 'Student', 'Version', 'Article']);
  // The rubric: a row for each score from 5 to 0, a column for each part; Questions 1–10 stop at 3.
  const rubric = sheets.get('Rubric').data;
  assert.deepEqual(rubric.map((r) => r[0]), ['Score', '5', '4', '3', '2', '1', '0']);
  assert.deepEqual(rubric[0], [
    'Score', 'Questions 1–2 · read aloud (0–3)', 'Questions 3–4 · pictures (0–3)', 'Questions 5–7 (0–3)',
    'Questions 8–10 · graph (0–3)', 'Question 11 · opinion (0–5)',
  ]);
  assert.deepEqual(rubric[1].slice(1, 5), ['—', '—', '—', '—']);
  assert.ok(rubric.slice(1).every((r) => r.length === 6 && r.every((cell) => String(cell).length > 0)));
  assert.ok(!JSON.stringify(rubric).includes('solution'), 'no Question 10 «propose a solution»');
  // Running setup again rewrites the rubric instead of adding rows twice.
  ctx.setup();
  assert.equal(sheets.get('Rubric').data.length, 7);
  assert.ok(folders.has(ROOT));
  const info = JSON.parse(ctx.doGet().body);
  assert.deepEqual(info, { ok: true, app: 'Speaking Test', sheet: 'Speaking Test 2026', version: 2, versions: 14 });
  assert.equal(info.app, SCRIPT_APP, 'the Teacher page knows this script by its name');
  assert.ok(info.version >= SCRIPT_VERSION, 'the page works with this script');
});

test('the exam in the script is the one on the page', () => {
  const { ctx } = makeEnv();
  assert.deepEqual(plain(vm.runInContext('ANSWERS', ctx)), answerRows(), 'run: npm run gs');
  assert.deepEqual(plain(vm.runInContext('ARTICLES', ctx)), articleNames(), 'run: npm run gs');
  assert.deepEqual(plain(vm.runInContext('QUESTIONS', ctx)), RESPONSES.map((r) => r.id));
  assert.equal(vm.runInContext('TOTAL', ctx), TOTAL_POINTS);
  assert.equal(vm.runInContext('VERSION_COUNT', ctx), VERSIONS.length);
});

test('fourteen students get fourteen different versions; a fifteenth is told to ask the teacher', () => {
  const { post, sheets } = makeEnv();
  const names = Array.from({ length: VERSIONS.length }, (_, i) => `Student ${i + 1}`);
  const got = names.map((student) => post({ type: 'version', student }).version);
  assert.deepEqual([...got].sort((a, b) => a - b), VERSIONS.map((v) => v.n), 'each version once');
  const rows = sheets.get('Versions').data.slice(1);
  assert.deepEqual(rows.map((r) => [r[1], r[2]]), names.map((n, i) => [n, got[i]]));
  assert.deepEqual(rows.map((r) => r[3]), got.map((n) => articleNames()[n - 1]), 'the article of each version');
  const res = post({ type: 'version', student: 'Student 15' });
  assert.equal(res.ok, false);
  assert.match(res.error, /All 14 versions have been given out\. Please ask your teacher\./);
});

test('the same student always gets the same version, however the name is written', () => {
  const { post, sheets } = makeEnv();
  const first = post({ type: 'version', student: 'Ana Pérez' }).version;
  for (const again of ['Ana Pérez', 'ana perez', ' ANA  PÉREZ ']) {
    assert.deepEqual(post({ type: 'version', student: again }), { ok: true, version: first, again: true });
  }
  assert.equal(sheets.get('Versions').data.length, 2, 'written down once');
});

test('a version link gives its version; a freed version can be given again', () => {
  const { post, sheets } = makeEnv();
  assert.deepEqual(post({ type: 'version', student: 'Luis', asked: 5 }), { ok: true, version: 5 });
  // Nobody else gets version 5 by chance.
  for (let i = 0; i < 12; i++) assert.notEqual(post({ type: 'version', student: `Other ${i}` }).version, 5);
  const left = post({ type: 'version', student: 'Last one' }).version;
  assert.ok(left >= 1 && left <= 14 && left !== 5);
  assert.equal(post({ type: 'version', student: 'One too many' }).ok, false);
  // The teacher deletes a row on the «Versions» tab: that version is free again.
  sheets.get('Versions').data.splice(1, 1);
  assert.equal(post({ type: 'version', student: 'Late student' }).version, 5);
  // A version that doesn't exist is not asked for: the student gets a free one.
  const { post: post2 } = makeEnv();
  const n = post2({ type: 'version', student: 'Mia', asked: 99 }).version;
  assert.ok(n >= 1 && n <= 14);
  assert.match(post2({ type: 'version', student: '  ' }).error, /Falta el nombre/);
});

test('an exam: start, eleven answers in the student’s folder, finish', () => {
  const { post, sheets, files } = makeEnv();
  assert.equal(post({ type: 'start', ...who, startedAt: '2026-11-25T15:00:00Z' }).ok, true);
  assert.equal(post({ type: 'start', ...who }).duplicate, true);
  for (const r of RESPONSES) {
    const res = post({ type: 'recording', ...who, qid: r.id, label: r.label, prompt: `Prompt of ${r.id}`, durationSec: 44.6, mime: 'audio/webm;codecs=opus', audio, recordedAt: '2026-11-25T15:05:00Z' });
    assert.equal(res.ok, true, res.error);
    assert.match(res.url, /^https:\/\/drive\/file\//);
  }
  // The same answer sent twice (the first reply got lost) is saved once.
  const again = post({ type: 'recording', ...who, qid: 'q8', mime: 'audio/webm', audio });
  assert.equal(again.duplicate, true);
  assert.equal(again.url, 'https://drive/file/7');
  assert.equal(files.length, 11);
  assert.equal(files[0].folder, `${ROOT}/Ana Pérez · V2 · x7y8z9`);
  assert.deepEqual(files.map((f) => f.blob.name), RESPONSES.map((r) => `${r.label}.webm`));
  assert.equal(files[2].description, 'Prompt of q3');
  const responses = sheets.get('Responses');
  assert.equal(responses.data.length, 12);
  assert.deepEqual(responses.data[1].slice(1, 6), ['Ana Pérez', 2, 'Question 1', 'Prompt of q1', 45]);
  assert.deepEqual(responses.data.slice(1).map((row) => row[8]), [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5], 'the highest score of each answer');
  assert.match(responses.formulas.get('2,7'), /^=HYPERLINK\("https:\/\/drive\/file\/0","▶ Listen"\)$/);
  assert.deepEqual(plain(responses.rules.get('2,8')), { min: 0, max: 3, allowInvalid: false, help: 'A number from 0 to 3.' });
  assert.equal(responses.rules.get('11,8').max, 3);
  assert.equal(responses.rules.get('12,8').max, 5);

  assert.equal(post({ type: 'finish', ...who, leftPage: 1, resumed: 0, finishedAt: '2026-11-25T15:25:00Z' }).ok, true);
  const exam = sheets.get('Exams').data[1];
  assert.deepEqual([exam[1], exam[2], exam[3], exam[4], exam[6], exam[7], exam[10]], ['Ana Pérez', 2, 'finished', 11, 1, 0, who.attempt]);
  assert.match(exam[9], /^https:\/\/drive\//);
  // The total adds the scores of this attempt, and stays empty until one is given.
  assert.equal(sheets.get('Exams').formulas.get('2,9'), '=IF(COUNTIFS(Responses!K:K,K2,Responses!H:H,"<>")=0,"",SUMIFS(Responses!H:H,Responses!K:K,K2))');
});

test('an exam that never sent its start is added when it finishes', () => {
  const { post, sheets } = makeEnv();
  assert.equal(post({ type: 'finish', ...who, leftPage: 0, resumed: 2, finishedAt: '2026-11-25T15:25:00Z' }).ok, true);
  const exam = sheets.get('Exams').data[1];
  assert.deepEqual([exam[1], exam[2], exam[3], exam[4], exam[7]], ['Ana Pérez', 2, 'finished', 0, 2]);
});

test('a second folder with the same name is never made', () => {
  const { ctx, post, folders, props, madeAtTop } = makeEnv();
  ctx.setup();
  ctx.setup();
  post({ type: 'start', ...who });
  assert.equal(madeAtTop(), 1);
  assert.equal(props.get('ROOT_FOLDER_ID'), `folder:${ROOT}`);
  // The teacher renames the folder: the script still uses it (it remembers which one it is).
  const root = folders.get(ROOT);
  folders.delete(ROOT);
  folders.set('Examen oral', root);
  post({ type: 'start', ...who, attempt: 'mg1abc-aaaaaa' });
  assert.equal(madeAtTop(), 1);
  // Only if the folder is in the trash does the script make a new one.
  root.trashed = true;
  post({ type: 'start', ...who, attempt: 'mg1abc-bbbbbb' });
  assert.equal(madeAtTop(), 2);
});

test('a demo is marked as one, and the version is a number or nothing', () => {
  const { post, sheets, files } = makeEnv();
  post({ type: 'start', ...who, demo: true });
  assert.equal(sheets.get('Exams').data[1][3], 'demo');
  assert.equal(sheets.get('Versions'), undefined, 'a demo uses no version');
  post({ type: 'start', ...who, attempt: 'mg1abc-cccccc', version: '=1+1' });
  assert.equal(sheets.get('Exams').data[2][2], '');
  post({ type: 'recording', ...who, attempt: 'mg1abc-cccccc', version: 'x', qid: 'q7', mime: 'audio/mp4', audio });
  assert.equal(files[0].folder, `${ROOT}/Ana Pérez · cccccc`);
  assert.equal(files[0].blob.name, 'Question 7.m4a');
});

test('the answer is saved even if the score rule can’t be set', () => {
  const { ctx, post, sheets } = makeEnv();
  ctx.SpreadsheetApp.newDataValidation = () => {
    throw new Error('not here');
  };
  const res = post({ type: 'recording', ...who, qid: 'q10', mime: 'audio/webm', audio });
  assert.equal(res.ok, true, res.error);
  assert.equal(sheets.get('Responses').data.length, 2);
});

test('bad requests are refused with a message', () => {
  const { post } = makeEnv();
  assert.match(post({ type: 'recording', ...who, qid: 'q12', mime: 'audio/webm', audio }).error, /Pregunta desconocida/);
  assert.match(post({ type: 'recording', ...who, qid: 'constructor', mime: 'audio/webm', audio }).error, /Pregunta desconocida/);
  assert.match(post({ type: 'recording', ...who, qid: 'q7', mime: 'text/html', audio }).error, /no es un audio/);
  assert.match(post({ type: 'recording', ...who, qid: 'q7', mime: 'audio/webm' }).error, /No llegó el audio/);
  assert.match(post({ type: 'recording', ...who, attempt: '../x', qid: 'q7', mime: 'audio/webm', audio }).error, /Intento inválido/);
  assert.match(post({ type: 'start', ...who, student: ' ' }).error, /Falta el nombre/);
  assert.match(post({ type: 'nope' }).error, /Pedido desconocido/);
  // A name that looks like a formula stays text, on the exam and on the «Versions» tab.
  const { post: post2, sheets } = makeEnv();
  post2({ type: 'start', ...who, student: '=IMPORTXML("x")' });
  assert.equal(sheets.get('Exams').data[1][1], '\'=IMPORTXML("x")');
  post2({ type: 'version', student: '=IMPORTXML("x")' });
  assert.equal(sheets.get('Versions').data[1][1], '\'=IMPORTXML("x")');
});

test('the code still works if the editor joins its lines (only block comments)', () => {
  assert.doesNotThrow(() => new vm.Script(code.replace(/\n/g, ' ')));
});

test('the parts are the whole Code.gs, in order, and short', () => {
  const names = readdirSync(new URL('partes/', DIR)).filter((f) => f.endsWith('.gs')).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
  const parts = names.map((n) => stripMarkers(readFileSync(new URL(`partes/${n}`, DIR), 'utf8')));
  assert.deepEqual(parts, splitCode(code), 'run: node scripts/split-gs.mjs');
  assert.ok(parts.length <= 6, `${parts.length} parts`);
  for (const p of parts) {
    assert.doesNotThrow(() => new vm.Script(p), 'each part is complete code');
    assert.ok(p.split('\n').length <= MAX_LINES, `a part has ${p.split('\n').length} lines`);
  }
});

test('the parts work one after the other, as the Apps Script editor loads them', () => {
  const { ctx, post } = makeEnv(splitCode(code).join('\n\n'));
  assert.match(ctx.setup(), /Listo/);
  assert.equal(post({ type: 'version', student: 'Ana' }).ok, true);
  assert.equal(post({ type: 'start', ...who }).ok, true);
});
