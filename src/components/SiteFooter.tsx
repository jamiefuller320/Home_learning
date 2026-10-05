import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-rule pt-6 text-sm leading-6 text-ink-soft">
      <p>
        First slice: England Year 1 maths, plus draft packs for Year 2 (finishing KS1) and Years 3–6
        (KS2) so a school can preview the primary syllabus. Content is a draft until a teacher has
        reviewed it. Curriculum text is adapted from Crown
        copyright material licensed under the{" "}
        <a
          className="underline decoration-rule underline-offset-2 hover:text-teal"
          href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
        >
          Open Government Licence v3.0
        </a>
        .
      </p>
      <p className="mt-3">
        <Link href="/maintenance" className="underline decoration-rule underline-offset-2 hover:text-teal">
          Maintainer
        </Link>
      </p>
    </footer>
  );
}
