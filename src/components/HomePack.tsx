import { LanguageFeedback } from "@/components/LanguageFeedback";
import { NumberLineGuide } from "@/components/NumberLineGuide";
import type { Topic } from "@/content/schema";

export function HomePack({ topic }: { topic: Topic }) {
  const { homePack } = topic;

  return (
    <section className="print-pack space-y-8">
      <div>
        <h3 className="serif text-2xl text-ink">What you need</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-lg text-ink-soft">
          {topic.householdItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="serif text-2xl text-ink">Set up</h3>
        <p className="mt-3 text-lg leading-8 text-ink-soft">{homePack.setup}</p>
      </div>

      <div className="rounded-2xl border border-teal/30 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Tonight’s activity</p>
        <h3 className="serif mt-2 text-3xl text-ink">{homePack.activity.title}</h3>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-lg leading-8 text-ink">
          {homePack.activity.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {homePack.activity.numberLine ? <NumberLineGuide guide={homePack.activity.numberLine} /> : null}
        {homePack.activity.tip ? (
          <p className="mt-5 border-t border-rule pt-4 text-ink-soft">
            <span className="font-semibold text-ink">Tip: </span>
            {homePack.activity.tip}
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="serif text-2xl text-ink">Three tiny checks</h3>
        <p className="mt-2 text-ink-soft">Not a test. Just a look at whether the idea landed.</p>
        <div className="mt-4 space-y-4">
          {homePack.check.map((item, index) => (
            <article key={item.prompt} className="rounded-2xl border border-rule bg-white/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Check {index + 1}</p>
              <p className="mt-2 text-lg font-semibold text-ink">{item.prompt}</p>
              <p className="mt-3 text-ink-soft">
                <span className="font-semibold text-sage">Looks like: </span>
                {item.looksLike}
              </p>
              <p className="mt-1 text-ink-soft">
                <span className="font-semibold text-clay">Not yet: </span>
                {item.notYet}
              </p>
              {item.nudge ? (
                <p className="mt-2 text-ink-soft">
                  <span className="font-semibold text-ink">Try this: </span>
                  {item.nudge}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      {homePack.stretch ? (
        <p className="text-lg leading-8 text-ink-soft">
          <span className="font-semibold text-ink">If they are still keen: </span>
          {homePack.stretch}
        </p>
      ) : null}

      <p className="rounded-2xl bg-[#f6e4e0] px-5 py-4 text-lg leading-8 text-ink">
        <span className="font-semibold">Stop when </span>
        {homePack.stopRule}
      </p>

      <LanguageFeedback topic={topic} section="home" />
    </section>
  );
}
