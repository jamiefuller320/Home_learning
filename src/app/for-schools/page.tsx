import type { Metadata } from "next";
import Link from "next/link";
import { ParentVideo } from "@/components/ParentVideo";
import { FEEDBACK_EMAIL } from "@/lib/language-log";

export const metadata: Metadata = {
  title: "For schools",
  description: "A generated parent-briefing preview, and how a Year 1 team can help check the method.",
};

export default function ForSchoolsPage() {
  return (
    <article className="space-y-8 text-lg leading-8 text-ink-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">For Year 1 teams</p>
      <h1 className="serif text-4xl text-ink sm:text-5xl">Does this match how you teach it?</h1>
      <p>
        Home Learning is a parent-method coach, not a child app and not a rival scheme. Stage 1
        teaches the adult the current classroom method. Stage 2 is a short kitchen-table pack.
        Packs stay draft until a teacher has reviewed them.
      </p>

      <ParentVideo
        src="/videos/facts-within-10-parent-briefing-v4.mp4"
        caption="Proof of concept: a concise AI parent briefing for Number facts within 10 — method, activity outline, and evaluation criteria — then a handoff to the written pack. Example sums and asides are separate spoken beats so pacing stays natural. The pictures are our guide, ten-frame, and part–whole slides — not generated classroom footage."
      />

      <p className="text-ink-soft">
        Review the pre-production script (colour-coded by how each line is spoken) and send beat
        comments into the language inbox:{" "}
        <Link href="/for-schools/script" className="font-semibold text-teal hover:underline">
          Open script viewer →
        </Link>
      </p>

      <section>
        <h2 className="serif text-3xl text-ink">What we are asking</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-6">
          <li>Watch the preview. It should take a few minutes.</li>
          <li>
            Open the{" "}
            <Link href="/year-1-maths/facts-within-10" className="font-semibold text-teal hover:underline">
              written pack
            </Link>{" "}
            and check the method against your school.
          </li>
          <li>
            Tell us what clashes — a sentence, a prompt, or a missing picture. Use{" "}
            <Link href="/language" className="font-semibold text-teal hover:underline">
              I don’t understand
            </Link>{" "}
            on the page, or email {FEEDBACK_EMAIL}.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="serif text-3xl text-ink">How the film is made</h2>
        <p className="mt-3">
          The voice compiles a short lesson from the pack: the idea, how school teaches it, one
          mix-up, then tonight’s outline and what good looks like. It does not read every prompt
          and step — those stay on the written page for use beside the child. Example sums and
          asides (including the YouTube link reminder) are separate spoken beats so the delivery
          can change tone. We use ElevenLabs’ Charlotte voice for clearer inflection on short
          beats; punctuation and beat splits still shape the pacing. The adult guide character
          (mug, teal jumper) is the same drawing in every film — featured when there is no
          diagram, tucked in the corner when the ten-frame or part–whole picture is on screen.
          Those diagrams change when the script reaches that fact. We will not generate footage
          of children or invent a method picture that is not on the page.
        </p>
      </section>

      <section>
        <h2 className="serif text-3xl text-ink">What this is not</h2>
        <p className="mt-3">
          It is not a lesson for children to watch, not CPD, and not White Rose or a phonics
          programme. A generated voice can mis-stress a word. The page is the source. A wrong
          method is worse than no help, so we will not mark a pack reviewed from this film alone.
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
