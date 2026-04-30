---
'@questionable-fyi/app': patch
---

Restrict the richtext editor's link extension to http(s) only and improve the toolbar link popover.

Pasting or typing a non-http(s) URI (`ftp://`, `mailto:`, `javascript:`, `tel:`, etc.) now leaves the text as plain text rather than auto-creating a link. The same restriction applies to the toolbar link popover: invalid URLs are rejected with an inline error rather than being silently set on the document. URLs typed without a scheme are prefixed with `https://` (matching the editor's `defaultProtocol`), so `example.com` becomes a link to `https://example.com`. Disabled the bundled `Link` extension that ships inside `StarterKit` so our standalone `Link.configure(...)` is the only registration — without this, paste defaults from the bundled copy were overriding our `isAllowedUri` and `shouldAutoLink` predicates.
