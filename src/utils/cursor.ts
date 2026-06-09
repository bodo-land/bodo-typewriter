/**
 * Cursor utilities for mapping between Roman-script input positions and
 * Devanagari Unicode output positions.
 *
 * Devanagari characters are multi-byte in UTF-16 (each codepoint is one
 * JS string unit, so `string.length` is safe) but some characters are
 * composed of a base + combining mark (e.g. consonant + mātrā = 2 code units).
 * `Intl.Segmenter` (grapheme clusters) gives the user-perceived character count.
 */

/**
 * Count user-perceived grapheme clusters using Intl.Segmenter.
 * Falls back to `string.length` in environments that don't support it.
 */
export function graphemeLength(s: string): number {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter();
    return [...seg.segment(s)].length;
  }
  return s.length;
}

/**
 * Clamp a cursor value to [0, max].
 */
export function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(value, max));
}
