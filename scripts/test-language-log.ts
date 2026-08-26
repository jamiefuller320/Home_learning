import assert from "node:assert/strict";
import { buildGitHubIssueUrl, buildIssueBody, buildIssueTitle } from "../src/lib/language-log";

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

console.log("Language-log helpers look good.");
