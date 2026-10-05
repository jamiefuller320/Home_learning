import Link from "next/link";
import type { Topic } from "@/content/schema";
import { yearMathsHref } from "@/lib/topic-path";

export function SuspendedLesson({ topic }: { topic: Topic }) {
  return (
    <article className="rounded-2xl border border-clay/30 bg-[#f6e4e0] p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Temporarily unavailable</p>
      <h1 className="serif mt-3 text-4xl text-ink">{topic.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        This lesson has been withdrawn while we fix something. The pack is still in the repo for maintainers, but it
        is hidden from the public lesson list until we restore it.
      </p>
      <Link href={yearMathsHref(topic.year)} className="mt-6 inline-block text-teal underline">
        Back to this year’s lessons
      </Link>
    </article>
  );
}
