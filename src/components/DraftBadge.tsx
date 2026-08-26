export function DraftBadge({ status }: { status: "draft" | "reviewed" }) {
  if (status === "reviewed") {
    return (
      <span className="rounded-full bg-[#d9e8df] px-2.5 py-1 text-xs font-semibold tracking-wide text-sage">
        Reviewed
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[#f3e3c8] px-2.5 py-1 text-xs font-semibold tracking-wide text-amber">
      Draft — not yet teacher-checked
    </span>
  );
}
