/*
 * ── Speaking Test · Google Apps Script ──
 *
 * Recibe las grabaciones del examen oral completo (Questions 1–11, formato
 * TOEIC Speaking) y las guarda en tu Google Drive, con una fila por respuesta
 * en esta planilla para que pongas la nota. Le da a cada estudiante una de las
 * 14 versiones (una por artículo) que nadie más tiene, y la anota en la hoja
 * «Versions».
 *
 * Instalación (una vez):
 *   1. Creá una planilla nueva (sheets.new) → Extensiones → Apps Script.
 *   2. Borrá lo que haya, pegá todo este archivo (o las partes, en orden) y guardá.
 *   3. Elegí la función «setup» → ▶ Ejecutar → aceptá los permisos.
 *   4. Implementar → Nueva implementación → Aplicación web · Ejecutar como: Yo ·
 *      Quién tiene acceso: Cualquier persona → copiá la URL que termina en /exec.
 *   5. Pasale la URL a quien arma la página (o pegala en …/#teacher y guardá).
 * Si cambiás este código: Implementar → Administrar implementaciones → ✏ →
 * Nueva versión.
 */

const APP = 'Speaking Test';
const VERSION = 2;
const ROOT_FOLDER = 'Speaking Test — Recordings';
/* exam:start */
/* The recorded answers (id, label, highest score) and the article of each version.
   Made from js/format.js and js/versions.js: npm run gs. */
const ANSWERS = [
  ["q1","Question 1",3],
  ["q2","Question 2",3],
  ["q3","Question 3",3],
  ["q4","Question 4",3],
  ["q5","Question 5",3],
  ["q6","Question 6",3],
  ["q7","Question 7",3],
  ["q8","Question 8",3],
  ["q9","Question 9",3],
  ["q10","Question 10",3],
  ["q11","Question 11",5],
];
const ARTICLES = [
  "‘It keeps growing’: the tent camp that stands against Spain’s housing crisis (The Guardian, 29 September 2026)",
  "‘I’m screwed’: young adults forced by EU housing crisis to live with parents (The Guardian, 21 May 2024)",
  "AI threatens democracy. But we are not powerless: here’s how to fight back (The Guardian, 16 October 2026)",
  "We are teaching children maths they will never use. Isn’t it better to help them speak fluently? (The Guardian, 16 October 2026)",
  "Britain is addicted to prisons. Our crumbling probation service proves they don’t work (The Guardian, 16 October 2026)",
  "The scandal of food waste – and how we can stop it (The Guardian, 8 October 2024)",
  "‘I have no neighbours’: overtourism pushes residents in Spain and Portugal to the limit (The Guardian, 25 January 2025)",
  "‘The way universities are run is making us ill’: inside the student mental health crisis (The Guardian, 27 September 2019)",
  "Japan’s September surge in student suicides: What are the key drivers? (The Japan Times, 23 September 2026)",
  "School phone bans alone do not improve grades or wellbeing, says UK study (The Guardian, 5 February 2025)",
  "Do you remember your first crappy job? Today’s young people would wish for half your luck (The Guardian, 20 February 2026)",
  "Burnt out: is the exhausting cult of productivity finally over? (The Guardian, 22 April 2021)",
  "‘Where do they expect us to go?’ Life at one Bay Area encampment before eviction (The Guardian, 5 May 2022)",
  "How do we know that the climate crisis is to blame for extreme weather? (The Guardian, 18 November 2024)",
];
/* exam:end */
const VERSION_COUNT = ARTICLES.length;
const QUESTIONS = ANSWERS.map(function (a) { return a[0]; });
const LABELS = {};
const MAX = {};
ANSWERS.forEach(function (a) { LABELS[a[0]] = a[1]; MAX[a[0]] = a[2]; });
const TOTAL = ANSWERS.reduce(function (n, a) { return n + a[2]; }, 0);
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

