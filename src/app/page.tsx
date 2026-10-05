import Link from "next/link";
import { year1MathsTopics } from "@/content/england/ks1/year-1/maths/topics";
import { ks2MathsTopics } from "@/content/england/ks2";

export default function HomePage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">England · Primary maths</p>
      <h1 className="serif mt-3 text-5xl leading-[1.1] text-ink sm:text-6xl">
        You learn the idea.
        <br />
        Then you sit down together.
      </h1>
      <p className="mt-6 max-w-2xl text-xl leading-8 text-ink-soft">
        A two-stage home learning system. First a short briefing so you know how school teaches it
        now. Then a 10–15 minute pack using things already in the house.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/year-1-maths"
          className="rounded-full bg-teal px-6 py-3 font-semibold text-white hover:bg-teal-deep"
        >
          Start Year 1 maths
        </Link>
        <Link
          href="/how-it-works"
          className="rounded-full border border-rule px-6 py-3 font-semibold text-ink hover:border-teal"
        >
          How this works
        </Link>
        <Link
          href="/ks2"
          className="rounded-full border border-rule px-6 py-3 font-semibold text-ink hover:border-teal"
        >
          Browse KS2 drafts
        </Link>
      </div>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl bg-white/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Coverage</p>
          <p className="serif mt-2 text-2xl">
            {year1MathsTopics.length} Year 1 · {ks2MathsTopics.length} KS2 drafts
          </p>
          <p className="mt-2 text-ink-soft">Year 1 is the first slice. Years 3–6 are a school syllabus preview.</p>
        </article>
        <article className="rounded-2xl bg-white/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Stage 1</p>
          <p className="serif mt-2 text-2xl">5–8 minutes for you</p>
          <p className="mt-2 text-ink-soft">Plain English, school method, say this, avoid this.</p>
        </article>
        <article className="rounded-2xl bg-white/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Stage 2</p>
          <p className="serif mt-2 text-2xl">10–15 minutes together</p>
          <p className="mt-2 text-ink-soft">One activity, three tiny checks, a stop rule.</p>
        </article>
      </section>
    </div>
  );
}
