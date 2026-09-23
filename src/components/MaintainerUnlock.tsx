"use client";

import { useState } from "react";
import {
  readDefaultSupabaseUrl,
  storeCredentials,
  verifyMaintainerCredentials,
  type MaintainerCredentials,
} from "@/lib/language-notes-admin";
import { assertBrowserMaintainerKey } from "@/lib/maintainer-rest";
import { verifyLearningRevisionTables } from "@/lib/learning-revisions-admin";
import { verifyPublishTables } from "@/lib/pack-publish-admin";

export function MaintainerUnlock({ onUnlock }: { onUnlock: (credentials: MaintainerCredentials) => void }) {
  const [url, setUrl] = useState(readDefaultSupabaseUrl());
  const [serviceKey, setServiceKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const credentials: MaintainerCredentials = {
      url: url.trim().replace(/\/$/, ""),
      serviceKey: serviceKey.trim(),
    };

    try {
      assertBrowserMaintainerKey(credentials.serviceKey);
      await verifyMaintainerCredentials(credentials);
      await verifyPublishTables(credentials);
      await verifyLearningRevisionTables(credentials);
      storeCredentials(credentials);
      onUnlock(credentials);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not connect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-2xl border border-rule bg-white/70 p-6" onSubmit={handleSubmit}>
      <h2 className="serif text-2xl text-ink">Maintainer access</h2>
      <p className="mt-3 text-ink-soft">
        Unlock the Supabase inbox and live publishing pipeline with the{" "}
        <strong className="font-semibold text-ink">legacy service_role</strong> JWT (starts with{" "}
        <code className="text-xs">eyJ</code>). Find it under Supabase → Settings → API Keys →{" "}
        <strong className="font-semibold text-ink">Legacy keys</strong>. Preferred{" "}
        <code className="text-xs">sb_secret_…</code> keys are blocked in the browser by Supabase — use those only in
        CLI / Actions. The key stays in this browser tab (session storage) and is only sent to your Supabase project.
        Re-run <code className="text-xs">supabase/*.sql</code> once if tables are missing or unlock still fails with
        permission errors.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="font-semibold text-ink">Supabase project URL</span>
          <input
            required
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="mt-2 w-full rounded-xl border border-rule bg-white p-3 text-ink"
            placeholder="https://your-project.supabase.co"
          />
        </label>
        <label className="block">
          <span className="font-semibold text-ink">Legacy service_role key</span>
          <input
            required
            type="password"
            autoComplete="off"
            value={serviceKey}
            onChange={(event) => setServiceKey(event.target.value)}
            className="mt-2 w-full rounded-xl border border-rule bg-white p-3 text-ink"
            placeholder="eyJ… from Settings → API Keys → Legacy"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-clay">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 rounded-full bg-teal px-5 py-2 font-semibold text-white hover:bg-teal-deep disabled:opacity-60"
      >
        {loading ? "Checking…" : "Unlock maintenance"}
      </button>
    </form>
  );
}
