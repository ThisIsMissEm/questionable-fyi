---
'@questionable-fyi/app': minor
---

Add abbreviation formatting to the richtext editor.

A new toolbar affordance lets authors mark text as an abbreviation (`<abbr title="…">`). Selecting text and triggering the affordance opens a popover for entering the title (5–300 characters per the lexicon constraint). Existing abbreviations can be edited or removed by reopening the popover with the cursor inside one. Round-trips through the lexicon and renders correctly on the read side.
