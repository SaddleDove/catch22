# DESIGN.md — Assistant Index

## Temperament and Imagery

A deadpan joke told with a straight face. The site opens directly inside a working chat
product. There is no marketing page, no hero, no chooser, no "welcome" moment — the first
pixel is already the product, and the product is a reconstruction of a real assistant's
dark interface, accurate enough that a regular user does not notice the seam for the first
ten seconds.

The humour lives entirely in the answers. Everything visual is sincere.

## Visual Strategy

Fidelity over invention. Each skin follows its own product's rules and must not share
styling with its neighbours beyond what is unavoidable:

- **ChatGPT** — near-black field, sidebar one shade lighter, soft 8px controls, one wide
  composer, a single heavy white send button, no decoration.
- **Claude** — warm charcoal, a serif wordmark and greeting, coral accent used sparingly,
  quieter hairlines, calmer spacing.
- **DeepSeek** — black field, one saturated blue, pill controls, month-grouped history,
  compact type.
- **Gemini** — blue-black, gradient greeting, rounded pills, thin icons, a wide quiet
  composer that floats rather than sits.

Four skins, one engine. The skin in use is remembered between visits, and the only way to
change it is a small "Switch assistant" block inside the account menu in the sidebar
footer, where a real product would put account settings.

## Colour Scheme

| Skin | Field | Sidebar | Text | Muted | Accent |
|-|-|-|-|-|-|
| ChatGPT | `#212121` | `#171717` | `#ececec` | `#9b9b9b` | `#ffffff` |
| Claude | `#262624` | `#1f1e1d` | `#faf9f5` | `#9a9893` | `#d97757` |
| DeepSeek | `#1b1b1b` | `#232323` | `#e9e9e9` | `#8b8b8b` | `#4d6bfe` |
| Gemini | `#131314` | `#1e1f20` | `#e3e3e3` | `#9aa0a6` | `#8ab4f8` |

Text hierarchy is carried by size and colour, never by boxes.

## Typography

- UI faces: Inter with system fallbacks. Claude's wordmark and greeting use Newsreader
  (Georgia fallback), because the real product's display face is a serif and a sans
  substitute would break the resemblance immediately.
- Message body: 15–16px, line-height 1.7–1.8. Refusals are short, so line-height does most
  of the work.
- No letter-spacing tricks except -0.02em on large display text.

## Layout and Interaction

- Fixed height application, no page scroll. Only the thread and the sidebar history scroll.
- Sidebar 248–288px per skin, collapsible. Under 860px it becomes an overlay and the toggle
  moves into the header, which is how each real product behaves.
- Thread column 720–800px depending on skin, centred with a computed gutter.
- Composer grows with content up to 180px, Enter sends, Shift+Enter breaks the line, and
  the send button becomes a stop button while a reply streams.
- Refusal stream: a short thinking state, then character-by-character text with a caret.
  The text is always a refusal, always in that product's voice, escalating if the user
  keeps pushing.
- Hover reveals per-message actions (copy, thumbs, regenerate), as the real products do.
- Empty state: the product's own greeting above a centred composer, with starter chips only
  where that product actually has them.
- Account menu (sidebar footer) and model menu (composer chip) are native-looking popovers.

## Design Taboos

- **No landing page.** A chooser screen, a hero headline, a row of product cards or an
  "Enter" button is the single worst thing this site could contain.
- No purple AI gradients, no glassmorphism, no floating rounded cards, no glow.
- No emoji, no mascots, no "AI is thinking..." whimsy in the chrome.
- No all-caps marketing copy inside a skin, no taglines added to a product that has none.
- No identical layout reused across skins with a colour swap. The four must feel made by
  four different teams.
- No invented copy in the empty states that a regular user would recognise as wrong.
- No visible "switch assistant" button in the page body. The seam stays behind the account
  menu.

## Execution Requirements

- Static site, no build step, no framework, no runtime dependency.
- Logos are inline SVG from the official brand marks. No raster logos, no generated images.
- All four skins share one engine; skin differences live in CSS and in small per-skin
  templates, never in duplicated logic.
- State persists per skin in `localStorage`; history, titles and the active conversation
  survive a reload.
- Every control on screen does something. No dead buttons.
