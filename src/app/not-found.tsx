import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1 className="serif text-4xl text-ink">That page is not here</h1>
      <p className="mt-4 text-lg text-ink-soft">The first slice is still small. Try Year 1 maths.</p>
      <Link href="/year-1-maths" className="mt-6 inline-block font-semibold text-teal hover:underline">
        Year 1 maths topics →
      </Link>
    </div>
  );
}
