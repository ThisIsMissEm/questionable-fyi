---
name: Questionable
description: "We all have questions, let's get some answers"
colors:
  inquisitive-violet: 'oklch(43.2% 0.232 292.759)'
  inquisitive-violet-on-text: 'oklch(0.985 0 0)'
  quiet-slate: 'oklch(70.7% 0.022 261.325)'
  warm-paper: 'oklch(1 0 0)'
  deep-ink: 'oklch(0.145 0 0)'
  whisper-gray: 'oklch(0.97 0 0)'
  mid-thought: 'oklch(0.556 0 0)'
  pencil-line: 'oklch(0.922 0 0)'
  focus-ring: 'oklch(0.708 0 0)'
  urgent-coral: 'oklch(0.577 0.245 27.325)'
typography:
  display:
    fontFamily: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif"
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: 1.2
  headline:
    fontFamily: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif"
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif"
    fontSize: '1.25rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif"
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 'calc(0.625rem - 4px)'
  md: 'calc(0.625rem - 2px)'
  lg: '0.625rem'
  xl: 'calc(0.625rem + 4px)'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '32px'
components:
  button-primary:
    backgroundColor: '{colors.inquisitive-violet}'
    textColor: '{colors.inquisitive-violet-on-text}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
  button-primary-hover:
    backgroundColor: 'oklch(43.2% 0.232 292.759 / 0.9)'
    textColor: '{colors.inquisitive-violet-on-text}'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.deep-ink}'
  button-ghost-hover:
    backgroundColor: '{colors.whisper-gray}'
    textColor: '{colors.deep-ink}'
  button-outline:
    backgroundColor: '{colors.warm-paper}'
    textColor: '{colors.deep-ink}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
  card:
    backgroundColor: '{colors.warm-paper}'
    textColor: '{colors.deep-ink}'
    rounded: '{rounded.xl}'
    padding: '24px'
  input:
    backgroundColor: 'transparent'
    textColor: '{colors.deep-ink}'
    rounded: '{rounded.md}'
    height: '36px'
---

# Design System: Questionable

## 1. Overview

**Creative North Star: "The Curiosity Parlor"**

A warm, inviting room where questions are the main event. The design carries the typographic confidence of a well-edited column, where every question sits with presence and every answer reads with clarity. This is not a feed to scroll past; it is a space to linger in.

The system rejects corporate density (no Stack Overflow utility grids), generic social media sameness (no infinite scroll without character), and sterile SaaS polish (no dashboards pretending to be clever). It also rejects the disposable chaos of old anonymous Q&A platforms. Every surface should feel like it was set by someone who cares about the conversation, not someone who cares about engagement metrics.

**Key Characteristics:**

- Serif-first typography that reads like editorial, not software
- A single violet accent used with restraint, giving questions visual weight
- Generous whitespace that lets questions breathe
- Flat surfaces with minimal elevation; depth comes from typography and color, not shadows
- Playful confidence: warm enough to invite participation, sharp enough to be taken seriously

## 2. Colors

A restrained palette anchored by a single vivid violet against warm, near-neutral surfaces. Color is used sparingly; the violet earns its presence by appearing only where attention should go.

### Primary

- **Inquisitive Violet** (oklch(43.2% 0.232 292.759)): The brand voice in color. Used on the navigation bar, primary buttons, active tab indicators, and link text. Deep and saturated enough to command attention without shouting.

### Secondary

- **Quiet Slate** (oklch(70.7% 0.022 261.325)): A muted blue-gray for secondary actions and supporting UI elements. Low chroma keeps it recessive.

### Neutral

- **Warm Paper** (oklch(1 0 0)): Page background in light mode. Pure white, not cream, but paired with serif typography it reads warmer than it measures.
- **Deep Ink** (oklch(0.145 0 0)): Primary text. Near-black with enough lightness to avoid harshness on screen.
- **Whisper Gray** (oklch(0.97 0 0)): Muted backgrounds, hover states, accent surfaces. The quietest step above white.
- **Mid-Thought** (oklch(0.556 0 0)): Secondary text, placeholders, muted foreground. Readable but clearly subordinate.
- **Pencil Line** (oklch(0.922 0 0)): Borders, input strokes, dividers. Visible structure without visual weight.
- **Focus Ring** (oklch(0.708 0 0)): Focus indicators. Medium gray that's visible against both light and dark surfaces.

### Destructive

- **Urgent Coral** (oklch(0.577 0.245 27.325)): Error states, destructive actions. Warm red, not cold crimson.

### Named Rules

**The Parlor Rule.** Inquisitive Violet appears on no more than 15% of any given screen. Its rarity makes it meaningful. When everything is violet, nothing is.

**The Warm Neutral Rule.** No pure `#000` or `#fff` in production. Every neutral is tinted warm by the serif typography's natural character; don't undermine that with clinical extremes.

## 3. Typography

**Body Font:** Charter (with Bitstream Charter, Sitka Text, Cambria, serif fallback)

**Character:** A single serif family carries the entire interface. Charter is a transitional serif with generous x-height, designed for screen readability. It gives Questionable its editorial voice: confident without being stuffy, warm without being casual. The absence of a sans-serif anywhere in the hierarchy is the system's most distinctive choice.

### Hierarchy

