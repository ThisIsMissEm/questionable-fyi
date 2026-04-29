import { describe, it, expect } from 'vitest'
import {
  canonicalHttpUri,
  isAcceptableLinkUri,
  presentLink,
} from './link_sanitization'

describe('canonicalHttpUri', () => {
  it('returns the WHATWG-normalized href for http URIs', () => {
    expect(canonicalHttpUri('http://example.com')).toBe('http://example.com/')
  })

  it('returns the WHATWG-normalized href for https URIs', () => {
    expect(canonicalHttpUri('https://example.com')).toBe('https://example.com/')
  })

  it('punycode-encodes IDN hostnames', () => {
    expect(canonicalHttpUri('https://例え.jp/')).toBe(new URL('https://例え.jp/').href)
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,foo',
    'file:///etc/passwd',
    'vbscript:msgbox',
    'mailto:hi@example.com',
    'ftp://example.com',
  ])('rejects non-http(s) scheme %j', (uri) => {
    expect(canonicalHttpUri(uri)).toBeNull()
  })

  it.each([
    ['empty string', ''],
    ['malformed', 'not a url'],
    ['protocol-relative', '//example.com/'],
    ['scheme-only', 'https:'],
  ])('rejects %s', (_label, uri) => {
    expect(canonicalHttpUri(uri)).toBeNull()
  })

  it.each([
    ['number', 42],
    ['null', null],
    ['undefined', undefined],
    ['object', { uri: 'https://example.com/' }],
  ])('rejects non-string input %s', (_label, uri) => {
    expect(canonicalHttpUri(uri)).toBeNull()
  })
})

describe('isAcceptableLinkUri', () => {
  it.each([
    'http://example.com',
    'https://example.com',
    'https://example.com/path?q=1#frag',
    'https://例え.jp/',
  ])('accepts http(s) URI %j', (uri) => {
    expect(isAcceptableLinkUri(uri)).toBe(true)
  })

  it.each([
    ['ftp', 'ftp://ftp.scene.org/pub/index.txt'],
    ['javascript', 'javascript:alert(1)'],
    ['data', 'data:text/html,foo'],
    ['mailto', 'mailto:hi@example.com'],
    ['vbscript', 'vbscript:msgbox'],
    ['file', 'file:///etc/passwd'],
    ['protocol-relative', '//example.com/'],
    ['empty', ''],
    ['malformed', 'not a url'],
  ])('rejects non-http(s) URI: %s', (_label, uri) => {
    expect(isAcceptableLinkUri(uri)).toBe(false)
  })

  it.each([
    ['number', 42],
    ['null', null],
    ['undefined', undefined],
    ['object', { uri: 'https://example.com/' }],
  ])('rejects non-string input: %s', (_label, uri) => {
    expect(isAcceptableLinkUri(uri)).toBe(false)
  })
})

describe('presentLink', () => {
  describe('ASCII / canonical URIs (no spoof signal)', () => {
    it('keeps text and link when the URI required no canonicalization', () => {
      const uri = 'https://example.com/'
      expect(presentLink(uri, uri, uri)).toEqual({ text: uri, dropLink: false })
    })

    it('keeps text and link for an unrelated label', () => {
      const uri = 'https://example.com/'
      expect(presentLink('Click here', uri, uri)).toEqual({
        text: 'Click here',
        dropLink: false,
      })
    })
  })

  describe('legitimate IDN content (no Latin/confusable mixing)', () => {
    it('keeps text and link for pure Japanese hostname even when text mirrors it', () => {
      // 例え.jp is a real Japanese site; text mirrors it, but Han/Hiragana
      // are not visually confusable with Latin letters.
      const uri = 'https://例え.jp/'
      const canonical = new URL(uri).href
      expect(presentLink('例え.jp', uri, canonical)).toEqual({
        text: '例え.jp',
        dropLink: false,
      })
    })

    it('keeps text and link for pure Korean (Hangul) hostname', () => {
      const uri = 'https://한국.kr/'
      const canonical = new URL(uri).href
      expect(presentLink('한국.kr', uri, canonical)).toEqual({
        text: '한국.kr',
        dropLink: false,
      })
    })

    it('keeps text and link for pure Cyrillic hostname (not mixed with Latin)', () => {
      // Russian-language site. No Latin letters in the host → no mixing.
      // cSpell:disable-next-line
      const uri = 'https://президент.рф/'
      const canonical = new URL(uri).href
      // cSpell:disable-next-line
      expect(presentLink('президент.рф', uri, canonical)).toEqual({
        // cSpell:disable-next-line
        text: 'президент.рф',
        dropLink: false,
      })
    })
  })

  describe('homoglyph spoofs (Latin mixed with confusable script)', () => {
    it('rewrites text and drops link when Cyrillic а spoofs Latin a in a hostname', () => {
      // cSpell:disable-next-line
      const uri = 'https://аpple.com/'
      const canonical = new URL(uri).href
      const canonicalHost = new URL(uri).hostname
      // cSpell:disable-next-line
      const result = presentLink('аpple.com', uri, canonical)
      expect(result.dropLink).toBe(true)
      expect(result.text).toBe(canonicalHost)
      expect(result.text).toMatch(/^xn--/)
    })

    it('rewrites text to full canonical href when text claims the full URI', () => {
      // cSpell:disable-next-line
      const uri = 'https://аpple.com/'
      const canonical = new URL(uri).href
      const result = presentLink(uri, uri, canonical)
      expect(result.dropLink).toBe(true)
      expect(result.text).toBe(canonical)
      expect(result.text).not.toContain('а')
    })

    it('rewrites and drops when Greek α spoofs Latin a in a hostname', () => {
      // Greek 'α' (U+03B1) standing in for Latin 'a'.
      // cSpell:disable-next-line
      const uri = 'https://αpple.com/'
      const canonical = new URL(uri).href
      // cSpell:disable-next-line
      const result = presentLink('αpple.com', uri, canonical)
      expect(result.dropLink).toBe(true)
      expect(result.text).toMatch(/^xn--/)
    })

    it('keeps link when Cyrillic-Latin mix is in URI but text does not claim it', () => {
      // The author used 'Apple' as an honest label; even though the URI
      // is suspicious, the text is not pretending to be the host. Our
      // narrow trigger requires text-mirrors-uri to fire.
      // cSpell:disable-next-line
      const uri = 'https://аpple.com/'
      const canonical = new URL(uri).href
      expect(presentLink('Apple', uri, canonical)).toEqual({
        text: 'Apple',
        dropLink: false,
      })
    })
  })
})
