/* ── Speaking Test · parte 3 de 6 ── */

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

/* ── fin de la parte 3 de 6 ── */
