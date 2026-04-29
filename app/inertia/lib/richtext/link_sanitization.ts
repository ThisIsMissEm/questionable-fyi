/**
 * Validates and canonicalizes a link URI. Returns the WHATWG-normalized
 * `href` (lowercase scheme + host, trailing slash on empty paths, etc.) for
 * http/https URIs, or `null` for anything else (javascript:, data:, file:,
 * protocol-relative, malformed, non-string). Non-http(s) facets are dropped
 * by callers, so the underlying text content survives as plain text.
 */
export function canonicalHttpUri(uri: unknown): string | null {
  if (typeof uri !== 'string') return null
  try {
    const parsed = new URL(uri)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return parsed.href
  } catch {
    return null
  }
}

// Scripts whose characters are visually confusable with Latin letters in
// hostnames (Cyrillic 'а' / Greek 'α' look identical to Latin 'a'). Mixing
// one of these with Latin in a hostname is the classic homoglyph pattern.
// Other non-Latin scripts (Han, Hiragana, Hangul, Arabic, Hebrew, …) don't
// share visual forms with Latin letters and shouldn't trigger our defenses
// — those are real, legitimate IDN domains.
const CONFUSABLE_WITH_LATIN = /\p{Script=Cyrillic}|\p{Script=Greek}/u

function hostMixesLatinWithConfusable(host: string): boolean {
  return /[a-zA-Z]/.test(host) && CONFUSABLE_WITH_LATIN.test(host)
}

export type LinkPresentation = {
  /** Text to display in the rendered output (may be a punycode rewrite). */
  text: string
  /** If true, render the text without an anchor wrapper. */
  dropLink: boolean
}

/**
 * Decides how a link facet should be rendered defensively. When the URI
 * required canonicalization (i.e., it contained non-ASCII), AND the host
 * mixes Latin letters with Cyrillic or Greek (the homoglyph attack pattern),
 * AND the visible text presents itself as that URI or its hostname, both
 * defenses activate together: text is rewritten to the canonical (punycode)
 * form and the link wrapper is dropped so the reader can't accidentally
 * click through.
 *
 * Pure non-Latin scripts (Japanese, Korean, Arabic, or pure Cyrillic such
 * as a Russian-language site whose host has no Latin letters) do not
 * trigger — those are legitimate IDN domains, not spoofs of familiar
 * Latin ones.
 */
export function presentLink(
  text: string,
  uri: string,
  canonicalHref: string
): LinkPresentation {
  if (canonicalHref === uri) return { text, dropLink: false }
  try {
    const canonicalHostname = new URL(canonicalHref).hostname
    // `new URL(uri).hostname` already returns the canonical (punycode)
    // form, so it can't tell us whether the *text* mirrors the host as the
    // user typed it. Pull the as-typed host substring out of the URI string.
    const asTypedHost = uri.match(/^https?:\/\/([^/?#]+)/i)?.[1]
    if (asTypedHost === undefined) return { text, dropLink: false }
    if (!hostMixesLatinWithConfusable(asTypedHost)) {
      return { text, dropLink: false }
    }
    if (text === asTypedHost) return { text: canonicalHostname, dropLink: true }
    if (text === uri) return { text: canonicalHref, dropLink: true }
  } catch {
    // canonicalHttpUri already parsed `uri` successfully; unreachable.
  }
  return { text, dropLink: false }
}
