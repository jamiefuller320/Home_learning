function publicSrc(src: string): string {
  if (/^https?:\/\//.test(src)) return src;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${src.startsWith("/") ? src : `/${src}`}`;
}

export function ParentVideo({ src, caption }: { src: string; caption: string }) {
  return (
    <figure className="no-print overflow-hidden rounded-2xl border border-rule bg-white/80">
      <video className="aspect-video w-full bg-ink" controls preload="metadata" src={publicSrc(src)}>
        Your browser cannot play this preview. Use the written pack below for the steps and checks.
      </video>
      <figcaption className="px-5 py-4 text-sm leading-6 text-ink-soft">{caption}</figcaption>
    </figure>
  );
}
