/** Resolves a file in `public/` against the deploy base, so the game also works from a subpath such as GitHub Pages. */
export function assetUrl(path: string): string {
  const base = import.meta.env?.BASE_URL ?? '/';
  return `${base.endsWith('/') ? base : `${base}/`}${path.replace(/^\//, '')}`;
}