const SHEETS = {
  exams: {
    name: 'Exams',
    headers: [
      'Started', 'Student', 'Version', 'Status', 'Answers', 'Finished',
      'Left the page', 'Restarts', 'Total (of ' + TOTAL + ')', 'Folder', 'Attempt',
    ],
  },
  responses: {
    name: 'Responses',
    headers: [
      'Recorded', 'Student', 'Version', 'Question', 'Prompt',
      'Seconds', 'Recording', 'Score', 'Out of', 'Comments', 'Attempt',
    ],
  },
  versions: {
    name: 'Versions',
    headers: ['Given', 'Student', 'Version', 'Article'],
  },
  rubric: {
    name: 'Rubric',
    headers: [
      'Score', 'Questions 1–2 · read aloud (0–3)', 'Questions 3–4 · pictures (0–3)', 'Questions 5–7 (0–3)',
      'Questions 8–10 · graph (0–3)', 'Question 11 · opinion (0–5)',
    ],
  },
};
const EX = { version: 3, status: 4, answers: 5, finished: 6, left: 7, restarts: 8, total: 9, folder: 10, attempt: 11 };
const RE = { label: 4, recording: 7, score: 8, max: 9, attempt: 11 };
const VE = { student: 2, version: 3 };

/* ✂ */

/* The scales of the TOEIC Speaking test: 0–3 for Questions 1–10, 0–5 for Question 11. */
const RUBRIC = [
  ['5', '—', '—', '—', '—',
    'States a clear opinion and supports it with relevant reasons and examples. Sustained, coherent ' +
      'and easy to understand; good grammar and vocabulary.'],
  ['4', '—', '—', '—', '—',
    'States an opinion and supports it, but with less development or small lapses in organization, ' +
      'grammar or pronunciation. Still easy to follow.'],
  ['3',
    'Highly intelligible, with minor lapses or a slight accent. Intonation and stress are appropriate, ' +
      'with small mistakes only.',
    'Describes the main features of the picture. Easy to understand; appropriate vocabulary and ' +
      'grammar, with only small errors.',
    'A full, relevant and appropriate answer. Easy to understand; appropriate vocabulary and grammar.',
    'Complete, accurate and appropriate: gives the information the question asks for, taken correctly ' +
      'from the information on the screen. Easy to understand.',
    'States an opinion, but the support is limited, vague or repetitive. Pauses or errors sometimes ' +
      'make the meaning unclear.'],
  ['2',
    'Generally intelligible, with some lapses or a noticeable accent. Intonation and stress are ' +
      'generally appropriate.',
    'Connected to the picture, but the meaning is sometimes unclear; limited vocabulary or grammar.',
    'Answers the question, but not completely; some parts are hard to understand, or the language is limited.',
    'Connected to the question, but incomplete or partly inaccurate; or it takes some effort to understand.',
    'Gives an opinion with little or no support. Limited language; often hard to follow.'],
  ['1',
    'Intelligible only at times: serious problems with pronunciation, intonation or stress.',
    'Only partly connected to the picture; hard to understand; very limited language.',
    'Does not answer the question effectively: little relevant information, or hard to understand.',
    'Does not answer the question effectively: the information is wrong or mostly missing, or it is ' +
      'hard to understand.',
    'Isolated words or phrases; no clear opinion.'],
  ['0',
    'No answer, or no English.',
    'No answer, no English, or an answer that is not connected to the picture.',
    'No answer, no English, or an answer that is not connected to the question.',
    'No answer, no English, or an answer that is not connected to the question.',
    'No answer, no English, or an answer that is not connected to the topic.'],
];

/* ✂ */

function setup() {
  return withLock_(function () {
    /* The first row again, in case the exam changed (the total says how many points). */
    Object.keys(SHEETS).forEach(function (k) {
      sheet_(k).getRange(1, 1, 1, SHEETS[k].headers.length).setValues([SHEETS[k].headers]).setFontWeight('bold');
    });
    reference_('rubric', RUBRIC);
    rootFolder_();
    const msg = 'Listo: hojas Exams, Responses, Versions y Rubric, y la carpeta «' + ROOT_FOLDER +
      '» en tu Drive. Ahora implementá la aplicación web.';
    Logger.log(msg);
    return msg;
  });
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu(APP).addItem('Configurar (setup)', 'setup').addToUi();
}

function doGet() {
  const name = SpreadsheetApp.getActiveSpreadsheet().getName();
  return json_({ ok: true, app: APP, sheet: name, version: VERSION, versions: VERSION_COUNT });
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.type === 'version') return json_(withLock_(function () { return version_(data); }));
    if (data.type === 'start') return json_(withLock_(function () { return start_(data); }));
    if (data.type === 'recording') return json_(recording_(data));
    if (data.type === 'finish') return json_(withLock_(function () { return finish_(data); }));
    throw new Error('Pedido desconocido: ' + String(data.type));
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

/* ─── requests ─── */

