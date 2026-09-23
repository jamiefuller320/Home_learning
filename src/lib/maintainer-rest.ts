export type MaintainerCredentials = {
  url: string;
  serviceKey: string;
};

/** New Supabase secret keys (preferred replacement for legacy service_role JWTs). */
export function isSupabaseSecretKey(key: string): boolean {
  return key.trim().startsWith("sb_secret_");
}

/** New Supabase publishable keys (replacement for legacy anon JWTs). */
export function isSupabasePublishableKey(key: string): boolean {
  return key.trim().startsWith("sb_publishable_");
}

/** Legacy anon / service_role JWTs begin with the standard JWT header prefix. */
export function isLegacySupabaseJwtKey(key: string): boolean {
  return key.trim().startsWith("eyJ");
}

/**
 * Build Data API headers for a maintainer key.
 *
 * Legacy JWTs need `Authorization: Bearer` (role claim). New `sb_*` keys are not
 * JWTs — sending them as Bearer makes JWT verification fail. Put those on `apikey`
 * only (see Supabase API keys docs).
 */
export function maintainerAuthHeaders(serviceKey: string): HeadersInit {
  const key = serviceKey.trim();
  const headers: Record<string, string> = {
    apikey: key,
    Accept: "application/json",
  };
  if (isLegacySupabaseJwtKey(key) || (!isSupabaseSecretKey(key) && !isSupabasePublishableKey(key))) {
    headers.Authorization = `Bearer ${key}`;
  }
  return headers;
}

/**
 * Preferred secret keys are blocked in browsers (User-Agent → 401). The static
 * maintainer UI can only unlock with a legacy service_role JWT until auth moves
 * off privileged keys in the client.
 */
export function assertBrowserMaintainerKey(serviceKey: string): void {
  const key = serviceKey.trim();
  if (!key) {
    throw new Error("Paste the legacy service_role key (starts with eyJ…).");
  }
  if (isSupabasePublishableKey(key)) {
    throw new Error(
      "That looks like a publishable (anon) key. Maintainer unlock needs the legacy service_role JWT (starts with eyJ…), from Supabase → Settings → API Keys → Legacy keys.",
    );
  }
  if (isSupabaseSecretKey(key)) {
    throw new Error(
      "Supabase blocks preferred secret keys (sb_secret_…) in the browser. Use the legacy service_role key instead (Settings → API Keys → Legacy keys — long eyJ… value). Secret keys still work in CLI / GitHub Actions.",
    );
  }
}

export function formatMaintainerRestError(status: number, body: string): string {
  const snippet = body.replace(/\s+/g, " ").trim().slice(0, 240);
  const lower = snippet.toLowerCase();

  if (
    status === 404 ||
    lower.includes("does not exist") ||
    lower.includes("schema cache") ||
    lower.includes("pgrst205")
  ) {
    return `Supabase table missing or not exposed (${status}). Re-run supabase/language_notes.sql, pack_publish.sql, and learning_revision_decisions.sql in the SQL editor (they now grant service_role explicitly). ${snippet}`;
  }
  if (status === 403 || lower.includes("42501") || lower.includes("permission denied")) {
    return `Supabase permission denied (${status}). Re-run the supabase/*.sql files so service_role has GRANT ALL on maintainer tables. ${snippet}`;
  }
  if (status === 401 && (lower.includes("invalid api key") || lower.includes("unauthorized") || !snippet)) {
    return "Supabase rejected this key (401). For the maintainer page use the legacy service_role JWT (eyJ…), not the preferred sb_secret_ key. Confirm the project URL matches the key.";
  }
  if (status === 401) {
    return `Supabase 401: ${snippet || "Unauthorized. Preferred secret keys cannot be used in the browser."}`;
  }
  return `Supabase ${status}: ${snippet || "Request failed."}`;
}

export async function maintainerRest<T>(
  credentials: MaintainerCredentials,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(maintainerAuthHeaders(credentials.serviceKey));
  const initHeaders = new Headers(init.headers);
  initHeaders.forEach((value, key) => {
    headers.set(key, value);
  });
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${credentials.url.replace(/\/$/, "")}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(formatMaintainerRestError(response.status, body));
  }
  if (response.status === 204) return [] as T;
  return (await response.json()) as T;
}
