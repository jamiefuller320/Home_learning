import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1 className="serif text-4xl text-ink">That page is not here</h1>
      <p className="mt-4 text-lg text-ink-soft">Try Year 1, or browse the primary syllabus.</p>
      <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/year-1-maths" className="inline-block font-semibold text-teal hover:underline">
          Year 1 maths topics →
        </Link>
        <Link href="/syllabus" className="inline-block font-semibold text-teal hover:underline">
          Years 1 to 6 →
        </Link>
      </p>
    </div>
  );
}
