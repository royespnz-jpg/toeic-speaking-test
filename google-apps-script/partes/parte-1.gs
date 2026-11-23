/* ── Speaking Test · parte 1 de 6 ── */

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
const VERSION = 3;
const ROOT_FOLDER = 'Speaking Test — Recordings';
/* exam:start */
/* The recorded answers (id, label, highest score, how to score) and the article of each version.
   Made from js/format.js and js/versions.js: npm run gs. */
const ANSWERS = [
  ["q1","Question 1",5,"Questions 1–2, both readings: pronunciation and intelligibility."],
  ["q2","Question 2",5,"Questions 1–2, both readings: stress, intonation, rhythm, and pausing."],
  ["q3","Question 3",10,"This picture: relevant details and task fulfillment (0–4) + delivery, fluency, and intelligibility (0–3) + vocabulary and grammatical structures (0–3)."],
  ["q4","Question 4",10,"This picture: relevant details and task fulfillment (0–4) + delivery, fluency, and intelligibility (0–3) + vocabulary and grammatical structures (0–3)."],
  ["q5","Question 5",5,""],
  ["q6","Question 6",5,""],
  ["q7","Question 7",5,""],
  ["q8","Question 8",3,""],
  ["q9","Question 9",3,""],
  ["q10","Question 10",3,""],
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

/* ── fin de la parte 1 de 6 ── */
