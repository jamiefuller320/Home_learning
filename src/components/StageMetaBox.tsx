/**
 * Standard When / Why / Equipment strip used above Stage 1 and Stage 2.
 * Restyle via the `stage-meta-box` class (globals) or the classes on this component.
 */

import { PackProse } from "@/components/PackProse";

export type StageMeta = {
  when: string;
  why: string;
  equipment: string;
};

export type StageMetaField = { key: keyof StageMeta; label: string };

export type StageMetaConfig = StageMeta & { stage: 1 | 2 };

const STAGE_FIELDS: Record<1 | 2, StageMetaField[]> = {
  1: [
    { key: "when", label: "When" },
    { key: "why", label: "Why" },
    { key: "equipment", label: "Equipment" },
  ],
  2: [
    { key: "when", label: "When" },
    { key: "why", label: "What" },
    { key: "equipment", label: "Equipment" },
  ],
};

export const STAGE_1_META: StageMetaConfig = {
  stage: 1,
  when: "Read this first, before sitting down with your child",
  why: "Learn the topic before teaching",
  equipment: "Household items",
};

export const STAGE_2_META: StageMetaConfig = {
  stage: 2,
  when: "Tonight with your child",
  why: "One activity with a clear stop rule",
  equipment: "Household items",
};

export function StageMetaBox({
  stage = 1,
  when,
  why,
  equipment,
  className = "",
}: StageMetaConfig & { className?: string }) {
  const values: StageMeta = { when, why, equipment };
  const fields = STAGE_FIELDS[stage];

  return (
    <aside className={`stage-meta-box mt-4 rounded-2xl border border-rule bg-white/70 px-5 py-4 ${className}`.trim()}>
      <dl className="grid gap-4 sm:grid-cols-3">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">{label}</dt>
            <PackProse as="dd" className="mt-1 text-ink leading-6">{values[key]}</PackProse>
          </div>
        ))}
      </dl>
    </aside>
  );
}
