// The exam's format: the whole TOEIC® Speaking test, Questions 1 to 11, with
// the clocks the teacher uses. What each version asks is in versions.js (one
// version for each article); this file says how every version runs.
//
//   Questions 1–2   read a text aloud: 45 s to prepare, 45 s to read (each text)
//   Question 3      describe a picture: 30 s to prepare, 1 minute to speak
//   Questions 4–6   respond to questions: no preparation, 1 minute each
//   Questions 7–9   respond using information: 30 s to read the graph; 15 s, 15 s
//                   and 30 s to answer. The graph stays on the screen; the
//                   questions are only heard.
//   Question 10     propose a solution: 30 s to prepare, 60 s to speak
//   Question 11     express an opinion: 15 s to prepare, 60 s to speak
//
// Change a clock here and the directions the students hear and read change with it.

const secs = (s) => `${s} seconds`;
const minute = (s) => (s === 60 ? '1 minute' : secs(s));

export const READ = { prep: 45, response: 45 };
export const PICTURE = { prep: 30, response: 60 };
export const INTERVIEW = { response: 60 };
export const INFO = { read: 30, responses: [15, 15, 30] };
export const SOLUTION = { prep: 30, response: 60 };
export const OPINION = { prep: 15, response: 60 };

const [SHORT, , LONG] = INFO.responses;

