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
const VERSION = 4;
const ROOT_FOLDER = 'Speaking Test — Recordings';
/* exam:start */
/* The recorded answers (id, label, highest score, how to score) and the article of each version.
   Made from js/format.js and js/versions.js: npm run gs. */
const ANSWERS = [
  ["q1","Question 1",5,"Questions 1–2, both readings: pronunciation and intelligibility."],
  ["q2","Question 2",5,"Questions 1–2, both readings: stress, intonation, rhythm, and pausing."],
  ["q3","Question 3",10,"Relevant details and task fulfillment (0–4) + delivery, fluency, and intelligibility (0–3) + vocabulary and grammatical structures (0–3)."],
  ["q4","Question 4",5,""],
  ["q5","Question 5",5,""],
  ["q6","Question 6",5,""],
  ["q7","Question 7",3,""],
  ["q8","Question 8",3,""],
  ["q9","Question 9",3,""],
  ["q10","Question 10",5,""],
  ["q11","Question 11",5,""],
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
const SCORING = {};
ANSWERS.forEach(function (a) { LABELS[a[0]] = a[1]; MAX[a[0]] = a[2]; SCORING[a[0]] = a[3] || ''; });
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
    /* A column for each criterion of RUBRIC (the next part). */
    get headers() { return ['Score'].concat(RUBRIC.map(function (c) { return c[0]; })); },
  },
};
const EX = { version: 3, status: 4, answers: 5, finished: 6, left: 7, restarts: 8, total: 9, folder: 10, attempt: 11 };
const RE = { label: 4, recording: 7, score: 8, max: 9, attempt: 11 };
const VE = { student: 2, version: 3 };

/* ✂ */

/* The Rubric tab: the course's scoring guide for the whole test, the same as the Scoring Guide
   PDF (54 points). A column for each criterion, and what each score from 5 to 0 means ('—' where
   the criterion has no such score). Questions 1–2 are scored together, both readings:
   pronunciation in Question 1's score, stress and intonation in Question 2's. The picture's
   score adds its three criteria. Adapted from Educational Testing Service (2019). */
