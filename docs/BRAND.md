# pH7Builder brand system

This is the source of truth for pH7Builder's public identity. It keeps the
website, Marketplace, release artwork and future product material recognisable
without turning every page into the same layout.

## Brand idea

**Connection, assembled with care.**

pH7Builder sits where human connection meets independent software ownership.
It is not a generic AI application starter, a nostalgic PHP script or a
proprietary dating-service franchise. It is an open-source foundation from
which someone can build a dating product, matchmaking service or community
with its own audience and rules.

The primary public line is:

> Build the place where people find each other.

The supporting ownership line is:

> Your idea. Your code. Your community.

Use these lines selectively. Do not repeat both on every page.

## Personality

- **Human:** lead with the member experience before the implementation.
- **Independent:** be explicit about self-hosting, ownership and inspectable
  source without treating them as abstract ideology.
- **Optimistic:** show what a focused builder can create without claiming that
  launch, growth or commercial success is automatic.
- **Direct:** use concrete nouns, short sentences and honest limitations.
- **Inventive:** dating and community products should feel alive. Avoid a
  generic enterprise-dashboard or AI-SaaS appearance.

## Visual DNA

### Signature elements

1. **The split-corner mark.** Lime represents the open foundation. Coral is the
   human connection built on top. The dark outline keeps it grounded and
   recognisable at small sizes.
2. **Connection paths.** Fine dotted curves link people, stages or product
   decisions. They describe a relationship, not decorative network noise.
3. **Connection cards.** Product and member concepts use tactile cards with
   dark outlines, rounded corners, slight rotation and hard signal-colour
   shadows.
4. **Editorial statements.** Large serif statements carry the human idea.
   Monospace labels identify technical facts, release state or interface
   metadata.
5. **Visible product worlds.** Illustrative interfaces should show a specific
   dating, matchmaking or community concept. Label fictional people and
   products clearly.

### Colour palette

| Role | Name | Value | Use |
| --- | --- | --- | --- |
| Foundation | Night ink | `#18132D` | Text, outlines, dark stages |
| Human signal | Connection coral | `#FF6D85` | Connection moments, highlights |
| Open signal | Builder lime | `#C9F45B` | Primary actions, open-source cues |
| Product energy | Electric violet | `#5D4DFF` | Emphasis, product direction |
| Warm canvas | Soft blush | `#FFF5EF` | Main background |
| Clear surface | Paper | `#FFFDF9` | Cards and reading surfaces |
| Optimism | Signal yellow | `#FFDA62` | Supporting highlights only |

Night ink on builder lime, paper or soft blush is the default high-contrast
pairing. White on connection coral is not suitable for small text. Do not use
colour as the only indicator of state.

### Typography

Use the local system stacks already defined in `src/styles/global.css`:

- the serif stack for human, editorial statements;
- the sans-serif stack for interface copy and reading;
- the monospace stack for technical facts and small metadata.

Do not add remote fonts. Strong hierarchy, spacing and the three contrasting
voices create the identity without another dependency.

### Motion

Movement should explain connection: a path travels, a match signal breathes or
a card settles into place. Avoid perpetual background movement, scroll-jacking
or generic parallax. Every animation must stop under
`prefers-reduced-motion: reduce`.

## Verbal identity

Lead with what the visitor can make or what a member can experience.

Prefer:

- "Build a private matchmaking service around considered introductions."
- "Start with profiles, discovery, messaging and moderation already in the
  code."
- "Keep your hosting choices and member relationships."

Avoid:

- "Revolutionary AI-powered ecosystem."
- "The number-one dating platform."
- "Launch a successful business instantly."
- vague lists of innovation, scale or enterprise claims without evidence.

Product examples must remain visibly illustrative. Never invent members,
customers, testimonials, usage figures or business outcomes.

## Composition rules

- Give each page one dominant message and one dominant visual moment.
- Use asymmetry and intentional overlap on marketing pages, but preserve a
  straightforward reading order in the document.
- Use hard shadows only on important product objects, calls to action and
  brand moments. Not every container needs a shadow.
- Keep the blueprint grid as quiet construction paper. Connection paths and
  people-facing product cards sit above it.
- Do not fill pages with repeated feature cards. Prefer one product preview,
  journey or decision that makes the value concrete.
- Marketplace pages inherit the brand but keep purchase state, compatibility
  and limitations visually calm and unambiguous.

## Assets

- `public/favicon.svg`: browser icon.
- `public/brand/ph7builder-mark.svg`: square split-corner mark.
- `public/brand/ph7builder-wordmark.svg`: horizontal mark and name.
- `public/social-card.svg` and `.png`: default social-sharing artwork.

Keep the SVG sources authoritative. Regenerate PNG derivatives from the
reviewed SVG rather than editing both by hand.
