/* ── Speaking Test · parte 6 de 6 ── */

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

/* ── fin de la parte 6 de 6 ── */
