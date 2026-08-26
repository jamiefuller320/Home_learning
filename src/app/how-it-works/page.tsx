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
          England only. Key Stage 1. Year 1 maths. Ten topics mapped to the National Curriculum
          programme of study and, where they exist, the DfE ready-to-progress criteria. Halves,
          coins and time are included because parents meet them at home even when they are not on
          the ready-to-progress list.
        </p>
      </section>
      <section>
        <h2 className="serif text-3xl text-ink">What we are not doing yet</h2>
        <p className="mt-3">
          We are not scraping school websites, reproducing White Rose or phonics schemes, or storing
          anything about your child. Progress lives in this browser only. Other subjects, year
          groups and UK nations sit in a deferred-ideas list until this loop works.
        </p>
      </section>
      <section>
        <h2 className="serif text-3xl text-ink">If the words are muddy</h2>
        <p className="mt-3">
          At the end of the parent briefing and the home pack there is a button: “I don’t understand
          something in this section.” Testers can send, share, or copy that note — no GitHub
          account. Notes also sit in the{" "}
          <Link href="/language" className="font-semibold text-teal hover:underline">
            language log
          </Link>{" "}
          on this device.
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
        <Link href="/year-1-maths" className="font-semibold text-teal hover:underline">
          Browse the Year 1 maths topics →
        </Link>
      </p>
    </article>
  );
}