/* Each student gets a version no one else has (by chance among those left), and the
   same name always gets the same one. A version link asks for its version: it is given
   and written down even if someone else has it. The «Versions» tab is the list: delete
   a row to free a version, or clear the tab to start again with another group. */
function version_(d) {
  const student = String(d.student || '').trim().slice(0, 80);
  if (!student) throw new Error('Falta el nombre.');
  const key = nameKey_(student);
  const sheet = sheet_('versions');
  const last = sheet.getLastRow();
  const rows = last > 1 ? sheet.getRange(2, 1, last - 1, SHEETS.versions.headers.length).getValues() : [];
  const used = {};
  let mine = 0;
  rows.forEach(function (r) {
    const n = Number(r[VE.version - 1]);
    if (!(n >= 1 && n <= VERSION_COUNT)) return;
    used[n] = true;
    if (nameKey_(r[VE.student - 1]) === key) mine = n;
  });
  if (mine) return { ok: true, version: mine, again: true };
  const asked = Math.floor(Number(d.asked));
  let n = asked >= 1 && asked <= VERSION_COUNT ? asked : 0;
  if (!n) {
    const free = [];
    for (let i = 1; i <= VERSION_COUNT; i++) if (!used[i]) free.push(i);
    if (!free.length) {
      return { ok: false, error: 'All ' + VERSION_COUNT + ' versions have been given out. Please ask your teacher.' };
    }
    n = free[Math.floor(Math.random() * free.length)];
  }
  sheet.appendRow([new Date(), text_(student), n, ARTICLES[n - 1]]);
  return { ok: true, version: n };
}

/* «Ana Pérez», «ana perez » and «ANA PEREZ» are the same student. */
function nameKey_(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

/* ✂ */

function start_(d) {
  const who = person_(d);
  const sheet = sheet_('exams');
  const row = findRow_(sheet, EX.attempt, who.attempt);
  if (row) return { ok: true, duplicate: true };
  const folder = studentFolder_(who);
  sheet.appendRow([
    date_(d.startedAt),
    text_(who.student),
    who.version,
    d.demo ? 'demo' : 'started',
    0,
    '',
    '',
    '',
    '',
    folder.getUrl(),
    who.attempt,
  ]);
  const last = sheet.getLastRow();
  sheet.getRange(last, EX.total).setFormula(
    '=IF(COUNTIFS(Responses!K:K,K' + last + ',Responses!H:H,"<>")=0,"",' +
      'SUMIFS(Responses!H:H,Responses!K:K,K' + last + '))'
  );
  return { ok: true };
}

function finish_(d) {
  const who = person_(d);
  const sheet = sheet_('exams');
  let row = findRow_(sheet, EX.attempt, who.attempt);
  if (!row) {
    start_(d);
    row = sheet.getLastRow();
  }
  sheet.getRange(row, EX.status).setValue('finished');
  sheet.getRange(row, EX.answers).setValue(countResponses_(sheet_('responses'), who.attempt));
  sheet.getRange(row, EX.finished).setValue(date_(d.finishedAt));
  sheet.getRange(row, EX.left).setValue(Number(d.leftPage) || 0);
  sheet.getRange(row, EX.restarts).setValue(Number(d.resumed) || 0);
  return { ok: true };
}

function recording_(d) {
  const who = person_(d);
  if (QUESTIONS.indexOf(d.qid) < 0) throw new Error('Pregunta desconocida.');
  const mime = String(d.mime || '').split(';')[0];
  if (mime.indexOf('audio/') !== 0) throw new Error('Eso no es un audio.');
  if (!d.audio) throw new Error('No llegó el audio.');
  const bytes = Utilities.base64Decode(d.audio);
  if (bytes.length > MAX_AUDIO_BYTES) throw new Error('La grabación es demasiado grande.');

  /* The same answer sent again (the first one did arrive) gets the same file back. */
  const sheet = sheet_('responses');
  const existing = findResponse_(sheet, who.attempt, d.qid);
  if (existing) return { ok: true, duplicate: true, url: existing };

  const ext = /mp4|m4a|aac/.test(d.mime) ? 'm4a' : /ogg/.test(d.mime) ? 'ogg' : 'webm';
  const label = LABELS[d.qid];
  const blob = Utilities.newBlob(bytes, mime, label + '.' + ext);
  const file = studentFolder_(who).createFile(blob);
  file.setDescription(String(d.prompt || '').slice(0, 1000));
  const url = file.getUrl();

  withLock_(function () {
    if (findResponse_(sheet, who.attempt, d.qid)) return;
    sheet.appendRow([
      date_(d.recordedAt),
      text_(who.student),
      who.version,
      label,
      text_(String(d.prompt || '').slice(0, 2000)),
      Math.round(Number(d.durationSec) || 0),
      '',
      '',
      MAX[d.qid],
      '',
      who.attempt,
    ]);
    const last = sheet.getLastRow();
    sheet.getRange(last, RE.recording).setFormula('=HYPERLINK("' + url + '","▶ Listen")');
    scoreRule_(sheet.getRange(last, RE.score), MAX[d.qid]);
    const exams = sheet_('exams');
    const row = findRow_(exams, EX.attempt, who.attempt);
    if (row) exams.getRange(row, EX.answers).setValue(countResponses_(sheet, who.attempt));
  });
  return { ok: true, url: url, id: file.getId() };
}

/* ✂ */

/* ─── helpers ─── */

function person_(d) {
  const attempt = String(d.attempt || '');
  if (!/^[\w-]{6,40}$/.test(attempt)) throw new Error('Intento inválido.');
  const student = String(d.student || '').trim().slice(0, 80);
  if (!student) throw new Error('Falta el nombre.');
  const v = Math.floor(Number(d.version));
  return { attempt: attempt, student: student, version: v >= 1 && v <= VERSION_COUNT ? v : '' };
}

/* The score cell only takes a number from 0 to the highest score of its
   question. If the rule can’t be set, the answer is saved all the same. */
function scoreRule_(range, max) {
  try {
    range.setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireNumberBetween(0, max)
        .setAllowInvalid(false)
        .setHelpText('A number from 0 to ' + max + '.')
        .build()
    );
  } catch (err) {
    Logger.log('Score rule: ' + err.message);
  }
}

