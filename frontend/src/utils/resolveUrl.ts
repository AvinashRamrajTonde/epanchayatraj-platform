/**
 * Resolve a relative backend URL to an absolute URL.
 * - Production (port 80/443/none): uses window.location.origin (nginx proxies /uploads/)
 * - Development (port 5173): routes directly to backend on port 5000
 */
export function resolveUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const port = window.location.port;
  const base =
    !port || port === "80" || port === "443"
      ? window.location.origin
      : `http://${window.location.hostname}:5000`;
  return `${base}${url}`;
}
