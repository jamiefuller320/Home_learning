import type { SayThisItem, SayThisPrompt } from "@/content/schema";

export function sayThisPrompt(item: SayThisItem): string {
  return typeof item === "string" ? item : item.prompt;
}

export function sayThisListenFor(item: SayThisItem): string | undefined {
  if (typeof item === "string") return undefined;
  const text = item.listenFor?.trim();
  return text || undefined;
}

export function sayThisHasListenFor(items: SayThisItem[]): boolean {
  return items.some((item) => Boolean(sayThisListenFor(item)));
}

export function normalizeSayThisItem(item: SayThisItem): SayThisPrompt {
  if (typeof item === "string") return { prompt: item };
  return item;
}
