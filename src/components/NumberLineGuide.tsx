import type { NumberLineGuide as NumberLineGuideData } from "@/content/schema";

export function NumberLineGuide({ guide }: { guide: NumberLineGuideData }) {
  const span = guide.end - guide.start;

  return (
    <figure className="mt-5 rounded-2xl bg-paper-deep px-4 py-5">
      <div
        className="relative mx-2 h-14"
        role="img"
        aria-label={guide.caption}
      >
        <div className="absolute left-0 right-0 top-2 border-t-2 border-ink" />
        {guide.marks.map((mark) => {
          const left = ((mark - guide.start) / span) * 100;
          return (
            <div
              key={mark}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${left}%` }}
            >
              <div className="mx-auto h-4 w-0.5 bg-ink" />
              <p className="mt-1 text-center text-sm font-semibold text-ink">{mark}</p>
            </div>
          );
        })}
      </div>
      <figcaption className="mt-3 text-sm text-ink-soft">{guide.caption}</figcaption>
    </figure>
  );
}
