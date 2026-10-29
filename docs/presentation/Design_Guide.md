# CareerHub Research Presentation — Design Guide (Slides 1–13)

Deck file: `CareerHub_Research_Presentation_Light.pptx` (16:9, 13 slides, fully editable shapes — no images, no groups locked). This is the current light-theme version; `CareerHub_Research_Presentation.pptx` is the older dark-navy version kept only because it contains the manually inserted institute logo — copy the logo from it onto slides 1 and 13 of the light deck, then the dark file can be deleted.
Every slide carries structured speaker notes (timing, what to explain, what to skip, expected mentor questions with answers, keywords, contribution).

---

## 1. Theme Tokens

| Token | Hex | Usage |
|---|---|---|
| Primary Background | `#F6F7FA` | Every slide background (soft off-white) |
| Secondary Background | `#EDF0F5` | Inner tiles, input fields, sub-panels |
| Card Background | `#FFFFFF` | All cards and chips |
| Primary Accent | `#4F46E5` | Hero fills, spines, underline bar |
| Accent Text | `#4338CA` | Accent-colored text on light surfaces, model names, kickers |
| Pale Accent | `#E0E7FF` | Secondary text ONLY on solid-accent fills |
| Success | `#059669` | Resolved states, user touchpoints, "Submit" (text: `#047857`) |
| Warning | `#D97706` | Friction states ("Fill 80 Fields", time stats) (text: `#92400E`) |
| Error | `#DC2626` | Gap circle, "Repeat Again", error stats (text: `#B91C1C`) |
| Primary Text | `#121826` | Headings, primary labels (white only on solid accent/red fills) |
| Secondary Text | `#5D6675` | Captions, descriptors, footers |
| Thin Border | `#E3E7EE` | 0.75 pt card borders |
| Connector Line | `#9AA3B2` | Flow arrows, spines, timeline stems |

