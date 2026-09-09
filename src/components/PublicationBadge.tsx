import type { PublicationStatus } from "@/lib/publication";

export function PublicationBadge({ status }: { status: PublicationStatus }) {
  if (status === "live") {
    return (
      <span className="rounded-full bg-[#d9e8df] px-2.5 py-1 text-xs font-semibold tracking-wide text-sage">Live</span>
    );
  }

  if (status === "suspended") {
    return (
      <span className="rounded-full bg-[#f6e4e0] px-2.5 py-1 text-xs font-semibold tracking-wide text-clay">
        Temporarily unavailable
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[#f3e3c8] px-2.5 py-1 text-xs font-semibold tracking-wide text-amber">
      In preparation
    </span>
  );
}
