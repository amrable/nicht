# Design Specs — German Sentence Analyzer

## 1. Design principles

1. **Minimal.** One screen, one job. If a UI element doesn't help you read the analysis, cut it.
2. **Content-first.** The sentence and its analysis are the hero. Chrome fades into the background.
3. **Quiet typography.** Generous whitespace, restrained weights, one typeface.
4. **Color with meaning.** Color is reserved for the three grammatical genders. Everything else is neutral.
5. **No decoration.** No gradients, no shadows beyond hairlines, no illustrations, no icons unless functional.

## 2. Brand voice

- Language: German for all user-facing text (labels, buttons, section headers, errors).
- Tone: neutral, factual, Duden-like. No emoji, no exclamation marks, no cheerful copy.
- Example button label: `Analysieren` — not `Los geht's!`.

## 3. Layout

### Canvas
- Full viewport, centered content column.
- Content max-width: **640px**.
- Horizontal padding: **24px** on mobile, **32px** on desktop.
- Vertical rhythm: content starts **80px** from the top on desktop, **40px** on mobile.
- Background: `slate-50` (`#F8FAFC`).

### Vertical spacing between sections
- Title → input: **32px**
- Input → first result: **48px**
- Between result sections: **40px**

### Grid
- Single column. No sidebars. No multi-column layouts at any breakpoint.

## 4. Typography

### Font
- **Primary:** `Inter`, loaded from Google Fonts or `@fontsource/inter`.
- **Fallback stack:** `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- No serif, no display font, no second font.

### Scale
| Role              | Size  | Weight | Line-height | Tailwind            |
|-------------------|-------|--------|-------------|---------------------|
| App title (h1)    | 20px  | 500    | 1.4         | `text-xl font-medium` |
| Section label     | 12px  | 600    | 1.2         | `text-xs font-semibold uppercase tracking-wider` |
| Body / table cell | 15px  | 400    | 1.5         | `text-[15px]`       |
| Noun word         | 16px  | 500    | 1.4         | `text-base font-medium` |
| Verb infinitive   | 18px  | 500    | 1.3         | `text-lg font-medium` |
| Muted / role text | 14px  | 400    | 1.5         | `text-sm text-slate-500` |
| Error             | 14px  | 500    | 1.5         | `text-sm font-medium` |

### Rules
- No all-caps except section labels.
- No italics.
- No underline except on focus rings.
- Numerals: tabular (`tabular-nums`) in tables.

## 5. Color system

### Neutrals (the whole UI, except gender pills)
| Token      | Hex       | Tailwind      | Use                          |
|------------|-----------|---------------|------------------------------|
| bg         | `#F8FAFC` | `slate-50`    | Page background              |
| surface    | `#FFFFFF` | `white`       | Cards, input                 |
| border     | `#E2E8F0` | `slate-200`   | All borders, dividers        |
| text       | `#0F172A` | `slate-900`   | Primary text                 |
| text-muted | `#64748B` | `slate-500`   | Secondary text, roles        |
| text-faint | `#94A3B8` | `slate-400`   | Placeholder, disabled        |

### Gender accent colors
Used **only** for article pills and nowhere else.

| Gender | Bg          | Text        | Tailwind                        |
|--------|-------------|-------------|---------------------------------|
| der    | `#DBEAFE`   | `#1E40AF`   | `bg-blue-100 text-blue-800`     |
| die    | `#FEE2E2`   | `#991B1B`   | `bg-red-100 text-red-800`       |
| das    | `#DCFCE7`   | `#166534`   | `bg-green-100 text-green-800`   |

Rationale: matches the widely used German textbook mnemonic (blue = der, red = die, green = das).

### Feedback
| State   | Bg        | Border    | Text      | Tailwind                          |
|---------|-----------|-----------|-----------|-----------------------------------|
| Error   | `#FEF2F2` | `#FECACA` | `#991B1B` | `bg-red-50 border-red-200 text-red-800` |

No success state color — the result itself is the success signal.

## 6. Components

### App title
- Text: `German Sentence Analyzer`
- Style: `text-xl font-medium text-slate-900`
- No subtitle, no logo, no tagline.

### Textarea
- `rows={3}`, `maxLength={500}`
- Background: `white`
- Border: `1px solid slate-200`, `rounded-lg` (8px)
- Padding: `12px 14px`
- Focus: border becomes `slate-900`, no outline ring color change, no glow.
- Placeholder: `Deutschen Satz hier einfügen…` in `slate-400`.
- Resize: vertical only.
- Font: same body font, **not** monospace.

### Primary button (Analysieren)
- Right-aligned below textarea.
- Height: **40px**
- Padding: `0 20px`
- Background: `slate-900` (almost-black)
- Text: `white`, `text-sm font-medium`
- Border-radius: `rounded-lg` (8px)
- Hover: `slate-800`
- Active: `slate-950`
- Disabled: `slate-200` background, `slate-400` text, `cursor-not-allowed`
- Loading: label becomes `Analysiere…`, button stays disabled, no spinner icon.

