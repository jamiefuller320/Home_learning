import type { Metadata } from "next";
import { MaintenanceDashboard } from "@/components/MaintenanceDashboard";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Maintainer inbox for language notes, feature requests, and lesson feedback patterns.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">Maintainer</p>
      <h1 className="serif mt-3 text-4xl text-ink sm:text-5xl">Maintenance</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
        Review the Supabase inbox, track feature requests awaiting approval, and spot lessons where repeated feedback
        may mean a deeper rewrite is needed.
      </p>
      <div className="mt-10">
        <MaintenanceDashboard />
      </div>
    </article>
  );
}
