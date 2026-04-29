---
'@questionable-fyi/app': patch
---

Harden read-only richtext display against homoglyph link spoofs and narrow the trigger to mixed-script attack patterns.

Extracts `canonicalHttpUri` and a new `presentLink` helper into a shared `link_sanitization` module so both the editor (lexicon→TipTap) and the public read view (lexicon→React) apply the same defenses. The trigger is now narrower: only hosts that mix Latin with Cyrillic or Greek characters fire the rewrite, so legitimate IDN content (Japanese, Korean, Arabic, pure Cyrillic Russian sites) renders unchanged. When the trigger does fire, the link wrapper is also stripped — the visible text is rewritten to its punycode form AND the anchor is removed so the reader can't accidentally click through.
