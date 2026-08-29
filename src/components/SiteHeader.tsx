import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="no-print mb-10 flex items-baseline justify-between gap-4 border-b border-rule pb-4">
      <Link href="/" className="serif text-xl tracking-tight text-ink">
        Home Learning
      </Link>
      <nav className="flex flex-wrap justify-end gap-x-5 gap-y-2 text-sm text-ink-soft">
        <Link href="/year-1-maths" className="hover:text-teal">
          Year 1 maths
        </Link>
        <Link href="/year-1-maths/skills" className="hover:text-teal">
          Skills tree
        </Link>
        <Link href="/year-1-maths/glossary" className="hover:text-teal">
          Glossary
        </Link>
        <Link href="/how-it-works" className="hover:text-teal">
          How it works
        </Link>
        <Link href="/for-schools" className="hover:text-teal">
          For schools
        </Link>
        <Link href="/language" className="hover:text-teal">
          Language log
        </Link>
      </nav>
    </header>
  );
}
