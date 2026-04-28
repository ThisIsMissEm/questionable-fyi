---
"@questionable-fyi/lexicons": minor
---

Rework lexicon to use a graph structure

The previous version of the lexicon used `fyi.questionable.question` and `fyi.questionable.answer`, this pattern is somewhat awkward to work with for lexicons, so we now have introduced a graph structure to allow us to continue adding more features in the future.