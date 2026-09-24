import 'server-only';

/**
 * The Nest API origin used by Next.js server code.
 *
 * Prefer BACKEND_API_URL so the internal API origin is not exposed to browser
 * bundles. NEXT_PUBLIC_API_BASE_URL remains a backwards-compatible fallback
 * and is still used by the browser when it needs to resolve media URLs.
 */
export function getBackendApiUrl(): string | undefined {
  const value =
    process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  return value?.replace(/\/+$/, '');
}
