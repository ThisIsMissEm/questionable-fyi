# Lexicon namespace audit — `fyi.questionable.*`

A review of how the project's lexicons are organised across namespaces, with a specific focus on whether relation-style records are placed consistently.

## The four namespaces

| Namespace | Lexicons | What's in it |
|---|---|---|
| `actor.*` | `profile` | Per-actor identity records |
| `graph.*` | `question`, `answer`, `acceptedAnswer` | Currently mixed: 2 content records + 1 pure relation |
| `richtext.*` | 12 types (code, image, list, math, text, website, blockquote, blueskyPost, content, facet, header, horizontalRule) | Content-component types (mostly embedded objects, not records) |
| `waitlist.*` | `request`, `approval` | Onboarding state machine |

## How does this compare to Bluesky's convention?

Bluesky draws a sharp line between `feed.*` and `graph.*` that's worth knowing because it disagrees with the current placement:

- **`app.bsky.feed.*`** — content + relations *about content* (`post`, `like`, `repost`, `threadgate`, `postgate`)
- **`app.bsky.graph.*`** — actor-to-actor relations only (`follow`, `block`, `list`, `listitem`, `listblock`, `starterpack`, `mute`)

Notice that **`like` lives under `feed.*`, not `graph.*`** — even though it's a relation between an actor and a post. Bluesky reserves `graph.*` strictly for **social-graph** primitives (who knows whom, who can see whom).

## Applying that lens to the three `graph.*` records

| Record | Nature | What Bluesky would do |
|---|---|---|
| `graph.question` | Content posted by an actor, similar to a post with optional reply context (`contextRef`) | `feed.question` |
| `graph.answer` | Content posted in reply to a question | `feed.answer` |
| `graph.acceptedAnswer` | Relation between two pieces of content (no actors involved) | `feed.acceptedAnswer` (same logic that puts `feed.like` there, not under graph) |

By Bluesky's taxonomy, **none of the three currently belong in `graph.*`**. All three are about *content*, not about actor-to-actor relationships.

## Two coherent paths forward

### Path A — Adopt Bluesky's convention

Rename to `fyi.questionable.feed.question`, `fyi.questionable.feed.answer`, `fyi.questionable.feed.acceptedAnswer`. Reserve `graph.*` for actor-to-actor records likely to be added later (e.g., "subscribe to a profile's questions", "block someone from asking you questions", "list of trusted answerers").

### Path B — Define a project-specific meaning of "graph"

If "graph" in the project's mental model means **knowledge graph** (questions and answers as nodes, accept-relations as edges) rather than **social graph**, the current placement is consistent — but it's a meaningful divergence from Bluesky's taxonomy. It should be documented (`PRODUCT.md`, `lexicons/README.md`) so future contributors don't trip over it.

The risk with Path B: if a follow/block/mute primitive is later added, it will also want to go under `graph.*` and the namespace will end up mixing two different meanings of "graph".

**Lean: Path A.** Bluesky's split is genuinely useful (it tells you at a glance whether a record is "stuff users post" vs. "stuff that connects users"), and the namespace is still cheap to change pre-launch.

## Separate observation: `strongRef` and the "answers strictly linked to questions" intent

The design intent is that answers are strictly linked to the question they're responding to. Currently `answer.questionRef` is `com.atproto.repo.strongRef` — that's **AT-URI + CID**, so the answer is locked to *exactly the version of the question* that existed at write time. If the question author edits their question (typo fix, clarification), every existing answer's `questionRef` no longer matches the current CID.

That's defensible — an answer is bound to the question-text it was responding to, immune to retroactive editing of the meaning — but it's worth knowing it's the trade-off chosen. The looser alternative is `format: at-uri` (weak ref), where the answer follows the question through edits.

The same applies to `acceptedAnswer.answerRef` — if the answerer fixes a typo after acceptance, the acceptance record's CID stops matching. The "multiple acceptances per question" model handles this gracefully (re-accept = write another record), so this is probably already what's wanted, but it implies the AppView needs to surface "this acceptance was for v1, the answer is now at v3" if that nuance matters.

## Notes worth keeping

- The reason Bluesky's `feed.*` vs `graph.*` split is *useful* (not just stylistic): it lets a relay/AppView decide which collections to backfill for which use-cases. A "social graph crawler" only needs `graph.*` records; a "feed builder" needs `feed.*`. The Questionable AppView almost certainly wants both, but downstream consumers (e.g., a mod tool, a search index, a stats dashboard) might only care about one. Clear namespace boundaries reduce wasted indexing.

- `richtext.*` is doing real work — 12 types, including `blueskyPost` (cross-network embed) and `math`. That's a richer vocabulary than `app.bsky.richtext.facet` provides. `richtext.content` is referenced from both `question.content` and `answer.content` — questions and answers share *exactly* the same authoring surface, a nice symmetry for the UX.

- `waitlist.approval.key: "any"` with the description "Record key is the DID of the approved account" is a clever pattern — using the rkey itself as a foreign key. Means lookup is O(1) ("does this DID have an approval in the admin's repo?") rather than scanning. Heads-up: `key: "any"` doesn't enforce DID format on the rkey, so the AppView has to validate. If enforcement is wanted, AT Proto allows custom key formats (`tid` rkey + DID in a property), but `any` is fine as long as the writes are gated to admin tooling.
