function publicSrc(src: string): string {
  if (/^https?:\/\//.test(src)) return src;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${src.startsWith("/") ? src : `/${src}`}`;
}

export function ParentVideo({ src, caption }: { src: string; caption: string }) {
  return (
    <figure className="no-print mt-8 overflow-hidden rounded-2xl border border-rule bg-white/80">
      <video className="aspect-video w-full bg-ink" controls preload="metadata" src={publicSrc(src)}>
        Your browser cannot play this preview. The written briefing below is the source.
      </video>
      <figcaption className="px-5 py-4 text-sm leading-6 text-ink-soft">{caption}</figcaption>
    </figure>
  );
}
