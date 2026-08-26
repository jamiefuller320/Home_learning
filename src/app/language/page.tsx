import type { Metadata } from "next";
import { LanguageLog } from "@/components/LanguageLog";

export const metadata: Metadata = {
  title: "Language log",
  description: "Notes on wording that was hard to understand, ready to turn into rewrites.",
};

export default function LanguagePage() {
  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">Improvement loop</p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Language log</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        When a sentence is hard to picture, flag it. Testers can send, share, or copy the note —
        no GitHub account. We then rewrite the topic in plain English.
      </p>
      <div className="mt-10">
        <LanguageLog />
      </div>
    </article>
  );
}
