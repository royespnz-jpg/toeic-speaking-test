/* ── Speaking Test · parte 2 de 6 ── */

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

/* ── fin de la parte 2 de 6 ── */