Flat colors only. No gradients anywhere. Shadows are very soft (blur ≈ 0.13", 14% alpha) — barely visible lift, never a glow.

## 2. Typography

| Role | Font | Size |
|---|---|---|
| Cover title | Poppins ExtraBold | 34 pt |
| Slide titles | Poppins ExtraBold | 30 pt |
| Card/section headers | Poppins SemiBold | 13–16 pt |
| Body / chip labels | Inter | 10–13 pt |
| Kickers / captions | Inter Medium | 8–11 pt, +200–300 letter-spacing, UPPERCASE |

Install fonts before presenting (otherwise PowerPoint substitutes):
- Poppins — https://fonts.google.com/specimen/Poppins (install ExtraBold + SemiBold weights)
- Inter — https://fonts.google.com/specimen/Inter (install Regular + Medium)

## 3. Layout Grid (repeat on every new slide)

- Margins: 0.9" left/right, header zone `y = 0.38–1.3`, content zone `y = 1.45–7.0`.
- Header pattern: UPPERCASE kicker (11 pt, accent-light, tracked) → title (30 pt) → 0.95" × 0.05" accent underline bar.
- Footer pattern: bottom-left `CareerHub · Semantic Professional Identity Framework` (9.5 pt), bottom-right page chip `NN / 06`.
- Cards: rounded corners (~0.1–0.2 radius), 0.75 pt `#334155` border, very soft black shadow (blur ≈ 0.16", 38% alpha).
- One idea per slide; ≤ 6 words per bullet; diagrams carry the story.

## 4. Icon Replacement (recommended upgrade)

The deck currently uses flat geometric autoshape glyphs inside tinted rounded badges (fully editable). For final polish, replace each glyph with a **Lucide SVG** (lucide.dev → download SVG → PowerPoint: Insert → Pictures → This Device → SVG stays vector):

| Location | Current glyph | Lucide icon |
|---|---|---|
| Slide 3 — Time Consuming | Pie | `clock` |
| Slide 3 — Repeated Effort | Block arc | `refresh-cw` |
| Slide 3 — Data Inconsistency | Triangle | `triangle-alert` |
| Slide 3 — Manual Errors | Octagon | `octagon-x` |
| Slide 3 — No Profile Reuse | Frame | `copy-x` |
| Slide 3 — No Semantic Understanding | Hexagon | `brain` |
| Slide 6 — Sentence Embedding | Hexagon | `network` |
| Slide 6 — Form Understanding | Diamond | `scan-text` |
| Slide 6 — Resume Parser | Folded corner | `file-text` |
| Slide 6 — Confidence | Triangle | `gauge` |
| Slide 1 — AI node | Circle "AI" | keep text, or `sparkles` |
| Slide 7 — model cards | (as slide 6) | `network`, `scan-text`, `file-text`, `gauge` |
| Slide 8 — Raw HTML / Annotation / Knowledge Graph | Cube / Diamond / Hexagon | `code`, `badge-check`, `waypoints` |
| Slide 9 — Google Autofill / CareerHub AI | Frame / Hexagon | `chrome`-like `globe` / `brain-circuit` |
| Slide 12 — C1…C5 badges | Can / Hexagon / Frame / Diamond / Block-arc | `id-card`, `braces`, `puzzle`, `git-merge`, `layers` |

Set SVG fill to the badge's accent color. Never use emoji or PNG icons.

## 5. Per-Slide Animation Plan (Fade / Morph / Appear only)

**Slide 1 — Cover**
1. Fade: background network pattern (all at once, 0.5 s)
2. Fade: kicker pill → title → subtitle (staggered 0.2 s)
3. Appear: browser card, identity card, AI node (in that order)
4. Fade: bottom credit strip
- Transition to Slide 2: **Morph** (the AI node and cards glide out)

**Slide 2 — Motivation**
1. Appear: Student chip
2. Fade (stagger 0.12 s, top→bottom): 8 platform chips along the spine
3. Fade: one-sentence caption
4. Appear: dashboard card, then Fade each stat tile (stagger 0.15 s)

**Slide 3 — Problem Statement**
1. Fade: workflow card, then Appear each step top→bottom (the three red "Repeat Again" chips land last — let them thud in sequence)
2. Fade: six pain-point tiles (stagger, left→right)
3. Fade: quote box (last, hold silence for a beat)

**Slide 4 — Research Gap** (the storytelling slide)
1. Fade: 8 isolated domain chips (stagger, clockwise)
2. Appear: red "NO UNIFIED FRAMEWORK" circle (pause here)
3. Fade: "OUR RESEARCH" label + accent arrow
4. Appear: unified accent circle, then Fade the 8 green connector lines together, then the connected chips
- Alternative: build left cluster on slide 4a, duplicate the slide, and use **Morph** so the red circle transforms into the accent circle.

**Slide 5 — Proposed Solution**
1. Fade: pipeline stages 01→07 top→bottom (stage 03 hero card slightly delayed for emphasis)
2. Fade: platform grid (stagger 0.08 s)
3. Appear: "Any ATS · One identity" strip

**Slide 6 — System Architecture**
1. Fade: column A nodes top→bottom with connector arrows
2. Appear: elbow connector, then column B nodes
3. Fade: four model cards (stagger 0.15 s)
4. Fade: legend + bottom sentence pill

**Slide 7 — AI Architecture & ML Pipeline**
1. Fade: pipeline chips left→right (stagger 0.08 s, arrows appear with their source chip)
2. Fade: four model cards (stagger 0.15 s; the amber FUTURE pill on card 3 appears last)
3. Appear: trait badges top→bottom
4. Fade: bottom hybrid-pipeline statement
- Transition from Slide 6: **Morph** (slide 6's model cards glide into slide 7's card row)

**Slide 8 — Dataset Collection Framework**
1. Fade: 7-stage workflow left→right (hero "AI Training Dataset" lands last)
2. Fade: three dataset cards together, then Appear their inner pills/rows (stagger 0.05 s)
3. Fade: Research Target strip — let the three numbers appear one by one (0.3 s apart)

**Slide 9 — Google Autofill vs CareerHub AI**
1. Fade: both card shells + VS chip
2. Appear: rows top→bottom in pairs (0.1 s stagger) — the accumulating NO pills are the story
3. Fade: bottom statement (pause before advancing)

**Slide 10 — Literature Review Timeline**
1. Fade: timeline spine
2. Appear: cards chronologically left→right with their stems and dots (0.25 s apart)
3. Fade: the indigo "Our Research" card slightly delayed for emphasis
4. Fade: bottom gap statement

**Slide 11 — Expected Outcomes & Evaluation**
1. Fade: ML metrics card, then **Morph/wipe-free** bar fills (animate the accent bars growing via Morph between duplicated slides, or simple Fade)
2. Fade: product metrics rows (stagger)
3. Appear: four KPI tiles (0.15 s stagger)

**Slide 12 — Contributions & Roadmap**
1. Fade: C1–C5 contribution cards left→right
2. Appear: roadmap phases in order (green ACTIVE phase first draws the eye — keep its dot static, no pulse)
3. Fade: V2 and V3 cards together, then their pills

**Slide 13 — Conclusion**
1. Fade: closing statement (both lines together)
2. Appear: vision chain left→right
3. Fade: Thank You + Questions pill + logo block
- Transition: slow Fade (0.6 s) — let the room settle.

No bounce, zoom, spin, or sound. Slide transitions: Fade (0.4 s) everywhere, Morph only where noted.

## 5b. Presentation Timing (≈15 minutes + Q&A)

| Slide | Topic | Time |
|---|---|---|
| 1 | Cover | 0:45 |
| 2 | Motivation | 1:30 |
| 3 | Problem Statement | 1:30 |
| 4 | Research Gap | 2:00 |
| 5 | Proposed Solution | 1:30 |
| 6 | System Architecture | 1:30 |
| 7 | AI/ML Pipeline | 2:00 |
| 8 | Dataset Framework | 2:00 |
| 9 | Google Autofill comparison | 1:30 |
| 10 | Literature Timeline | 2:00 |
| 11 | Outcomes & Evaluation | 1:30 |
| 12 | Contributions & Roadmap | 1:30 |
| 13 | Conclusion | 0:45 |

## 6. Image / Illustration Suggestions

All visuals are flat vector shapes — keep it that way (no screenshots, no stock photos). Optional refinements:
- **Slide 1:** replace the "NIT" placeholder chip with the institute's official logo (SVG/transparent PNG, white or monochrome variant, max 0.62" tall).
- **Slide 2:** platform chips can take official monochrome logo marks (16 px, white) left of the label — use only if brand-safe; otherwise keep the accent dots.
- **Slide 4:** keep the two-cluster composition; do not add imagery — the isolation is the message.
- **Slide 5/6:** if a diagram is ever needed as an image, rebuild it in Figma with these tokens and export SVG; never paste raster diagrams.

## 7. Placeholders to Edit

- Slide 1 bottom strip: `[Guide Name]`, `[Department]`, date (`July 2026`), and the `NIT` logo chip. Presenter is prefilled as *Ashwani Kushwaha*.
- Slide 2 stat values (`80+`, `10+`, `20 hrs`) are motivating estimates — replace with measured numbers once the benchmark dataset exists (see `docs/research/Dataset_Design.md`).
- Slide 10 timeline entries: verify paper names/years against `docs/research/Literature_Review.md` and keep a full bibliography appendix ready — the cards intentionally show only contribution + limitation.
- Slide 11 targets and Slide 12 phase dates (Jun 2026 → 2027) are proposals — align them with the guide's expectations before the defense.
- Slide 13: swap the `NIT` chip for the institute logo, same as Slide 1.

## 8. Grounding in the Repository (for Q&A during defense)

- Ontology of 70+ professional attributes → `packages/types` + `packages/semantic-engine/src/ontology-registry.ts`
- Hybrid mapper (rules → keyword → TF-IDF semantic) → `packages/semantic-engine/src/hybrid-mapper.ts`, `strategies/`, `vectorizers/`
- Confidence-gated automation (fill / confirm / defer) → `docs/research/Problem_Statement.md` (SP4)
- Five research gaps on Slide 4 → `docs/research/Research_Gap.md`
- ATS scope (Greenhouse, Lever, Workday, LinkedIn, Indeed + generic forms) → `docs/research/Problem_Statement.md` (Scope)
- Transformer models on Slide 6 (MiniLM, DeBERTa-v3, LayoutLMv3, LightGBM) are the **proposed** upgrades; the current prototype baseline is statistical NLP — say this proactively if asked.
