// The exam's format: the TOEIC® Speaking test, Questions 1 to 11, with the
// clocks the teacher uses. What each version asks is in versions.js (one
// version for each article); this file says how every version runs.
//
//   Questions 1–2   read a text aloud: 45 s to prepare, 45 s to read (each text)
//   Questions 3–4   describe a picture: 30 s to prepare, 1 minute to speak (each picture)
//   Questions 5–7   respond to questions: no preparation, 1 minute each
//   Questions 8–10  respond using information: 30 s to read the graph; 15 s, 15 s
//                   and 30 s to answer. The graph stays on the screen; the
//                   questions are only heard.
//   Question 11     express an opinion: 15 s to prepare, 60 s to speak
//
// Change a clock here and the directions the students hear and read change with it.

const secs = (s) => `${s} seconds`;
const minute = (s) => (s === 60 ? '1 minute' : secs(s));

export const READ = { prep: 45, response: 45 };
export const PICTURE = { prep: 30, response: 60 };
export const INTERVIEW = { response: 60 };
export const INFO = { read: 30, responses: [15, 15, 30] };
export const OPINION = { prep: 15, response: 60 };

const [SHORT, , LONG] = INFO.responses;

export const PART_ORDER = ['read', 'picture', 'interview', 'info', 'opinion'];

export const PARTS = {
  read: {
    label: 'Questions 1–2',
    title: 'Read a text aloud',
    directions:
      'In this part of the test, you will read aloud the text on the screen. ' +
      `You will have ${secs(READ.prep)} to prepare. Then you will have ${secs(READ.response)} to read the text aloud. There are two texts.`,
    time: `two texts · ${READ.prep} s to prepare · ${READ.response} s to read each`,
  },
  picture: {
    label: 'Questions 3–4',
    title: 'Describe a picture',
    directions:
      'In this part of the test, you will describe the picture on your screen in as much detail as you can. ' +
      `You will have ${secs(PICTURE.prep)} to prepare your response. Then you will have ${minute(PICTURE.response)} to speak about the picture. There are two pictures.`,
    time: `two pictures · ${PICTURE.prep} s to prepare · ${minute(PICTURE.response)} to speak about each`,
  },
  interview: {
    label: 'Questions 5–7',
    title: 'Respond to questions',
    directions:
      'In this part of the test, you will answer three questions. For each question, begin responding immediately after you hear a beep. ' +
      `No preparation time is provided. You will have ${minute(INTERVIEW.response)} to respond to each question.`,
    time: `no preparation · ${minute(INTERVIEW.response)} to speak each`,
  },
  info: {
    label: 'Questions 8–10',
    title: 'Respond to questions using information provided',
    directions:
      'In this part of the test, you will answer three questions based on the information provided. ' +
      `You will have ${secs(INFO.read)} to read the information before the questions begin. ` +
      'The information stays on the screen until the end of this part. You will hear the questions, but you will not see them. ' +
      'For each question, begin responding immediately after you hear a beep. No additional preparation time is provided. ' +
      `You will have ${secs(SHORT)} to respond to Questions 8 and 9 and ${secs(LONG)} to respond to Question 10.`,
    time: `${INFO.read} s to read · ${INFO.responses.join(' s, ').replace(/, (\d+)$/, ' and $1')} s to speak`,
  },
  opinion: {
    label: 'Question 11',
    title: 'Express an opinion',
    directions:
      'In this part of the test, you will give your opinion about a specific topic. Be sure to say as much as you can in the time allowed. ' +
      `You will have ${secs(OPINION.prep)} to prepare. Then you will have ${secs(OPINION.response)} to speak. ` +
      'When the preparation time is over, the topic disappears from the screen. Give reasons and examples to support your opinion.',
    time: `${OPINION.prep} s to prepare · ${OPINION.response} s to speak`,
  },
};

export const INTRO =
  'This is the Speaking test. It has five parts and eleven questions. ' +
  'The test runs by itself: the clock shows how much time you have for each step. ' +
  'Your microphone turns on when it is time to speak and turns off when the time is up. You cannot pause or go back.';

// The recorded answers, in order, and the highest score of each: the course's
// scoring guide for the whole test (59 points; the teacher's script has it on
// its «Rubric» tab). Questions 1–2 are scored together, both readings, on two
// criteria: pronunciation goes in Question 1's score and stress and intonation
// in Question 2's. Each picture's score adds three criteria (4 + 3 + 3).
// `scoring` says so next to the score of those answers on the teacher's sheet.
const answer = (n, part, max, scoring = '') => ({ id: `q${n}`, part, label: `Question ${n}`, short: String(n), max, scoring });
const PICTURE_SCORE = 'This picture: relevant details and task fulfillment (0–4) + delivery, fluency, and intelligibility (0–3) + vocabulary and grammatical structures (0–3).';
export const RESPONSES = [
  answer(1, 'read', 5, 'Questions 1–2, both readings: pronunciation and intelligibility.'),
  answer(2, 'read', 5, 'Questions 1–2, both readings: stress, intonation, rhythm, and pausing.'),
  answer(3, 'picture', 10, PICTURE_SCORE),
  answer(4, 'picture', 10, PICTURE_SCORE),
  answer(5, 'interview', 5),
  answer(6, 'interview', 5),
  answer(7, 'interview', 5),
  answer(8, 'info', 3),
  answer(9, 'info', 3),
  answer(10, 'info', 3),
  answer(11, 'opinion', 5),
];

