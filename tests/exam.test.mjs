import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import {
  PARTS, PART_ORDER, RESPONSES, CRITERIA, READ, PICTURE, INTERVIEW, INFO, SOLUTION, OPINION, TOTAL_POINTS,
  buildTimeline, timedSeconds, aboutMinutes, responseOf, solutionSpoken, resumeIndex,
} from '../js/format.js';
import { VERSIONS, versionOf, pickVersion, barValue, infoText } from '../js/versions.js';
import { fmt } from '../js/clock.js';

const repeated = (list) => list.filter((x, i) => list.indexOf(x) !== i);
const words = (s) => s.match(/[A-Za-zÀ-ÿ0-9’'€£$%,.-]+/g) || [];
const steps = (v = VERSIONS[0], opts) => buildTimeline(v, opts);

test('the whole test: Questions 1–11 with the clocks of the ETS sample test', () => {
  assert.deepEqual(READ, { prep: 45, response: 45 });
  assert.deepEqual(PICTURE, { prep: 30, response: 45 });
  assert.deepEqual(INTERVIEW, { responses: [15, 15, 30] });
  assert.deepEqual(INFO, { read: 30, responses: [15, 15, 30] });
  assert.deepEqual(SOLUTION, { prep: 30, response: 60 });
  assert.deepEqual(OPINION, { prep: 15, response: 60 });
  for (const v of VERSIONS) {
    const s = steps(v);
    assert.deepEqual(
      s.filter((x) => x.seconds).map((x) => `${x.type}:${x.id || x.part}:${x.seconds}`),
      [
        'prep:read:45', 'response:q1:45', 'prep:read:45', 'response:q2:45',
        'prep:picture:30', 'response:q3:45',
        'response:q4:15', 'response:q5:15', 'response:q6:30',
        'prep:info:30', 'response:q7:15', 'response:q8:15', 'response:q9:30',
        'prep:solution:30', 'response:q10:60',
        'prep:opinion:15', 'response:q11:60',
      ],
      `version ${v.n}`,
    );
    assert.equal(timedSeconds(s), 570);
    assert.deepEqual(s.filter((x) => x.type === 'response').map((x) => x.id), RESPONSES.map((r) => r.id));
  }
  assert.deepEqual(PART_ORDER, ['read', 'picture', 'interview', 'info', 'solution', 'opinion']);
  assert.deepEqual(steps().filter((x) => x.type === 'part').map((x) => x.part), PART_ORDER);
});

test('eleven recorded answers scored with the course’s scoring guide: 54 points', () => {
  assert.deepEqual(RESPONSES.map((r) => r.id), ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11']);
  assert.deepEqual(RESPONSES.map((r) => r.part), ['read', 'read', 'picture', 'interview', 'interview', 'interview', 'info', 'info', 'info', 'solution', 'opinion']);
  // Questions 1–2: 5 + 5 (two criteria, both readings) · 3: 10 · 4–6: 5 each · 7–9: 3 each · 10 and 11: 5 each.
  assert.deepEqual(RESPONSES.map((r) => r.max), [5, 5, 10, 5, 5, 5, 3, 3, 3, 5, 5]);
  assert.equal(TOTAL_POINTS, 54);
  for (const r of RESPONSES) assert.match(r.id, /^[\w-]+$/);
  // The answers whose score needs saying what goes in it: one criterion of both readings, or the picture's three.
  assert.match(RESPONSES[0].scoring, /both readings: pronunciation and intelligibility/);
  assert.match(RESPONSES[1].scoring, /both readings: stress, intonation, rhythm, and pausing/);
  assert.match(RESPONSES[2].scoring, /\(0–4\) \+ .*\(0–3\) \+ .*\(0–3\)/);
  assert.deepEqual(RESPONSES.slice(3).map((r) => r.scoring), Array(8).fill(''));
});

test('the directions say the same clocks, and what is heard but not seen', () => {
  assert.match(PARTS.read.directions, /You will have 45 seconds to prepare\. Then you will have 45 seconds to read the text aloud\. There are two texts\.$/);
  assert.match(PARTS.picture.directions, /^In this part of the test, you will describe the picture on your screen in as much detail as you can\. You will have 30 seconds to prepare your response\. Then you will have 45 seconds to speak about the picture\.$/);
  assert.equal(PARTS.interview.directions, 'In this part of the test, you will answer three questions. For each question, begin responding immediately after you hear a beep. ' +
    'No preparation time is provided. You will have 15 seconds to respond to Questions 4 and 5, and 30 seconds to respond to Question 6.');
  assert.equal(PARTS.interview.time, 'no preparation · 15 s, 15 s and 30 s to speak');
  assert.equal(PARTS.info.time, '30 s to read · 15 s, 15 s and 30 s to speak');
  assert.match(PARTS.info.directions, /You will have 30 seconds to read the information before the questions begin\. The information stays on the screen until the end of this part\. You will hear the questions, but you will not see them\./);
  assert.match(PARTS.info.directions, /You will have 15 seconds to respond to Questions 7 and 8 and 30 seconds to respond to Question 9\.$/);
  assert.match(PARTS.solution.directions, /You will have 30 seconds to prepare\. Then you will have 60 seconds to speak\. When the preparation time is over, the message disappears from the screen\.$/);
  assert.match(PARTS.opinion.directions, /You will have 15 seconds to prepare\. Then you will have 60 seconds to speak\. When the preparation time is over, the topic disappears from the screen\./);
  // The general directions of the sample test, with how long this test takes.
  const s = steps();
  assert.match(s[0].say, /^This is the Speaking test\. This test includes 11 questions that measure different aspects of your speaking ability\. The test lasts approximately \d+ minutes\. For each type of question, you will be given specific directions, including the time allowed for preparation and speaking\. It is to your advantage to say as much as you can in the time allowed\. It is also important that you speak clearly and that you answer each question according to the directions\./);
  assert.ok(s[0].say.includes(`approximately ${aboutMinutes(s)} minutes`));
  for (const v of VERSIONS) assert.ok(aboutMinutes(steps(v)) >= 15 && aboutMinutes(steps(v)) <= 20, `version ${v.n}: ${aboutMinutes(steps(v))} minutes`);
});

test('the table of the general directions: each task and what it is evaluated on', () => {
  // The same parts, in the same order, as the test.
  assert.deepEqual(CRITERIA.map(([q, task]) => [`Question${q.includes('–') ? 's' : ''} ${q}`, task]), PART_ORDER.map((id) => [PARTS[id].label, PARTS[id].title]));
  assert.deepEqual(CRITERIA[0][2], ['pronunciation', 'intonation and stress']);
  assert.deepEqual(CRITERIA[1][2], ['all of the above, plus', 'grammar', 'vocabulary', 'cohesion']);
  assert.deepEqual(CRITERIA[2][2], ['all of the above, plus', 'relevance of content', 'completeness of content']);
  assert.ok(CRITERIA.slice(3).every(([, , c]) => c.length === 1 && c[0] === 'all of the above'));
});

test('Questions 1–2 and 3: the text or the picture comes with its clock', () => {
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
  assert.deepEqual(s.slice(pic + 1, pic + 3).map((x) => [x.type, x.seconds]), [['prep', 30], ['response', 45]]);
  assert.equal(s[pic + 2].prompt, `Describe the picture: ${v.picture.alt}.`);
});

test('Questions 4–6: the interviewer, then each question and its answer, with no preparation', () => {
  const v = VERSIONS[4];
  const s = steps(v);
  const at = s.findIndex((x) => x.type === 'part' && x.part === 'interview');
  assert.deepEqual(s.slice(at + 1, at + 8).map((x) => [x.type, x.question || (x.narrator ? 'interviewer' : '')]), [
    ['say', 'interviewer'], ['say', 4], ['response', 4], ['say', 5], ['response', 5], ['say', 6], ['response', 6],
  ]);
  assert.equal(s[at + 1].say, v.interview.narrator);
  assert.equal(s[at + 2].say, `Question 4. ${v.interview.questions[0]}`);
  // "Begin responding immediately after you hear a beep": nothing is said before the answer.
  assert.equal(s[at + 3].say, undefined);
  // 15 seconds for Questions 4 and 5, 30 for Question 6.
  assert.deepEqual(s.filter((x) => x.part === 'interview' && x.type === 'response').map((x) => x.seconds), [15, 15, 30]);
});

test('Questions 7–9: the reading clock, the caller, then each question (heard) and its answer', () => {
  const v = VERSIONS[1];
  const s = steps(v);
  const at = s.findIndex((x) => x.type === 'part' && x.part === 'info');
  assert.deepEqual(s.slice(at + 1, at + 9).map((x) => [x.type, x.question || (x.narrator ? 'caller' : '')]), [
    ['prep', ''], ['say', 'caller'], ['say', 7], ['response', 7], ['say', 8], ['response', 8], ['say', 9], ['response', 9],
  ]);
  assert.equal(s[at + 1].phase, 'Reading time');
  assert.equal(s[at + 2].say, v.info.narrator);
  assert.equal(s[at + 3].say, `Question 7. ${v.info.questions[0]}`);
  assert.equal(s[at + 4].say, undefined);
});

test('Questions 10 and 11: heard and prepared before the answer', () => {
  const v = VERSIONS[6];
  const s = steps(v);
  const sol = s.findIndex((x) => x.type === 'part' && x.part === 'solution');
  assert.ok(s[sol].say.endsWith(solutionSpoken(v.solution)));
  assert.deepEqual(s.slice(sol + 1, sol + 4).map((x) => [x.type, x.say]), [
    ['say', v.solution.message], ['prep', 'Begin preparing now.'], ['response', 'Begin speaking now.'],
  ]);
  const op = s.findIndex((x) => x.type === 'part' && x.part === 'opinion');
  assert.deepEqual(s.slice(op + 1).map((x) => [x.type, x.say]), [
    ['say', v.opinion], ['prep', 'Begin preparing now.'], ['response', 'Begin speaking now.'],
  ]);
  assert.equal(s.at(-1).prompt, v.opinion);
});

test('every step knows the answer it belongs to', () => {
  const s = steps();
  assert.equal(responseOf(s[0]), null);
  assert.equal(responseOf(s.find((x) => x.type === 'part' && x.part === 'read')), null);
  assert.equal(responseOf(s.find((x) => x.type === 'prep' && x.question === 2)), 'q2');
  assert.equal(responseOf(s.find((x) => x.type === 'prep' && x.part === 'picture')), 'q3');
  assert.equal(responseOf(s.find((x) => x.type === 'say' && x.question === 5)), 'q5');
  assert.equal(responseOf(s.find((x) => x.type === 'part' && x.part === 'solution')), 'q10');
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
  // Questions 4–6: the question is heard again.
  assert.equal(resumeIndex(s, done('q1', 'q2', 'q3', 'q4'), at('q5')), at('q4') + 1);
  // Reloaded after the reading time of Questions 7–9: on to the caller, without a second reading time.
  const before7 = done('q1', 'q2', 'q3', 'q4', 'q5', 'q6');
  assert.equal(resumeIndex(s, before7, read), at('q6') + 1);
  assert.equal(resumeIndex(s, before7, read + 1), read + 1);
  assert.equal(resumeIndex(s, before7, at('q7')), read + 1);
  // Reloaded while answering Question 10 or 11: straight back to answering; while preparing: from the start of it.
  const before10 = [...before7, 'q7', 'q8', 'q9'];
  assert.equal(resumeIndex(s, before10, at('q10')), at('q10'));
  assert.equal(resumeIndex(s, before10, at('q10') - 1), at('q9') + 1);
  assert.equal(resumeIndex(s, [...before10, 'q10'], at('q11')), at('q11'));
  assert.equal(s[at('q10')].say, 'Begin speaking now.', 'the answer starts with its cue and the beep');
});

test('the quick demo shortens every clock but keeps at least 3 seconds', () => {
  assert.deepEqual(steps(VERSIONS[0], { scale: 0.1 }).filter((x) => x.seconds).map((x) => x.seconds), [5, 5, 5, 5, 3, 5, 3, 3, 3, 3, 3, 3, 3, 3, 6, 3, 6]);
  assert.ok(steps(VERSIONS[0], { scale: 0.01 }).filter((x) => x.seconds).every((x) => x.seconds === 3));
});

test('fourteen versions, one for each article, with everything the format needs', () => {
  assert.equal(VERSIONS.length, 14);
  assert.deepEqual(VERSIONS.map((v) => v.n), Array.from({ length: 14 }, (_, i) => i + 1));
  for (const v of VERSIONS) {
    const where = `version ${v.n}`;
    assert.ok(v.article.title && v.article.outlet && v.article.author && /\d{4}$/.test(v.article.date), where);
    // Two passages to read aloud, each short enough for 45 seconds.
    assert.equal(v.read.length, 2, where);
    for (const t of v.read) {
      const n = words(t).length;
      assert.ok(n >= 40 && n <= 80, `${where}: a text of ${n} words`);
    }
    // The article's picture, in the repository, with its credit.
    const img = new URL(`../img/${v.picture.file}`, import.meta.url);
    assert.ok(existsSync(img), `${where}: img/${v.picture.file}`);
    assert.ok(statSync(img).size < 300 * 1024, `${where}: the picture is small enough`);
    assert.equal(v.picture.file, `v${String(v.n).padStart(2, '0')}.jpg`);
    assert.match(v.picture.credit, /^(Photograph|Illustration): /, where);
    assert.ok(v.picture.alt.length > 20, where);
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
    // The problem: a role, and a message from someone with a name who asks for a call back.
    assert.match(v.solution.role, /^Respond as if you (work|are) .+\.$/, where);
    assert.match(v.solution.message, /^Hi, this is [A-ZÁÉÍÓÚ][a-zá-ú]+ [A-Z][a-z]+(\s|\.)/, where);
    assert.match(v.solution.message, /call me back/, where);
    const m = words(v.solution.message).length;
    assert.ok(m >= 60 && m <= 95, `${where}: the message has ${m} words`);
    assert.match(v.opinion, /^Some people believe .+\?$/, where);
  }
});

test('no two versions are alike', () => {
  const all = (pick) => VERSIONS.flatMap(pick);
  assert.deepEqual(repeated(all((v) => [v.article.title])), []);
  assert.deepEqual(repeated(all((v) => v.read)), []);
  assert.deepEqual(repeated(all((v) => [v.picture.file])), []);
  assert.deepEqual(repeated(all((v) => [v.info.title])), []);
  assert.deepEqual(repeated(all((v) => v.info.questions)), []);
  assert.deepEqual(repeated(all((v) => [v.solution.role])), []);
  assert.deepEqual(repeated(all((v) => [v.solution.message])), []);
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
