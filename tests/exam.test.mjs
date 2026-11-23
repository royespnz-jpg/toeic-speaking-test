import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import {
  PARTS, PART_ORDER, RESPONSES, INTRO, READ, PICTURE, INTERVIEW, INFO, OPINION, TOTAL_POINTS,
  buildTimeline, timedSeconds, responseOf, resumeIndex,
} from '../js/format.js';
import { VERSIONS, versionOf, pickVersion, barValue, infoText } from '../js/versions.js';
import { fmt } from '../js/clock.js';

const repeated = (list) => list.filter((x, i) => list.indexOf(x) !== i);
const words = (s) => s.match(/[A-Za-zÀ-ÿ0-9’'€£$%,.-]+/g) || [];
const steps = (v = VERSIONS[0], opts) => buildTimeline(v, opts);

test('the whole test: Questions 1–11 with the teacher’s clocks', () => {
  assert.deepEqual(READ, { prep: 45, response: 45 });
  assert.deepEqual(PICTURE, { prep: 30, response: 60 });
  assert.deepEqual(INTERVIEW, { response: 60 });
  assert.deepEqual(INFO, { read: 30, responses: [15, 15, 30] });
  assert.deepEqual(OPINION, { prep: 15, response: 60 });
  for (const v of VERSIONS) {
    const s = steps(v);
    assert.deepEqual(
      s.filter((x) => x.seconds).map((x) => `${x.type}:${x.id || x.part}:${x.seconds}`),
      [
        'prep:read:45', 'response:q1:45', 'prep:read:45', 'response:q2:45',
        'prep:picture:30', 'response:q3:60', 'prep:picture:30', 'response:q4:60',
        'response:q5:60', 'response:q6:60', 'response:q7:60',
        'prep:info:30', 'response:q8:15', 'response:q9:15', 'response:q10:30',
        'prep:opinion:15', 'response:q11:60',
      ],
      `version ${v.n}`,
    );
    assert.equal(timedSeconds(s), 705);
    assert.deepEqual(s.filter((x) => x.type === 'response').map((x) => x.id), RESPONSES.map((r) => r.id));
  }
  assert.deepEqual(PART_ORDER, ['read', 'picture', 'interview', 'info', 'opinion']);
  assert.deepEqual(Object.keys(PARTS), PART_ORDER, 'no «propose a solution»');
  assert.deepEqual(PART_ORDER.map((p) => PARTS[p].label), ['Questions 1–2', 'Questions 3–4', 'Questions 5–7', 'Questions 8–10', 'Question 11']);
  assert.deepEqual(steps().filter((x) => x.type === 'part').map((x) => x.part), PART_ORDER);
});

test('eleven recorded answers scored with the course’s scoring guide: 59 points', () => {
  assert.deepEqual(RESPONSES.map((r) => r.id), ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11']);
  assert.deepEqual(RESPONSES.map((r) => r.part), ['read', 'read', 'picture', 'picture', 'interview', 'interview', 'interview', 'info', 'info', 'info', 'opinion']);
  // Questions 1–2: 5 + 5 (two criteria, both readings) · 3 and 4: 10 each · 5–7: 5 each · 8–10: 3 each · 11: 5.
  assert.deepEqual(RESPONSES.map((r) => r.max), [5, 5, 10, 10, 5, 5, 5, 3, 3, 3, 5]);
  assert.equal(TOTAL_POINTS, 59);
  for (const r of RESPONSES) assert.match(r.id, /^[\w-]+$/);
  // The answers whose score needs saying what goes in it: one criterion of both readings, or a picture's three.
  assert.match(RESPONSES[0].scoring, /both readings: pronunciation and intelligibility/);
  assert.match(RESPONSES[1].scoring, /both readings: stress, intonation, rhythm, and pausing/);
  for (const r of RESPONSES.slice(2, 4)) assert.match(r.scoring, /\(0–4\) \+ .*\(0–3\) \+ .*\(0–3\)/);
  assert.deepEqual(RESPONSES.slice(4).map((r) => r.scoring), Array(7).fill(''));
});

test('the directions say the same clocks, and what is heard but not seen', () => {
  assert.match(PARTS.read.directions, /You will have 45 seconds to prepare\. Then you will have 45 seconds to read the text aloud\. There are two texts\.$/);
  assert.match(PARTS.picture.directions, /You will have 30 seconds to prepare your response\. Then you will have 1 minute to speak about the picture\. There are two pictures\.$/);
  assert.match(PARTS.interview.directions, /No preparation time is provided\. You will have 1 minute to respond to each question\.$/);
  assert.match(PARTS.info.directions, /You will have 30 seconds to read the information before the questions begin\. The information stays on the screen until the end of this part\. You will hear the questions, but you will not see them\./);
  assert.match(PARTS.info.directions, /You will have 15 seconds to respond to Questions 8 and 9 and 30 seconds to respond to Question 10\.$/);
  assert.match(PARTS.opinion.directions, /You will have 15 seconds to prepare\. Then you will have 60 seconds to speak\. When the preparation time is over, the topic disappears from the screen\./);
  assert.match(INTRO, /^This is the Speaking test\. It has five parts and eleven questions\./);
});

test('Questions 1–4: each text and each picture comes with its own clock', () => {
  const v = VERSIONS[2];
  const s = steps(v);
  const at = s.findIndex((x) => x.type === 'part' && x.part === 'read');
  assert.deepEqual(s.slice(at + 1, at + 5).map((x) => [x.type, x.question, x.say]), [
    ['prep', 1, 'Question 1. Begin preparing now.'],
    ['response', 1, 'Begin reading aloud now.'],
    ['prep', 2, 'Question 2. Begin preparing now.'],
    ['response', 2, 'Begin reading aloud now.'],
  ]);
  assert.equal(s[at + 2].prompt, v.read[0]);
  assert.equal(s[at + 4].prompt, v.read[1]);
  const pic = s.findIndex((x) => x.type === 'part' && x.part === 'picture');
  assert.deepEqual(s.slice(pic + 1, pic + 6).map((x) => [x.type, x.question, x.picture, x.seconds, x.say]), [
    ['prep', 3, 0, 30, 'Question 3. Begin preparing now.'],
    ['response', 3, 0, 60, 'Begin speaking now.'],
    ['prep', 4, 1, 30, 'Question 4. Begin preparing now.'],
    ['response', 4, 1, 60, 'Begin speaking now.'],
    ['part', undefined, undefined, undefined, s[pic + 5].say],
  ]);
  assert.equal(s[pic + 2].prompt, `Describe the picture: ${v.pictures[0].alt}.`);
  assert.equal(s[pic + 4].prompt, `Describe the picture: ${v.pictures[1].alt}.`);
});

test('Questions 5–7: the interviewer, then each question and its answer, with no preparation', () => {
  const v = VERSIONS[4];
  const s = steps(v);
  const at = s.findIndex((x) => x.type === 'part' && x.part === 'interview');
  assert.deepEqual(s.slice(at + 1, at + 8).map((x) => [x.type, x.question || (x.narrator ? 'interviewer' : '')]), [
    ['say', 'interviewer'], ['say', 5], ['response', 5], ['say', 6], ['response', 6], ['say', 7], ['response', 7],
  ]);
  assert.equal(s[at + 1].say, v.interview.narrator);
  assert.equal(s[at + 2].say, `Question 5. ${v.interview.questions[0]}`);
  assert.equal(s[at + 6].say, `Question 7. ${v.interview.questions[2]}`);
  // "Begin responding immediately after you hear a beep": nothing is said before the answer.
  assert.equal(s[at + 3].say, undefined);
});

test('Questions 8–10: the reading clock, the caller, then each question (heard) and its answer', () => {
  const v = VERSIONS[1];
  const s = steps(v);
  const at = s.findIndex((x) => x.type === 'part' && x.part === 'info');
  assert.deepEqual(s.slice(at + 1, at + 9).map((x) => [x.type, x.question || (x.narrator ? 'caller' : '')]), [
    ['prep', ''], ['say', 'caller'], ['say', 8], ['response', 8], ['say', 9], ['response', 9], ['say', 10], ['response', 10],
  ]);
  assert.equal(s[at + 1].phase, 'Reading time');
  assert.equal(s[at + 2].say, v.info.narrator);
  assert.equal(s[at + 3].say, `Question 8. ${v.info.questions[0]}`);
  assert.equal(s[at + 4].say, undefined);
});

test('Question 11: the topic is heard and prepared before the answer', () => {
  const v = VERSIONS[6];
  const s = steps(v);
  const op = s.findIndex((x) => x.type === 'part' && x.part === 'opinion');
  assert.equal(s[op - 1].id, 'q10', 'right after the graph');
  assert.deepEqual(s.slice(op + 1).map((x) => [x.type, x.say]), [
    ['say', v.opinion], ['prep', 'Begin preparing now.'], ['response', 'Begin speaking now.'],
  ]);
  assert.equal(s.at(-1).prompt, v.opinion);
});

test('every step knows the answer it belongs to', () => {
  const s = steps();
  assert.equal(responseOf(s[0]), null);
  assert.equal(responseOf(s.find((x) => x.type === 'part' && x.part === 'read')), null);
  assert.equal(responseOf(s.find((x) => x.type === 'part' && x.part === 'picture')), null);
  assert.equal(responseOf(s.find((x) => x.type === 'prep' && x.question === 2)), 'q2');
  assert.equal(responseOf(s.find((x) => x.type === 'prep' && x.question === 4)), 'q4');
  assert.equal(responseOf(s.find((x) => x.type === 'say' && x.question === 5)), 'q5');
  assert.equal(responseOf(s.find((x) => x.type === 'say' && x.question === 10)), 'q10');
  assert.equal(responseOf(s.find((x) => x.type === 'part' && x.part === 'opinion')), 'q11');
  assert.equal(responseOf(s.find((x) => x.type === 'prep' && x.part === 'opinion')), 'q11');
  for (const x of s.filter((y) => y.type === 'response')) assert.equal(responseOf(x), x.id);
});

test('after a reload: back to the interrupted question; what left the screen is not shown again', () => {
  const s = steps();
  const at = (id) => s.findIndex((x) => x.id === id);
  const read = s.findIndex((x) => x.type === 'prep' && x.part === 'info');
  const done = (...ids) => ids;
  // Nothing recorded yet: from the start. Question 2 interrupted: its text again, from its clock.
  assert.equal(resumeIndex(s, [], 3), 0);
  assert.equal(resumeIndex(s, done('q1'), at('q2')), at('q1') + 1);
  assert.equal(s[at('q1') + 1].type, 'prep');
  // Question 4 interrupted: its picture again, from its clock.
  assert.equal(resumeIndex(s, done('q1', 'q2', 'q3'), at('q4')), at('q3') + 1);
  assert.deepEqual([s[at('q3') + 1].type, s[at('q3') + 1].question], ['prep', 4]);
  // Questions 5–7: the question is heard again.
  assert.equal(resumeIndex(s, done('q1', 'q2', 'q3', 'q4', 'q5'), at('q6')), at('q5') + 1);
  // Reloaded after the reading time of Questions 8–10: on to the caller, without a second reading time.
  const before8 = done('q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7');
  assert.equal(resumeIndex(s, before8, read), at('q7') + 1);
  assert.equal(resumeIndex(s, before8, read + 1), read + 1);
  assert.equal(resumeIndex(s, before8, at('q8')), read + 1);
  // Question 10 interrupted: the question is heard again (the graph is still there).
  assert.equal(resumeIndex(s, [...before8, 'q8', 'q9'], at('q10')), at('q9') + 1);
  // Reloaded while answering Question 11: straight back to answering; while preparing: from the start of it.
  const before11 = [...before8, 'q8', 'q9', 'q10'];
  assert.equal(resumeIndex(s, before11, at('q11')), at('q11'));
  assert.equal(resumeIndex(s, before11, at('q11') - 1), at('q10') + 1);
  assert.equal(s[at('q11')].say, 'Begin speaking now.', 'the answer starts with its cue and the beep');
});

test('the quick demo shortens every clock but keeps at least 3 seconds', () => {
  assert.deepEqual(steps(VERSIONS[0], { scale: 0.1 }).filter((x) => x.seconds).map((x) => x.seconds), [5, 5, 5, 5, 3, 6, 3, 6, 6, 6, 6, 3, 3, 3, 3, 3, 6]);
  assert.ok(steps(VERSIONS[0], { scale: 0.01 }).filter((x) => x.seconds).every((x) => x.seconds === 3));
});

test('fourteen versions, one for each article, with everything the format needs', () => {
  assert.equal(VERSIONS.length, 14);
  assert.deepEqual(VERSIONS.map((v) => v.n), Array.from({ length: 14 }, (_, i) => i + 1));
  for (const v of VERSIONS) {
    const where = `version ${v.n}`;
    assert.ok(v.article.title && v.article.outlet && v.article.author && /\d{4}$/.test(v.article.date), where);
    assert.equal(v.solution, undefined, `${where}: no Question 10 «propose a solution»`);
    // Two passages to read aloud, each short enough for 45 seconds.
    assert.equal(v.read.length, 2, where);
    for (const t of v.read) {
      const n = words(t).length;
      assert.ok(n >= 40 && n <= 80, `${where}: a text of ${n} words`);
    }
    // Two pictures, in the repository, with their credits.
    assert.equal(v.pictures.length, 2, where);
    const nn = String(v.n).padStart(2, '0');
    assert.deepEqual(v.pictures.map((p) => p.file), [`v${nn}.jpg`, `v${nn}b.jpg`]);
    for (const p of v.pictures) {
      const img = new URL(`../img/${p.file}`, import.meta.url);
      assert.ok(existsSync(img), `${where}: img/${p.file}`);
      assert.ok(statSync(img).size < 300 * 1024, `${where}: ${p.file} is small enough`);
      assert.match(p.credit, /^(Photograph|Illustration): /, where);
      assert.ok(p.alt.length > 20, where);
      if (p.from !== undefined) assert.ok(Number.isInteger(p.from) && p.from !== v.n && versionOf(p.from), `${where}: from article ${p.from}`);
    }
    assert.equal(v.pictures[0].from, undefined, `${where}: the first picture is from its own article`);
    // The interview: its context and three questions.
    assert.match(v.interview.narrator, /^Imagine that .+ telephone interview/, where);
    assert.equal(v.interview.questions.length, 3, where);
    // The graph, the caller and the three questions heard.
    const info = v.info;
    assert.ok(['table', 'bars'].includes(info.kind), where);
    if (info.kind === 'table') assert.ok(info.rows.length >= 5 && info.rows.every((r) => r.length === 2 && r[0] && r[1]), where);
    else {
      assert.ok(info.rows.length >= 2 && info.rows.every(([label, ...vals]) => label && vals.length === info.series.length), where);
      assert.ok(info.notes.length >= 2, where);
    }
    assert.ok(info.source.length > 10, where);
    assert.match(info.narrator, /^Hi, /, where);
    assert.equal(info.questions.length, 3, where);
    // (An interview question can end with a request: “Tell me about it.”)
    for (const q of v.interview.questions) assert.match(q, /\?( Tell me about (it|them)\.)?$/, q);
    for (const q of info.questions) assert.match(q, /\?$/, q);
    assert.match(v.opinion, /^Some people believe .+\?$/, where);
  }
  // Only these versions take their second picture from another article (an article with
  // one usable photo, or one whose other photos are not right for describing).
  assert.deepEqual(VERSIONS.filter((v) => v.pictures[1].from).map((v) => v.n), [4, 5, 9, 10, 11, 12]);
});

test('no two versions are alike, and no picture is used twice', () => {
  const all = (pick) => VERSIONS.flatMap(pick);
  assert.deepEqual(repeated(all((v) => [v.article.title])), []);
  assert.deepEqual(repeated(all((v) => v.read)), []);
  assert.deepEqual(repeated(all((v) => v.pictures.map((p) => p.file))), []);
  assert.deepEqual(repeated(all((v) => v.pictures.map((p) => p.alt))), []);
  assert.deepEqual(repeated(all((v) => [v.info.title])), []);
  assert.deepEqual(repeated(all((v) => v.info.questions)), []);
  assert.deepEqual(repeated(all((v) => [v.opinion])), []);
});

test('bars: values and how they are written', () => {
  assert.deepEqual(barValue(27, '%'), { v: 27, text: '27%' });
  assert.deepEqual(barValue(9250, '£'), { v: 9250, text: '£9,250' });
  assert.deepEqual(barValue(12.21, '£'), { v: 12.21, text: '£12.21' });
  assert.deepEqual(barValue(100, 'h'), { v: 100, text: '100 hours' });
  assert.deepEqual(barValue({ v: 70, text: 'almost 70%' }, '%'), { v: 70, text: 'almost 70%' });
  assert.match(infoText(VERSIONS[1].info), /^Working 25- to 34-year-olds living with their parents · Ireland: 2017 27%, 2022 40% · /);
  assert.match(infoText(VERSIONS[0].info), / · Source: The Guardian, 29 September 2026$/);
});

test('the version a student gets: the one the link names, or one by chance', () => {
  assert.equal(pickVersion('2'), 2);
  assert.equal(pickVersion(14), 14);
  assert.equal(versionOf('3').article.author, 'Carine Fouteau');
  assert.equal(versionOf(15), null);
  assert.equal(pickVersion(null, () => 0), 1);
  assert.equal(pickVersion('99', () => 0.99), 14);
  const got = new Set(Array.from({ length: 200 }, (_, i) => pickVersion(null, () => (i % 50) / 50)));
  assert.equal(got.size, 14);
});

test('the clock shows mm:ss and rounds up', () => {
  assert.equal(fmt(60), '01:00');
  assert.equal(fmt(44.2), '00:45');
  assert.equal(fmt(-1), '00:00');
});