export const TOTAL_POINTS = RESPONSES.reduce((n, r) => n + r.max, 0);

// Every step of the exam, in order. `scale` shortens the clocks (quick tests of the page).
//   intro     – general directions, spoken
//   part      – a part's directions, spoken (nothing to read or answer yet)
//   say       – the interviewer, a question, the caller or the topic: spoken
//               (on the screen too, except the caller and the questions of Questions 8–10)
//   prep      – time on the clock to read or to prepare: the text, the picture or the
//               graph appears when the clock starts
//   response  – the microphone records for `seconds`
export function buildTimeline(version, { scale = 1 } = {}) {
  const t = (s) => Math.max(3, Math.round(s * scale));
  const head = (id) => `${PARTS[id].label}. ${PARTS[id].title}. ${PARTS[id].directions}`;
  const steps = [{ type: 'intro', say: INTRO }];

  // Questions 1–2: each text appears when its clock starts and stays while it is read.
  steps.push({ type: 'part', part: 'read', say: head('read') });
  version.read.forEach((text, i) => {
    const n = 1 + i;
    steps.push({ type: 'prep', part: 'read', question: n, seconds: t(READ.prep), say: `Question ${n}. Begin preparing now.` });
    steps.push({ type: 'response', part: 'read', question: n, id: `q${n}`, seconds: t(READ.response), say: 'Begin reading aloud now.', prompt: text });
  });

  // Questions 3–4: each picture appears when its clock starts and stays while it is described.
  steps.push({ type: 'part', part: 'picture', say: head('picture') });
  version.pictures.forEach((picture, i) => {
    const n = 3 + i;
    steps.push({ type: 'prep', part: 'picture', question: n, picture: i, seconds: t(PICTURE.prep), say: `Question ${n}. Begin preparing now.` });
    steps.push({ type: 'response', part: 'picture', question: n, picture: i, id: `q${n}`, seconds: t(PICTURE.response), say: 'Begin speaking now.', prompt: `Describe the picture: ${picture.alt}.` });
  });

  // Questions 5–7: the interviewer, then each question (heard and shown) and its answer.
  steps.push({ type: 'part', part: 'interview', say: head('interview') });
  steps.push({ type: 'say', part: 'interview', narrator: true, say: version.interview.narrator });
  version.interview.questions.forEach((q, i) => {
    const n = 5 + i;
    steps.push({ type: 'say', part: 'interview', question: n, say: `Question ${n}. ${q}` });
    steps.push({ type: 'response', part: 'interview', question: n, id: `q${n}`, seconds: t(INTERVIEW.response), prompt: q });
  });

  // Questions 8–10: the graph appears when its reading clock starts and stays to the end
  // of the part; the caller and the questions are only heard.
  steps.push({ type: 'part', part: 'info', say: head('info') });
  steps.push({ type: 'prep', part: 'info', seconds: t(INFO.read), say: 'Begin reading now.', phase: 'Reading time', sub: 'Read', cue: 'Read the information.' });
  steps.push({ type: 'say', part: 'info', narrator: true, say: version.info.narrator });
  version.info.questions.forEach((q, i) => {
    const n = 8 + i;
    steps.push({ type: 'say', part: 'info', question: n, say: `Question ${n}. ${q}` });
    steps.push({ type: 'response', part: 'info', question: n, id: `q${n}`, seconds: t(INFO.responses[i]), prompt: q });
  });

  // Question 11: the topic, time to prepare, the answer.
  steps.push({ type: 'part', part: 'opinion', say: head('opinion') });
  steps.push({ type: 'say', part: 'opinion', topic: true, say: version.opinion });
  steps.push({ type: 'prep', part: 'opinion', topic: true, seconds: t(OPINION.prep), say: 'Begin preparing now.' });
  steps.push({ type: 'response', part: 'opinion', topic: true, id: 'q11', seconds: t(OPINION.response), say: 'Begin speaking now.', prompt: version.opinion });
  return steps;
}

// How long the exam takes, in seconds, not counting the spoken directions.
export function timedSeconds(steps) {
  return steps.reduce((n, s) => n + (s.seconds || 0), 0);
}

// The recorded answer a step belongs to (the one being asked, prepared or recorded), or null.
export function responseOf(step) {
  if (step.id) return step.id;
  if (step.question) return `q${step.question}`;
  return step.part === 'opinion' ? 'q11' : null;
}

// The parts whose topic leaves the screen when the answer begins (the students
// had it while they listened and prepared).
export const HIDDEN_WHILE_ANSWERING = ['opinion'];

// After a reload: start again from the question that was interrupted. A
// student who had gone past the reading time of Questions 8–10 doesn't get it
// again (the graph is back on the screen with the caller), and one who was
// already answering Question 11 goes straight back to answering it, without
// the topic.
export function resumeIndex(steps, done, reached = 0) {
  let last = -1;
  steps.forEach((s, i) => s.type === 'response' && done.includes(s.id) && (last = i));
  const at = last + 1;
  const read = steps.findIndex((s) => s.type === 'prep' && s.part === 'info');
  if (read >= 0 && reached > read && at <= read) return read + 1;
  const next = steps.findIndex((s, i) => i >= at && s.type === 'response');
  if (next >= 0 && reached >= next && HIDDEN_WHILE_ANSWERING.includes(steps[next].part)) return next;
  return at;
}