const RUBRIC = [
  ["Question 1 · Questions 1–2, both readings: Pronunciation and Intelligibility (0–5)", [
    "Pronunciation is consistently clear and highly intelligible. Individual sounds and word endings are produced accurately, with only minor lapses that do not affect understanding.",
    "Pronunciation is clear and fully intelligible overall. Occasional lapses or other language influence are noticeable but do not require listener effort.",
    "Pronunciation is generally intelligible. Noticeable lapses and other language influence sometimes require listener effort, but the text remains understandable.",
    "Pronunciation is intelligible only with some difficulty. Frequent sound or word-level errors require considerable listener effort and occasionally obscure the text.",
    "Pronunciation is severely limited. Persistent errors and other language influence frequently prevent understanding.",
    "No response, no English in the response, or the response is completely unrelated to the task."]],
  ["Question 2 · Questions 1–2, both readings: Stress, Intonation, Rhythm, and Pausing (0–5)", [
    "Stress, intonation, rhythm, phrasing, and pausing are consistently appropriate to the text and support meaning.",
    "Stress, intonation, rhythm, phrasing, and pausing are generally appropriate. Minor lapses do not interfere with meaning.",
    "Prosodic features are partially controlled. Some inappropriate stress, intonation, rhythm, or pausing is noticeable, but the reading remains understandable.",
    "Prosodic features are frequently inappropriate or mechanical. Delivery requires listener effort and sometimes interferes with meaning.",
    "There is little effective control of stress, intonation, rhythm, phrasing, or pausing. Delivery significantly interferes with comprehension.",
    "No response, no English in the response, or the response is completely unrelated to the task."]],
  ["Question 3 · Relevant Details and Task Fulfillment (0–4 of 10)", [
    "—",
    "The response describes the main features of the picture and includes relevant supporting details. Ideas are clearly organized and remain focused on the visual information.",
    "The response describes the main features of the picture and includes some relevant details. Organization is generally clear, although development may be uneven.",
    "The response is connected to the picture but describes only a few features. Important information is missing, repeated, or insufficiently organized.",
    "The response makes only a minimal connection to the picture. Very little relevant information is communicated.",
    "No response, no English in the response, or the response is completely unrelated to the picture."]],
  ["Question 3 · Delivery, Fluency, and Intelligibility (0–3 of 10)", [
    "—",
    "—",
    "Delivery is clear, reasonably fluent, and generally intelligible. Pauses or hesitations do not prevent the listener from following the description.",
    "Delivery is mostly intelligible but requires some listener effort. Pauses, hesitations, or pronunciation problems occasionally interrupt the description.",
    "Delivery requires significant listener effort. Frequent pauses, hesitations, or pronunciation problems seriously limit comprehensibility.",
    "No response, no English in the response, or the response is completely unrelated to the picture."]],
  ["Question 3 · Vocabulary and Grammatical Structures (0–3 of 10)", [
    "—",
    "—",
    "Vocabulary is appropriate and sufficiently varied. Grammatical structures allow coherent and accurate expression of ideas, despite minor errors.",
    "Vocabulary and grammatical structures are adequate but limited or occasionally inaccurate. Errors sometimes interfere with clarity, although overall meaning is understandable.",
    "Vocabulary and grammatical structures are severely limited or inaccurate. Errors significantly interfere with comprehensibility.",
    "No response, no English in the response, or the response is completely unrelated to the picture."]],
  ["Questions 4–6 · Respond to Questions (0–5 each)", [
    "The response is complete, relevant, well developed, and socially appropriate. The speaker explains or supports ideas effectively. Delivery is clear, and vocabulary and grammatical structures fully meet the demands of the task.",
    "The response is complete and relevant, with adequate development. Minor limitations in delivery, vocabulary, or grammatical structures do not affect overall effectiveness.",
    "The response is generally relevant but may be somewhat limited or insufficiently developed. Language problems may require some listener effort, but the main message is clear.",
    "The response is only partially effective. Important information is missing, and limitations in delivery, vocabulary, or grammatical structures occasionally obscure meaning.",
    "The response is minimal or mostly ineffective. Relevant information is not communicated successfully, and comprehension requires considerable listener effort.",
    "No response, no English in the response, or the response is completely unrelated to the question."]],
  ["Questions 7–9 · Respond to Questions Using Information Provided (0–3 each)", [
    "—",
    "—",
    "The response is a full, relevant, socially appropriate reply to the question. In the case of Questions 7–9, information from the prompt is accurate.\n• The delivery requires little listener effort.\n• The choice of vocabulary is appropriate.\n• The use of structures fulfills the demands of the task.",
    "The response is a partially effective reply to the question, but is not complete, fully appropriate, or in the case of Questions 7–9, fully accurate.\n• The delivery may require some listener effort but is mostly intelligible.\n• The choice of vocabulary may be limited or somewhat inexact, although overall meaning is clear.\n• The use of structures may require some listener effort for interpretation.\n• In the case of Questions 7–9, the speaker may locate the relevant information in the prompt but fail to distinguish it from irrelevant information or fail to transform the written language so a listener can easily understand it.",
    "The response does not answer the question effectively. Relevant information is not conveyed successfully.\n• The delivery may impede or prevent listener comprehension.\n• The choice of vocabulary may be inaccurate or rely on repetition of the prompt.\n• The use of structures may interfere with comprehensibility.",
    "No response OR no English in the response OR the response is completely unrelated to the test."]],
  ["Question 10 · Propose a Solution (0–5)", [
    "The response successfully completes all parts of the task and is readily intelligible, coherent, and sustained. It is characterized by ALL of the following:\n• The speaker plays the appropriate role and understands the relationship between the sender and the receiver of the message.\n• A clear understanding of the situation in the prompt and a relevant, detailed response to the situation is present.\n• The speech is clear with a generally well-paced flow.\n• Good control of basic and complex structures, as appropriate, is exhibited. Some minor errors may be noticeable, but they do not obscure meaning.\n• The use of vocabulary is effective, with allowance for minor inaccuracy.",
    "The response addresses all parts of the task appropriately but may fall short of being fully developed. It is generally intelligible, sustained, and coherent, with some minor lapses.\n• The speaker plays the appropriate role and understands the relationship between the sender and the receiver of the message.\n• The response is sustained and conveys the minimum relevant information required by the situation in the prompt.\n• Minor difficulties with pronunciation, intonation, or pacing are noticeable and may require listener effort at times although overall intelligibility is not significantly affected.\n• The response demonstrates fairly automatic and effective use of grammar but may be somewhat limited in the range of structures used.\n• The use of vocabulary is fairly effective. Some vocabulary may be inaccurate or imprecise.",
    "The response attempts to address the task but does not successfully complete all parts of the task. It contains mostly intelligible speech, although problems with delivery and/or overall coherence may occur.\n• The speaker may neglect the role-playing aspect of the task or misrepresent the relationship between the sender and the receiver of the message.\n• The response conveys some relevant information but is clearly incomplete or inaccurate or the response is based on a misunderstanding of the task or content of the stimulus.\n• The speech is basically intelligible, though listener effort may be needed because of unclear articulation, awkward intonation, or choppy rhythm/pace.\n• The response demonstrates limited control of grammar.\n• The use of vocabulary is limited.",
    "The response includes very little relevant content and/or speech is mostly unintelligible or incoherent. The content may be limited because of the following:\n• There are lengthy, socially inappropriate pauses.\n• The response is only tangentially related to the stimulus and tasks.\n• The speech may be mostly unintelligible because of the following:\n• The delivery is labored and requires considerable listener effort.\n• There is very limited control of grammar.\n• The use of vocabulary is severely limited or inexact.",
    "The response may be completely unintelligible OR the response may consist of isolated words or phrases, or mixtures of the first language and English OR the response may be vague and general and show no interaction with the prompt.",
    "No response OR no English in the response OR the response is completely unrelated to the test."]],
  ["Question 11 · Express an Opinion (0–5)", [
    "The response clearly indicates the speaker’s choice or opinion, and support of the choice or opinion is readily intelligible, sustained, and coherent. The response is characterized by ALL of the following:\n• The speaker’s choice or opinion is supported with reason(s), details, arguments, or exemplifications; relationships between ideas are clear.\n• The speech is clear with generally well-paced flow. It may include minor lapses or minor difficulties with pronunciation or intonation patterns that do not affect overall intelligibility.\n• Good control of basic and complex structures, as appropriate, is exhibited. Some minor errors may be noticeable, but they do not obscure meaning.\n• The use of vocabulary is effective, with allowance for occasional minor inaccuracy.",
    "The response clearly indicates the speaker’s choice or opinion and adequately supports or develops the choice or opinion.\n• The response explains the reason(s) for the speaker’s choice or opinion, although the explanation may not be fully developed; relationships between ideas are mostly clear, with occasional lapses.\n• Minor difficulties with pronunciation, intonation, or pacing are noticeable and may require listener effort at times, although overall intelligibility is not significantly affected.\n• The response demonstrates fairly automatic and effective use of grammar but may be somewhat limited in the range of structures used.\n• The use of vocabulary is fairly effective. Some vocabulary may be inaccurate or imprecise.",
    "The response expresses a choice, preference, or opinion, but development and support of the choice or opinion is limited.\n• The response provides at least one reason supporting the choice, preference, or opinion. However, it provides little or no elaboration of the reason, repeats itself with no new information, is vague, or is unclear.\n• The speech is basically intelligible, though listener effort may be needed because of unclear articulation, awkward intonation, or choppy rhythm/pace; meaning may be obscured in places.\n• The response demonstrates limited control of grammar; for the most part, only basic sentence structures are used successfully.\n• The use of vocabulary is limited.",
    "The response states a choice, preference, or opinion relevant to the prompt, but support for the choice, preference, or opinion is missing, unintelligible, or incoherent.\n• Consistent difficulties with pronunciation, stress, and intonation cause considerable listener effort; delivery is choppy, fragmented, or telegraphic; there may be long pauses and frequent hesitations.\n• Control of grammar severely limits expression of ideas and clarity of connections among ideas.\n• The use of vocabulary is severely limited or highly repetitious.",
    "The response is limited to reading the prompt or the directions aloud OR the response fails to state an intelligible choice, preference, or opinion as required by the prompt OR the response consists of isolated words or phrases, or mixtures of the first language and English.",
    "No response OR no English in the response OR the response is completely unrelated to the test."]],
];

