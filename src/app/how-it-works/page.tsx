import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
};

export default function HowItWorksPage() {
  return (
    <article className="space-y-8 text-lg leading-8 text-ink-soft">
      <h1 className="serif text-4xl text-ink sm:text-5xl">How it works</h1>
      <p>
        This is not another worksheet site, and it is not a child app. It is a parent-method coach
        with a small pack attached.
      </p>
      <section>
        <h2 className="serif text-3xl text-ink">The two stages</h2>
        <p className="mt-3">
          Stage 1 is for you. It tells you what the idea is, how Year 1 classrooms usually teach it
          now, the words that help, and the methods that clash. Stage 2 is for both of you: one
          activity, household objects, three tiny checks, and a stop rule.
        </p>
      </section>
      <section>
        <h2 className="serif text-3xl text-ink">What this first slice covers</h2>
        <p className="mt-3">
          England Year 1 maths is the first slice. There is also a draft KS2 map: Years 3–6 maths
          packs covering the National Curriculum programme of study, so a school can see the shape
          of a parent lesson through the end of Year 6. Those packs stay draft until a teacher checks them.
        </p>
      </section>
      <section>
        <h2 className="serif text-3xl text-ink">What we are not doing yet</h2>
        <p className="mt-3">
          We are not scraping school websites, reproducing White Rose or phonics schemes, or storing
          anything about your child. Progress lives in this browser only. Year 2, other subjects and
          UK nations sit in a deferred-ideas list. KS2 maths exists here as a draft syllabus preview.
        </p>
      </section>
      <section>
        <h2 className="serif text-3xl text-ink">If the words are muddy</h2>
        <p className="mt-3">
          At the bottom of every lesson tab there is a button: “I don’t understand something in this
          section.” Testers can send, share, or copy that note — no GitHub account. Notes also sit
          in the{" "}
          <Link href="/language" className="font-semibold text-teal hover:underline">
            language log
          </Link>{" "}
          on this device.
        </p>
      </section>
      <section>
        <h2 className="serif text-3xl text-ink">A watchable briefing</h2>
        <p className="mt-3">
          One pack has a generated reading of the written Stage 1, aimed at tired parents and at
          teachers checking the method. The page stays the source. See{" "}
          <Link href="/for-schools" className="font-semibold text-teal hover:underline">
            for schools
          </Link>
          .
        </p>
      </section>
      <section>
        <h2 className="serif text-3xl text-ink">Draft on purpose</h2>
        <p className="mt-3">
          A wrong method is worse than no help. Every pack is marked draft until a teacher or
          subject specialist has reviewed it. If something clashes with how your school teaches,
          follow the school.
        </p>
      </section>
      <p>
        <Link href="/ks2" className="font-semibold text-teal hover:underline">
          Browse the KS2 draft syllabus →
        </Link>
      </p>
    </article>
  );
}