export const PART_ORDER = ['read', 'picture', 'interview', 'info', 'solution', 'opinion'];

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
    label: 'Question 3',
    title: 'Describe a picture',
    directions:
      'In this part of the test, you will describe the picture on your screen in as much detail as you can. ' +
      `You will have ${secs(PICTURE.prep)} to prepare your response. Then you will have ${minute(PICTURE.response)} to speak about the picture.`,
    time: `${PICTURE.prep} s to prepare · ${minute(PICTURE.response)} to speak`,
  },
  interview: {
    label: 'Questions 4–6',
    title: 'Respond to questions',
    directions:
      'In this part of the test, you will answer three questions. For each question, begin responding immediately after you hear a beep. ' +
      `No preparation time is provided. You will have ${minute(INTERVIEW.response)} to respond to each question.`,
    time: `no preparation · ${minute(INTERVIEW.response)} to speak each`,
  },
  info: {
    label: 'Questions 7–9',
    title: 'Respond to questions using information provided',
    directions:
      'In this part of the test, you will answer three questions based on the information provided. ' +
      `You will have ${secs(INFO.read)} to read the information before the questions begin. ` +
      'The information stays on the screen until the end of this part. You will hear the questions, but you will not see them. ' +
      'For each question, begin responding immediately after you hear a beep. No additional preparation time is provided. ' +
      `You will have ${secs(SHORT)} to respond to Questions 7 and 8 and ${secs(LONG)} to respond to Question 9.`,
    time: `${INFO.read} s to read · ${INFO.responses.join(' s, ').replace(/, (\d+)$/, ' and $1')} s to speak`,
  },
  solution: {
    label: 'Question 10',
    title: 'Propose a solution',
    directions:
      'In this part of the test, you will be presented with a problem and asked to propose a solution. ' +
      `You will have ${secs(SOLUTION.prep)} to prepare. Then you will have ${secs(SOLUTION.response)} to speak. ` +
      'When the preparation time is over, the message disappears from the screen.',
    // What the answer has to do: on the screen, and spoken after the directions.
    mustDo: ['show that you recognize the problem, and', 'propose a way of dealing with the problem.'],
    time: `${SOLUTION.prep} s to prepare · ${SOLUTION.response} s to speak`,
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
  'This is the Speaking test. It has six parts and eleven questions. ' +
  'The test runs by itself: the clock shows how much time you have for each step. ' +
  'Your microphone turns on when it is time to speak and turns off when the time is up. You cannot pause or go back.';

// The recorded answers, in order, and the highest score of each (the scales of
// the TOEIC Speaking test: 0–3 for Questions 1–9, 0–5 for Questions 10 and 11).
const answer = (n, part, max) => ({ id: `q${n}`, part, label: `Question ${n}`, short: String(n), max });
export const RESPONSES = [
  answer(1, 'read', 3),
  answer(2, 'read', 3),
  answer(3, 'picture', 3),
  answer(4, 'interview', 3),
  answer(5, 'interview', 3),
  answer(6, 'interview', 3),
  answer(7, 'info', 3),
  answer(8, 'info', 3),
  answer(9, 'info', 3),
  answer(10, 'solution', 5),
  answer(11, 'opinion', 5),
];

export const TOTAL_POINTS = RESPONSES.reduce((n, r) => n + r.max, 0);

// What the student hears after the directions of Question 10.
export const solutionSpoken = (solution) =>
  `${solution.role} In your response, be sure to ${PARTS.solution.mustDo.join(' ')} Now listen to the message.`;

// Every step of the exam, in order. `scale` shortens the clocks (quick tests of the page).
//   intro     – general directions, spoken
//   part      – a part's directions, spoken (nothing to read or answer yet)
//   say       – the interviewer, a question, the caller, the voice message or the topic: spoken
//               (on the screen too, except the caller and the questions of Questions 7–9)
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
    const n = i + 1;
    steps.push({ type: 'prep', part: 'read', question: n, seconds: t(READ.prep), say: `Question ${n}. Begin preparing now.` });
    steps.push({ type: 'response', part: 'read', question: n, id: `q${n}`, seconds: t(READ.response), say: 'Begin reading aloud now.', prompt: text });
  });

  // Question 3: the picture appears when the clock starts and stays while it is described.
  steps.push({ type: 'part', part: 'picture', say: head('picture') });
  steps.push({ type: 'prep', part: 'picture', question: 3, seconds: t(PICTURE.prep), say: 'Begin preparing now.' });
  steps.push({ type: 'response', part: 'picture', question: 3, id: 'q3', seconds: t(PICTURE.response), say: 'Begin speaking now.', prompt: `Describe the picture: ${version.picture.alt}.` });

  // Questions 4–6: the interviewer, then each question (heard and shown) and its answer.
  steps.push({ type: 'part', part: 'interview', say: head('interview') });
  steps.push({ type: 'say', part: 'interview', narrator: true, say: version.interview.narrator });
  version.interview.questions.forEach((q, i) => {
    const n = 4 + i;
    steps.push({ type: 'say', part: 'interview', question: n, say: `Question ${n}. ${q}` });
    steps.push({ type: 'response', part: 'interview', question: n, id: `q${n}`, seconds: t(INTERVIEW.response), prompt: q });
  });

  // Questions 7–9: the graph appears when its reading clock starts and stays to the end
  // of the part; the caller and the questions are only heard.
  steps.push({ type: 'part', part: 'info', say: head('info') });
  steps.push({ type: 'prep', part: 'info', seconds: t(INFO.read), say: 'Begin reading now.', phase: 'Reading time', sub: 'Read', cue: 'Read the information.' });
  steps.push({ type: 'say', part: 'info', narrator: true, say: version.info.narrator });
  version.info.questions.forEach((q, i) => {
    const n = 7 + i;
    steps.push({ type: 'say', part: 'info', question: n, say: `Question ${n}. ${q}` });
    steps.push({ type: 'response', part: 'info', question: n, id: `q${n}`, seconds: t(INFO.responses[i]), prompt: q });
  });

  // Question 10: the directions and the role, the voice message, time to prepare, the answer.
  steps.push({ type: 'part', part: 'solution', say: `${head('solution')} ${solutionSpoken(version.solution)}` });
  steps.push({ type: 'say', part: 'solution', message: true, say: version.solution.message });
  steps.push({ type: 'prep', part: 'solution', message: true, seconds: t(SOLUTION.prep), say: 'Begin preparing now.' });
  steps.push({ type: 'response', part: 'solution', message: true, id: 'q10', seconds: t(SOLUTION.response), say: 'Begin speaking now.', prompt: `${version.solution.role} ${version.solution.message}` });

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
  return { picture: 'q3', solution: 'q10', opinion: 'q11' }[step.part] || null;
}

// The parts whose message or topic leaves the screen when the answer begins
// (the students had it while they listened and prepared).
export const HIDDEN_WHILE_ANSWERING = ['solution', 'opinion'];

// After a reload: start again from the question that was interrupted. A
// student who had gone past the reading time of Questions 7–9 doesn't get it
// again (the graph is back on the screen with the caller), and one who was
// already answering Question 10 or 11 goes straight back to answering it,
// without the message or the topic.
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
