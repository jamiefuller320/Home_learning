export function GlossaryIntroduction({ children }: { children: React.ReactNode }) {
  return (
    <dfn className="glossary-introduce" title="New word in this lesson">
      {children}
    </dfn>
  );
}
