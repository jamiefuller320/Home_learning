import { LanguageFeedback } from "@/components/LanguageFeedback";
import { GlossaryText } from "@/components/GlossaryText";
import type { Topic } from "@/content/schema";

export function ParentBriefing({ topic }: { topic: Topic }) {
  const { parentBriefing } = topic;

  return (
    <section className="space-y-8">
      <div>
        <h3 className="serif text-2xl text-ink">In plain English</h3>
        <div className="mt-3 text-lg leading-8 text-ink-soft">
          <GlossaryText text={parentBriefing.inPlainEnglish} />
        </div>
      </div>

      <div>
        <h3 className="serif text-2xl text-ink">How school typically teaches it</h3>
        <div className="mt-3 text-lg leading-8 text-ink-soft">
          <GlossaryText text={parentBriefing.howSchoolTeachesIt} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#e5efe8] p-5">
          <h3 className="font-semibold text-sage">Say this</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink">
            {parentBriefing.sayThis.map((line) => (
              <li key={line}>
                <GlossaryText text={line} />
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-[#f6e4e0] p-5">
          <h3 className="font-semibold text-clay">Avoid this</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink">
            {parentBriefing.avoidThis.map((line) => (
              <li key={line}>
                <GlossaryText text={line} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="serif text-2xl text-ink">Common mix-ups</h3>
        <div className="mt-4 space-y-4">
          {parentBriefing.commonMisconceptions.map((item) => (
            <article key={item.misconception} className="rounded-2xl border border-rule bg-white/60 p-5">
              <div className="font-semibold text-ink">
                <GlossaryText text={item.misconception} />
              </div>
              <div className="mt-2 text-ink-soft">
                <span className="font-semibold text-ink">Why: </span>
                <GlossaryText text={item.why} />
              </div>
              <div className="mt-1 text-ink-soft">
                <span className="font-semibold text-ink">Instead: </span>
                <GlossaryText text={item.instead} />
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-paper-deep px-5 py-4 text-lg leading-8 text-ink">
        <span className="font-semibold">You are ready when </span>
        <GlossaryText text={parentBriefing.youAreReadyWhen} />
      </div>

      <LanguageFeedback topic={topic} section="parent" />
    </section>
  );
}
