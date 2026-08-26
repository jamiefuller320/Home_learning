export type TopicProgress = {
  briefingDone: boolean;
  packOpened: boolean;
};

const STORAGE_KEY = "home-learning-progress-v1";

export function emptyProgress(): TopicProgress {
  return { briefingDone: false, packOpened: false };
}

export function readAllProgress(): Record<string, TopicProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, TopicProgress>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function readProgress(slug: string): TopicProgress {
  return readAllProgress()[slug] ?? emptyProgress();
}

export function writeProgress(slug: string, update: Partial<TopicProgress>): TopicProgress {
  const all = readAllProgress();
  const next = { ...emptyProgress(), ...all[slug], ...update };
  all[slug] = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return next;
}

export function countFinishedBriefings(slugs: string[]): number {
  const all = readAllProgress();
  return slugs.filter((slug) => all[slug]?.briefingDone).length;
}
