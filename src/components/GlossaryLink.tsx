import Link from "next/link";
import { getGlossaryTermById } from "@/content/glossary";

export function GlossaryLink({ termId, children }: { termId: string; children: React.ReactNode }) {
  const term = getGlossaryTermById(termId);

  if (!term) {
    return <>{children}</>;
  }

  return (
    <span className="glossary-term relative inline">
      <details>
        <summary className="cursor-help font-inherit text-inherit underline decoration-teal/50 decoration-dotted underline-offset-[0.2em] hover:text-teal hover:decoration-teal">
          {children}
        </summary>
        <span className="absolute bottom-full left-0 z-20 mb-2 block w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-rule bg-white p-4 text-left text-base normal-case leading-6 text-ink shadow-sm">
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
