/** Whitespace-separated word count, e.g. for the sidebar's "142 words". */
export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
