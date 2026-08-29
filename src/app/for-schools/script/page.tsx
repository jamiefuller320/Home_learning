import type { Metadata } from "next";
import Link from "next/link";
import { ParentVideoScriptViewer } from "@/components/ParentVideoScriptViewer";
import { factsWithin10 } from "@/content/england/ks1/year-1/maths/topics/facts-within-10";

export const metadata: Metadata = {
  title: "Parent video script",
  description: "Pre-production script viewer with prosody colouring and comments into the language review loop.",
  robots: { index: false, follow: false },
};

export default function ParentVideoScriptPage() {
  return (
    <article className="space-y-8">
      <p className="text-sm">
        <Link href="/for-schools" className="font-semibold text-teal hover:underline">
          ← For schools
        </Link>
      </p>
      <ParentVideoScriptViewer topic={factsWithin10} />
      <p className="text-sm text-ink-soft">
        Comments land in Supabase <code className="text-xs">language_notes</code> as section{" "}
        <code className="text-xs">parent-video</code>, then show in the maintainer inbox and language
        amendment loop. Fix wording in the topic pack, then re-preview the script.
      </p>
    </article>
  );
}
