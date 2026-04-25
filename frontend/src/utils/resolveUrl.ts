/**
 * Resolve a relative backend URL to an absolute URL.
 * If the url already starts with http, it's returned as-is.
 * Otherwise, prepend the backend origin (same hostname, port 5000).
 */
export function resolveUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const hostname = window.location.hostname;
  return `http://${hostname}:5000${url}`;
}