/* ✂ */

/* The Rubric tab's rows: each score from 5 to 0, and what it means for each criterion. */
function rubricRows_() {
  return ['5', '4', '3', '2', '1', '0'].map(function (score, i) {
    return [score].concat(RUBRIC.map(function (c) { return c[1][i]; }));
  });
}

function setup() {
  return withLock_(function () {
    /* The first row again, in case the exam changed (the total says how many points). */
    Object.keys(SHEETS).forEach(function (k) {
      sheet_(k).getRange(1, 1, 1, SHEETS[k].headers.length).setValues([SHEETS[k].headers]).setFontWeight('bold');
    });
    reference_('rubric', rubricRows_());
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
    scoreRule_(sheet.getRange(last, RE.score), MAX[d.qid], SCORING[d.qid]);
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
   question, and says what to score when the question needs it. If the rule
   can’t be set, the answer is saved all the same. */
function scoreRule_(range, max, scoring) {
  try {
    range.setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireNumberBetween(0, max)
        .setAllowInvalid(false)
        .setHelpText((scoring ? scoring + ' ' : '') + 'A number from 0 to ' + max + '.')
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
  /* Long descriptors: wrapped, from the top of each cell. */
  try {
    sheet.getRange(1, 1, rows.length + 1, headers.length).setWrap(true).setVerticalAlignment('top');
    sheet.setColumnWidth(1, 60);
    sheet.setColumnWidths(2, headers.length - 1, 300);
  } catch (err) {
    Logger.log('Rubric format: ' + err.message);
  }
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
