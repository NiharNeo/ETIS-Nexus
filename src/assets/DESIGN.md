# Design System Document: Vintage Botanical Editorial

## 1. Overview & Creative North Star: "The Curated Specimen"

The Creative North Star for this design system is **"The Curated Specimen."** This system moves away from the sterile, modular nature of modern web design and instead embraces the tactile, high-contrast world of vintage botanical encyclopedias and avant-garde editorial spreads. 

We are not building a "website"; we are composing a physical archive. The experience is defined by **Organic Brutalism**—the intersection of raw, sharp-edged layouts and the fluid, unpredictable forms of nature. To achieve this, we reject the standard "boxed" grid in favor of:
*   **Intentional Asymmetry:** Weighting layouts heavily to one side to create visual tension.
*   **The Overlap:** Allowing botanical illustrations and typography to collide, creating a sense of three-dimensional depth on a two-dimensional "paper" surface.
*   **Texture as Content:** Treating the background not as a void, but as a physical substrate (heavy grain, toothy paper).

## 2. Colors: High-Contrast Florals

This palette is designed to be "loudly sophisticated." The primary red provides urgency and passion, while the cream and yellow tones ground the experience in a vintage, aged aesthetic.

### Surface Hierarchy & Nesting
We strictly follow the **"No-Line" Rule**. Boundaries between sections are never defined by 1px borders. Instead, use the following tonal transitions:
*   **Base Layer:** Use `surface` (`#fef9ed`) as the primary canvas.
*   **Sub-sections:** Use `surface_container_low` (`#f8f3e7`) to define secondary content areas.
*   **Floating Elements:** Use `surface_container_lowest` (`#ffffff`) for cards or elements that need to feel "closer" to the viewer.
*   **Nesting:** To create depth, nest a `surface_container` (`#f2ede2`) within a `surface_container_high` (`#ede8dc`) area. This creates a soft, stacked paper effect without a single drop shadow.

### Signature Textures & Gradients
*   **The Grain:** All `surface` levels should be overlaid with a subtle noise texture (2-4% opacity) to mimic heavy-stock paper.
*   **Botanical Gradients:** For primary CTAs and hero headers, use a linear gradient from `primary` (`#990411`) to `primary_container` (`#bc2626`) at a 45-degree angle. This prevents the red from feeling "flat" and adds a velvet-like richness.

## 3. Typography: The Newsreader & The Artisan

The typography scale is built on a high-contrast pairing that evokes the feeling of a letterpress machine hitting heavy paper.

*   **The Hero (Newsreader):** All Display, Headline, and Body roles utilize *Newsreader*. This serif is chosen for its variable optical sizes. At large scales (`display-lg`: 3.5rem), it feels authoritative and artistic. At small scales (`body-sm`: 0.75rem), its legibility remains high despite the vintage styling.
*   **The Utility (Work Sans):** Used exclusively for `label-md` and `label-sm`. These are the "catalog tags" of the system. They provide a modern, clean counterpoint to the romantic serif, ensuring that functional metadata is instantly recognizable.
*   **Editorial Layout Rule:** Overlap `display-lg` text with botanical imagery. Set the typography to `multiply` or `darken` blend modes against textured backgrounds to integrate the ink into the "paper."

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are prohibited. Depth is a matter of **physical stacking**, not light projection.

*   **The Layering Principle:** Use the `surface-container` tiers to create hierarchy. A "High" tier feels physically placed on top of a "Low" tier.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use `outline_variant` (`#e3beba`) at **15% opacity**. It should be felt rather than seen.
*   **Glassmorphism:** For floating navigation or "magnified" specimen views, use `surface` at 80% opacity with a `backdrop-filter: blur(12px)`. This creates the effect of a frosted glass specimen slide placed over the botanical art.

## 5. Components: Sharp & Intentional

Following the **Roundedness Scale of 0px**, every component in this system features sharp, 90-degree corners. This reinforces the "cut paper" and "editorial" feel.

### Buttons
*   **Primary:** Background `primary` (`#990411`), Text `on_primary` (`#ffffff`). No border. Hover state: `primary_container`.
*   **Secondary:** Background `transparent`, Border 2px solid `primary`. 
*   **Tertiary:** Text `secondary` (`#795900`), no background. Use for low-emphasis actions.

### Cards & Lists
*   **The "No-Divider" Rule:** Lists must not use horizontal lines. Separate list items using 16px or 24px of vertical whitespace from the spacing scale, or by alternating background colors between `surface` and `surface_container_low`.
*   **Specimen Cards:** Cards should feature a large, "overflowing" botanical element that breaks the top or side boundary of the card container.

### Input Fields
*   **Styling:** Underline-only style using `outline` (`#8f706c`). When focused, the underline transitions to `primary` (`#990411`) at 2px thickness. 
*   **Labels:** Use `label-md` in `on_surface_variant` for a "typed" look.

### Additional Component: "The Specimen Tag" (Chips)
*   Used for categorization. Sharp corners, background `secondary_fixed` (`#ffdea0`), text `on_secondary_fixed` (`#261a00`). These should look like small manila tags pinned to the page.

## 6. Do's and Don'ts

### Do:
*   **Do** use extreme scale. A 3.5rem headline next to a 0.75rem label creates the "Editorial" tension required.
*   **Do** allow images to bleed off the edge of the viewport.
*   **Do** use `primary` red as a surgical strike—use it for the most important focal point on the screen and nowhere else.

### Don't:
*   **Don't** use border-radius. Even 2px will break the "vintage print" illusion.
*   **Don't** use pure black (`#000000`). Use `on_surface` (`#1d1c15`) to maintain the "inky" feel on cream paper.
*   **Don't** center-align long blocks of text. Stick to left-aligned (editorial standard) or occasionally justified for a blocky, structural feel.