/* The Rubric tab is rewritten each time setup runs. */
function reference_(key, rows) {
  const sheet = sheet_(key);
  const headers = SHEETS[key].headers;
  if (sheet.getLastRow() > 0) {
    sheet.getRange(1, 1, sheet.getLastRow(), Math.max(sheet.getLastColumn(), headers.length)).clearContent();
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function sheet_(key) {
  const def = SHEETS[key];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(def.name);
  if (!sheet) {
    sheet = ss.insertSheet(def.name);
    sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow_(sheet, col, value) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const values = sheet.getRange(2, col, last - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]) === value) return i + 2;
  }
  return 0;
}

/* The recording link of an answer already saved, or ''. */
function findResponse_(sheet, attempt, qid) {
  const last = sheet.getLastRow();
  if (last < 2) return '';
  const label = LABELS[qid];
  const rows = sheet.getRange(2, 1, last - 1, SHEETS.responses.headers.length).getValues();
  const formulas = sheet.getRange(2, RE.recording, last - 1, 1).getFormulas();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][RE.attempt - 1]) === attempt && String(rows[i][RE.label - 1]) === label) {
      const m = String(formulas[i][0]).match(/HYPERLINK\("([^"]+)"/);
      return m ? m[1] : 'saved';
    }
  }
  return '';
}

function countResponses_(sheet, attempt) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  return sheet
    .getRange(2, RE.attempt, last - 1, 1)
    .getValues()
    .filter(function (r) { return String(r[0]) === attempt; }).length;
}

/* ✂ */

/* The exam’s folder. The script remembers which one it is, so a second folder
   with the same name is never made (and the folder can be renamed or moved). */
function rootFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('ROOT_FOLDER_ID');
  if (id) {
    try {
      const kept = DriveApp.getFolderById(id);
      if (!kept.isTrashed()) return kept;
    } catch (err) {
      Logger.log('The exam’s folder is gone: making it again.');
    }
  }
  const it = DriveApp.getFoldersByName(ROOT_FOLDER);
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_FOLDER);
  props.setProperty('ROOT_FOLDER_ID', folder.getId());
  return folder;
}

function childFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

/* Speaking Test — Recordings / <student> · V<version> · <attempt> */
function studentFolder_(who) {
  const name = who.student.replace(/[\\/:*?"<>|]/g, '-');
  const version = who.version ? ' · V' + who.version : '';
  return childFolder_(rootFolder_(), name + version + ' · ' + who.attempt.slice(-6));
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/* Text that looks like a formula is kept as text. */
function text_(s) {
  s = String(s || '');
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function date_(iso) {
  const d = new Date(iso);
  return isNaN(d) ? new Date() : d;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
