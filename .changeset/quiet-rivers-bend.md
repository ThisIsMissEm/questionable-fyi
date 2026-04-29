---
'@questionable-fyi/app': patch
---

Reveal homoglyph link spoofs in rendered richtext. When a link's URI gets canonicalized to punycode (e.g., a Cyrillic-host phishing attempt) and the visible text mirrors the as-typed spoofed host, the converter now rewrites the text to its punycode form so readers see the link does not go to the impersonated destination. Adds extensive vitest coverage for richtext conversion, including OWASP-style scheme-confusion XSS attempts, IDN canonicalization, and ZWJ "fat unicode" preservation across facet boundaries.
