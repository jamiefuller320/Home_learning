import Link from "next/link";
import type { Topic } from "@/content/schema";
import { DraftBadge } from "./DraftBadge";
import { GlossaryText } from "./GlossaryText";
import { HomeTasks, UnderstandingCheck } from "./HomeTasks";
import { ParentBriefing } from "./ParentBriefing";
import { PrerequisiteCallout } from "./PrerequisiteCallout";
import { ParentVideo } from "./ParentVideo";
import { LessonBinder } from "./LessonBinder";
import { Year1TopTabs } from "./Year1TopTabs";

export function TopicExperience({ topic, topics }: { topic: Topic; topics: Topic[] }) {
  const summaryPanel = (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <DraftBadge status={topic.reviewStatus} />
        <span>
          {topic.parentMinutes} min for you · {topic.homeMinutes} min together
        </span>
        {topic.readyToProgress.length > 0 ? (
          <span>Ready-to-progress {topic.readyToProgress.join(", ")}</span>
        ) : null}
      </div>

      <h1 className="serif text-4xl leading-tight text-ink sm:text-5xl">{topic.title}</h1>
      <p className="text-xl leading-8 text-ink-soft">
        <GlossaryText text={topic.summary} />
      </p>
      <p className="text-lg leading-8 text-ink">
        <GlossaryText text={topic.whyThisMatters} />
      </p>
      <PrerequisiteCallout topic={topic} topics={topics} />
    </div>
  );

  const videoPanel = topic.parentVideo ? (
    <ParentVideo src={topic.parentVideo.src} caption={topic.parentVideo.caption} />
  ) : undefined;

  return (
    <div>
      <p className="no-print mb-6 text-sm">
        <Link href="/year-1-maths" prefetch={false} className="text-teal hover:underline">
          ← All Year 1 maths topics
        </Link>
      </p>

      <Year1TopTabs
        activeId="lessons"
        sheetHeader={
          <header className="binder-sheet-head">
            <h3>{topic.shortTitle}</h3>
            <p>
              {topic.parentMinutes} min parent · {topic.homeMinutes} min home · {topic.strand}
            </p>
          </header>
        }
        sheet={
          <LessonBinder
            slug={topic.slug}
            printPackHref={`/year-1-maths/${topic.slug}/pack`}
            glossaryTermIds={topic.glossaryTerms}
            summary={summaryPanel}
            video={videoPanel}
            parentLesson={<ParentBriefing topic={topic} />}
            tasks={<HomeTasks topic={topic} />}
            check={<UnderstandingCheck topic={topic} />}
          />
        }
      />

      <aside className="no-print mt-12 text-sm leading-6 text-ink-soft">
        <h2 className="font-semibold text-ink">Sources</h2>
        <ul className="mt-2 space-y-2">
          {topic.sources.map((source) => (
            <li key={source.url}>
              <a className="underline decoration-rule underline-offset-2 hover:text-teal" href={source.url}>
                {source.label}
              </a>
              {" — "}
              {source.note}
            </li>
          ))}
        </ul>
        {topic.statutoryOutcomes.length > 0 ? (
          <div className="mt-4">
            <p className="font-semibold text-ink">Statutory outcomes this pack supports</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {topic.statutoryOutcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
