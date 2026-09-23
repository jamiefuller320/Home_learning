import assert from "node:assert/strict";
import {
  assertBrowserMaintainerKey,
  formatMaintainerRestError,
  isLegacySupabaseJwtKey,
  isSupabasePublishableKey,
  isSupabaseSecretKey,
  maintainerAuthHeaders,
} from "../src/lib/maintainer-rest";

assert.equal(isSupabaseSecretKey("sb_secret_abc"), true);
assert.equal(isSupabaseSecretKey("  sb_secret_abc  "), true);
assert.equal(isSupabaseSecretKey("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.x"), false);

assert.equal(isSupabasePublishableKey("sb_publishable_xyz"), true);
assert.equal(isLegacySupabaseJwtKey("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.x"), true);

const jwtHeaders = new Headers(maintainerAuthHeaders("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.x"));
assert.equal(jwtHeaders.get("apikey")?.startsWith("eyJ"), true);
assert.equal(jwtHeaders.get("Authorization")?.startsWith("Bearer eyJ"), true);

const secretHeaders = new Headers(maintainerAuthHeaders("sb_secret_testvalue"));
assert.equal(secretHeaders.get("apikey"), "sb_secret_testvalue");
assert.equal(secretHeaders.get("Authorization"), null);

assert.throws(
  () => assertBrowserMaintainerKey("sb_secret_nope"),
  /blocks preferred secret keys/i,
);
assert.throws(
  () => assertBrowserMaintainerKey("sb_publishable_nope"),
  /publishable/i,
);
assert.doesNotThrow(() => assertBrowserMaintainerKey("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.x"));

const denied = formatMaintainerRestError(401, '{"message":"Invalid API key"}');
assert.match(denied, /legacy service_role JWT/i);

const missing = formatMaintainerRestError(
  404,
  '{"code":"PGRST205","message":"Could not find the table public.language_notes in the schema cache"}',
);
assert.match(missing, /table missing/i);

const grants = formatMaintainerRestError(
  403,
  '{"code":"42501","message":"permission denied for table language_notes"}',
);
assert.match(grants, /permission denied/i);
assert.match(grants, /GRANT ALL|grant service_role/i);

console.log("maintainer-rest tests passed");
