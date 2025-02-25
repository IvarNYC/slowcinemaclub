export function getSlugFromUrl(url: string): string {
  // Extract the last part of the URL after the last forward slash
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  return lastPart || '';
}