- **Display** (600, 1.875rem / 30px, line-height 1.2): Page titles, hero headings. Used sparingly.
- **Headline** (600, 1.5rem / 24px, line-height 1.3): Section headers, card titles, question titles.
- **Body** (400, 1.25rem / 20px, line-height 1.5): All running text. The base size is intentionally large to honor the editorial register. Max line length 65-75ch.
- **Label** (500, 0.875rem / 14px, line-height 1.4): Buttons, badges, metadata, navigation items. The only size that drops below 1rem.

### Named Rules

**The One Voice Rule.** Charter is the only typeface. No sans-serif for UI chrome, no monospace for code blocks (unless displaying actual code). The constraint is the identity.

**The Generous Base Rule.** Body text is 20px, not 16px. This is deliberate. Reducing it to match "standard" app sizing destroys the editorial feel.

## 4. Elevation

Questionable is flat by default. Depth is conveyed through typography scale, color contrast, and spatial hierarchy, not through shadows. The system uses tonal layering (Whisper Gray surfaces against Warm Paper backgrounds) rather than lifted surfaces.

### Shadow Vocabulary

- **Ambient Low** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Shadow-xs on inputs and outline buttons. Barely perceptible; provides grounding without lift.
- **Navigation Float** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Shadow-lg on the primary navigation bar. The only element that truly floats above the page.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. If you reach for a shadow, ask whether tonal contrast or spacing could do the job instead. Shadows appear only on the navigation bar and dropdown menus.

## 5. Components

### Buttons

Editorial and inviting. Buttons in Questionable are compact and confident, not oversized CTAs.

- **Shape:** Gently curved edges (8px radius, `rounded-md`)
- **Primary:** Inquisitive Violet background, near-white text, 36px height, 16px horizontal padding
- **Hover:** 90% opacity reduction on primary color. No transform, no scale.
- **Focus:** 3px ring in Focus Ring color with 50% opacity
- **Ghost:** Transparent at rest, Whisper Gray on hover. Used in navigation and secondary actions.
- **Nav Ghost:** White text on the violet navigation bar, with a subtle overlay on hover (oklch(0 0 0 / 0.2))
- **Nav Inverse:** Warm Paper background with Inquisitive Violet text. The signup CTA on the navigation bar.
- **Destructive:** Urgent Coral background, white text

### Cards

- **Corner Style:** Generous curves (14px radius, `rounded-xl`)
- **Background:** Warm Paper, matching page background
- **Shadow Strategy:** Shadow-sm only. Cards are distinguished by their border, not their elevation.
- **Border:** Pencil Line (1px solid)
- **Internal Padding:** 24px horizontal, 24px vertical gap between sections

### Inputs / Fields

- **Style:** Transparent background, Pencil Line border (1px), 8px radius
- **Height:** 36px (matching button height)
- **Focus:** Border shifts to Focus Ring color, 3px ring at 50% opacity. Clear but not aggressive.
- **Error:** Ring shifts to Urgent Coral at 20% opacity, border becomes Urgent Coral
- **Dark mode:** Input background becomes `oklch(1 0 0 / 15%)` (faint white tint)

### Navigation

The top navigation bar is the most visually distinctive element. On desktop, it renders as a floating violet bar (Inquisitive Violet background, `rounded-lg`, shadow-lg) centered at 2/3 page width. Text is near-white. Active items use a subtle overlay state. The brand name "Questionable" sits above it in purple-800, acting as a return-home link.

On mobile, navigation collapses into a dropdown menu triggered by a hamburger icon. The dropdown uses standard card styling (Warm Paper background, Pencil Line border).

### Tab Bar

- **Style:** Bottom border (1px Pencil Line), no background
- **Active indicator:** 3px Inquisitive Violet underline, centered under the tab label
- **Hover:** 8% black overlay on the tab area
- **Typography:** Body size, no weight change between states

### Question (Signature Component)

The question display is the core content unit. It presents a question title in Headline weight, a byline with author handle and relative timestamp, and optional body content. Questions are not wrapped in cards; they sit directly on the page surface with generous vertical spacing between them, reinforcing the editorial feel.

## 6. Do's and Don'ts

### Do:

- **Do** use Charter at 20px base size for all body text. The generous sizing is the design's editorial signature.
- **Do** let questions breathe with generous vertical spacing (24px+ between question items).
- **Do** keep the violet accent under 15% surface coverage per screen (The Parlor Rule).
- **Do** use tonal layering (Whisper Gray on Warm Paper) instead of shadows for visual hierarchy.
- **Do** maintain the single-typeface constraint. Charter carries the entire interface.
- **Do** use the floating violet navigation bar as the primary brand moment on desktop.
- **Do** test color contrast against WCAG AA for both light and dark themes, especially violet-on-white combinations.

### Don't:

- **Don't** introduce a sans-serif typeface. Not for buttons, not for labels, not for "just this one element."
- **Don't** use corporate Q&A density (Stack Overflow's cramped utility grid). Questions deserve room.
- **Don't** create generic social media feed patterns (infinite scroll without character, identical repeating cards).
- **Don't** apply sterile SaaS dashboard aesthetics (impersonal, interchangeable, forgettable).
- **Don't** use border-left or border-right greater than 1px as colored accent stripes on any element.
- **Don't** apply gradient text via background-clip.
- **Don't** use glassmorphism decoratively. The backdrop-blur on the header is functional (scroll readability), not aesthetic.
- **Don't** reduce the base font size below 20px to "look more like an app." The editorial sizing is intentional.
- **Don't** use em dashes in UI copy. Commas, colons, semicolons, or periods instead.
- **Don't** add shadows to cards or content areas. If it needs visual separation, use a border or tonal shift.