### Section label
- Example: `NOMEN`, `VERBEN`, `AUFBAU`
- Style: `text-xs font-semibold uppercase tracking-wider text-slate-500`
- Followed by a thin `1px` divider in `slate-200`, `8px` below the label.
- `32px` of space above, `16px` below.

### Article pill
- Inline, before the noun.
- Size: `text-xs font-semibold`
- Padding: `2px 8px`
- Border-radius: `rounded-md` (6px)
- Content: literal text `der`, `die`, or `das` (lowercase).
- Colors per the gender table above.

### Noun row
- Three columns on desktop: `[pill] [word] [plural]`
- On mobile (<480px): pill+word on one line, plural below in muted text.
- Row padding: `10px 0`
- Divider between rows: `1px slate-200`, full width.
- Plural text: `text-slate-500`; if `null`, render `—`.

### Verb card
- Container: `border border-slate-200 rounded-lg p-4 bg-white`
- Spacing between verb cards: `12px`
- Infinitive: `text-lg font-medium text-slate-900`, no trailing punctuation.
- Below it, a definition-list:
  - Each row: label in `text-xs uppercase tracking-wider text-slate-500`, value in `text-[15px] text-slate-900`.
  - Labels: `Im Satz`, `Partizip II`, `Hilfsverb`.
  - Row spacing: `6px`.
- `Hilfsverb` value uses a small pill in the corresponding color (haben = neutral slate, sein = slate — both neutral, no gender coding here).

### Breakdown list
- Two columns on desktop: `[part] → [role]`
- Part: `text-slate-900 font-medium`
- Role: `text-sm text-slate-500`
- Row padding: `8px 0`
- Divider: `1px slate-200` between rows.
- On narrow screens (<480px): stack with `role` under `part` in a second line.
- Alignment: `part` left, `role` right on desktop; both left on mobile.

### Loading skeleton
- Three blocks mirroring the three result sections.
- Each block: rounded rectangles in `slate-200` with a subtle `animate-pulse`.
- No shimmer, no gradient.
- Heights approximate actual content to prevent layout jump.

### Error banner
- Placed directly above the textarea.
- Background: `red-50`, border `red-200`, text `red-800`.
- Padding: `10px 14px`, `rounded-lg`.
- Dismiss: small `×` on the right; clicking clears the error.
- `role="alert"`.

## 7. Interaction & motion

### Transitions
- Only two: button color transition (`150ms ease-out`) and skeleton pulse (Tailwind default).
- No page fades, no slide-ins, no stagger animations, no layout animations.

### Focus states
- Visible focus ring on all interactive elements.
- Ring: `2px` solid `slate-900`, `2px` offset from element.
- Tailwind: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2`.

### Keyboard
- `Tab` order: textarea → button.
- `Ctrl/Cmd + Enter` in textarea submits.
- `Esc` in error state dismisses the banner.

## 8. Responsive behavior

### Breakpoints
- Single breakpoint at **480px**.
- Below 480px: stacked breakdown rows, reduced vertical spacing (multiply by 0.75), horizontal padding stays at 24px.
- Above 480px: the layout described above.

### Target widths tested
- 360px (small phone)
- 414px (standard phone)
- 768px (tablet, content still capped at 640px)
- 1280px+ (desktop, content still capped at 640px, centered)

No horizontal scrolling at any width.

## 9. Empty, loading, error states

| State          | What's rendered                                                   |
|----------------|-------------------------------------------------------------------|
| Initial / idle | Title + input + button. No result area, no empty placeholder.     |
| Loading        | Input stays visible and disabled; skeleton below.                 |
| Error          | Banner above input; previous results cleared.                     |
| Result         | Three sections; any section with empty array is omitted entirely. |

No "No nouns found" messages — omit the section silently.

## 10. Accessibility

- Contrast: all text meets WCAG AA against its background (pill colors verified at AA).
- Article pills carry the literal word as text, so color-blind users still read `der`/`die`/`das`.
- Focus visible on all controls (see §7).
- `lang="de"` set on the `<html>` element.
- The textarea has an associated label; it may be visually hidden via `sr-only`.
- `aria-live="polite"` on the results region so the analysis is announced when it appears.
- `role="alert"` on the error banner.
- Minimum tap target: `40×40px` for the button.

## 11. Iconography & imagery

None. No icons, no logos, no illustrations, no flags. If an icon ever feels needed, reconsider the copy first.

## 12. Favicon & meta

- Favicon: a single black `A` on white, or plain text emoji — whatever is fastest. This is not a branded product.
- Page title: `German Sentence Analyzer`.
- No OG image required for v1.

## 13. Tailwind config notes

- Extend theme only if needed for the `15px` body size: `fontSize: { '15': ['15px', '1.5'] }`.
- Otherwise use Tailwind defaults; the `slate` and primary color scales above are all built in.
- Enable `@tailwindcss/forms` only if the default textarea styling fights the design — otherwise skip it.

## 14. Out of scope (v1)

- Dark mode (can be added later by swapping `slate-50`/`slate-900` tokens)
- Theming / brand variants
- Animations beyond the two listed
- Custom illustrations or imagery
- Logo / wordmark design
