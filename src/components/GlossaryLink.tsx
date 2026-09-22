"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { getGlossaryTermById } from "@/content/glossary";

export function GlossaryLink({ termId, children }: { termId: string; children: React.ReactNode }) {
  const term = getGlossaryTermById(termId);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const popupId = useId();

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    function close() {
      if (details && details.open) details.open = false;
    }

    function onPointerDown(event: PointerEvent) {
      if (!details?.open) return;
      if (details.contains(event.target as Node)) return;
      close();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    function onToggle() {
      if (!details?.open) return;
      document.querySelectorAll<HTMLDetailsElement>(".glossary-term details[open]").forEach((other) => {
        if (other !== details) other.open = false;
      });
    }

    details.addEventListener("toggle", onToggle);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      details.removeEventListener("toggle", onToggle);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!term) {
    return <>{children}</>;
  }

  return (
    <span className="glossary-term relative inline">
      <details ref={detailsRef}>
        <summary
          className="cursor-help font-inherit text-inherit underline decoration-teal/50 decoration-dotted underline-offset-[0.2em] hover:text-teal hover:decoration-teal"
          aria-controls={popupId}
        >
          {children}
        </summary>
        <span
          id={popupId}
          role="note"
          className="absolute bottom-full left-0 z-20 mb-2 block w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-rule bg-white p-4 text-left text-base normal-case leading-6 text-ink shadow-sm"
        >
          <span className="block font-semibold text-teal">{term.term}</span>
          <span className="mt-2 block text-ink-soft">{term.plainEnglish}</span>
          <Link
            href={`/year-1-maths/glossary#${term.id}`}
            prefetch={false}
            className="mt-3 inline-block text-sm font-semibold text-teal hover:underline"
          >
            Read in the glossary →
          </Link>
        </span>
      </details>
    </span>
  );
}
