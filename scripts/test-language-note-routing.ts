import assert from "node:assert/strict";
import { classifyLanguageNote, hasApprovalIssueLink } from "../src/lib/language-note-routing";

assert.equal(
  classifyLanguageNote({
    unclear: "In the “say this” boxes I would like to be able to check my answers.",
    clearer: "Could you include a way to show the answers",
  }),
  "feature",
);

assert.equal(
  classifyLanguageNote({
    unclear: "As a caption sounds like an off-putting complex word",
    clearer: "",
  }),
  "language",
);

assert.equal(
  classifyLanguageNote({
    unclear: "The additional suggestion after “not yet” on the checks looked good on another lesson",
    clearer: "",
  }),
  "language",
);

assert.equal(
  hasApprovalIssueLink("Approval requested: https://github.com/jamiefuller320/Home_learning/issues/42"),
  true,
);

assert.equal(hasApprovalIssueLink(""), false);

console.log("language-note-routing tests passed.");
