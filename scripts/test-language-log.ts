import assert from "node:assert/strict";
import {
  buildGitHubIssueUrl,
  buildIssueBody,
  buildIssueTitle,
  buildMailtoUrl,
  FEEDBACK_EMAIL,
  formatNoteForSharing,
  LANGUAGE_SECTIONS,
  LESSON_TAB_LANGUAGE_SECTION,
  SECTION_LABEL,
} from "../src/lib/language-log";

const note = {
  topicId: "counting-within-100",
  topicTitle: "Counting forwards and backwards within 100",
  section: "parent" as const,
  unclear: "What does clap once when they land mean?",
  clearer: "Clap each time they say a number in the sequence.",
  pagePath: "https://jamiefuller320.github.io/Home_learning/year-1-maths/counting-within-100/",
};

const title = buildIssueTitle(note);
assert.match(title, /^\[Language\]/);
assert.match(title, /Parent briefing/);

const body = buildIssueBody(note);
assert.match(body, /counting-within-100/);
assert.match(body, /clap once when they land/i);
assert.match(body, /Clap each time they say a number/);

const url = buildGitHubIssueUrl(note);
assert.ok(url.startsWith("https://github.com/jamiefuller320/Home_learning/issues/new?"));
assert.ok(url.includes("labels=language"));
assert.ok(url.includes(encodeURIComponent("[Language]")));

const shared = formatNoteForSharing(note);
assert.match(shared, /What was unclear/);
assert.match(shared, /clap once when they land/i);
assert.doesNotMatch(shared, /GitHub issue/);

const mailto = buildMailtoUrl(note);
assert.ok(mailto.startsWith(`mailto:${FEEDBACK_EMAIL}?`));
assert.ok(mailto.includes("subject="));

assert.deepEqual([...LANGUAGE_SECTIONS].sort(), Object.keys(SECTION_LABEL).sort());
assert.equal(SECTION_LABEL.summary, "Lesson summary");
assert.equal(SECTION_LABEL.video, "Watch video");
assert.equal(LESSON_TAB_LANGUAGE_SECTION.summary, "summary");
assert.equal(LESSON_TAB_LANGUAGE_SECTION.video, "video");
assert.equal(LESSON_TAB_LANGUAGE_SECTION.parent, "parent");
assert.equal(LESSON_TAB_LANGUAGE_SECTION.tasks, "home");
assert.equal(LESSON_TAB_LANGUAGE_SECTION.check, "home");

const summaryNote = { ...note, section: "summary" as const };
assert.match(buildIssueTitle(summaryNote), /Lesson summary/);
const videoNote = { ...note, section: "video" as const };
assert.match(buildIssueTitle(videoNote), /Watch video/);

console.log("Language-log helpers look good.");
