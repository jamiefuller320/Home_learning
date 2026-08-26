"use client";

import { useEffect, useState } from "react";
import {
  buildGitHubIssueUrl,
  buildMailtoUrl,
  FEEDBACK_EMAIL,
  FORMSUBMIT_ENDPOINT,
  formatNoteForSharing,
  type LanguageNote,
} from "@/lib/language-log";
import { submitLanguageNoteToSupabase } from "@/lib/language-notes-api";

type SendState = "idle" | "sending" | "sent" | "failed";
type SentVia = "inbox" | "email";

export function NoteSendActions({
  note,
  autoSend = false,
}: {
  note: LanguageNote;
  autoSend?: boolean;
}) {
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sentVia, setSentVia] = useState<SentVia>("inbox");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const shareText = formatNoteForSharing(note);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function sendToInbox() {
    setSendState("sending");
    try {
      const stored = await submitLanguageNoteToSupabase(note);
      if (stored.ok) {
        setSentVia("inbox");
        setSendState("sent");
        return;
      }

      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `[Language] ${note.topicTitle}`,
          _template: "box",
          _captcha: "false",
          topic: note.topicTitle,
          section: note.section,
          unclear: note.unclear,
          clearer: note.clearer || "(none suggested)",
          page: note.pagePath,
        }),
      });
      if (!response.ok) throw new Error("send failed");
      setSentVia("email");
      setSendState("sent");
    } catch {
      setSendState("failed");
    }
  }

  useEffect(() => {
    if (!autoSend) return;
    void sendToInbox();
    // Send once when this note is first saved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend, note.id]);

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function shareNote() {
    try {
      await navigator.share({
        title: `Language note: ${note.topicTitle}`,
        text: shareText,
      });
      setShared(true);
    } catch {
      setShared(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-ink-soft">
        No GitHub account needed. Send the note to the team, or share/copy it.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={sendToInbox}
          disabled={sendState === "sending" || sendState === "sent"}
          className="rounded-full bg-teal px-4 py-2 font-semibold text-white hover:bg-teal-deep disabled:bg-rule"
        >
          {sendState === "sending" ? "Sending…" : sendState === "sent" ? "Sent to the team" : "Send to the team"}
        </button>
        {canShare ? (
          <button
            type="button"
            onClick={shareNote}
            className="rounded-full border border-rule px-4 py-2 hover:border-teal"
          >
            {shared ? "Shared" : "Share note"}
          </button>
        ) : null}
        <button type="button" onClick={copyNote} className="rounded-full border border-rule px-4 py-2 hover:border-teal">
          {copied ? "Copied" : "Copy note"}
        </button>
        <a href={buildMailtoUrl(note)} className="rounded-full border border-rule px-4 py-2 hover:border-teal">
          Email instead
        </a>
      </div>
      {sendState === "sent" ? (
        <p className="text-sm text-sage">
          {sentVia === "inbox"
            ? "The team has your note. We’ll use it to clear up the wording."
            : `The note is on its way to ${FEEDBACK_EMAIL}.`}
        </p>
      ) : null}
      {sendState === "failed" ? (
        <p className="text-sm text-clay">
          Direct send did not go through. Use Share, Copy, or Email — still no GitHub needed.
        </p>
      ) : null}
      <p className="text-sm">
        <button type="button" className="text-ink-soft underline" onClick={() => setShowGithub((value) => !value)}>
          {showGithub ? "Hide maintainer option" : "Maintainer option: GitHub issue"}
        </button>
      </p>
      {showGithub ? (
        <a
          href={buildGitHubIssueUrl(note)}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm text-ink-soft underline"
        >
          Open as a GitHub issue
        </a>
      ) : null}
    </div>
  );
}
