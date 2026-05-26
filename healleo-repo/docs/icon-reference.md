# Healleo Icon Reference Sheet

## Design Specs
- **Artboard**: 24x24px
- **Viewbox**: `0 0 24 24`
- **Style**: Outlined / line icons (not filled)
- **Stroke width**: 1.75px
- **Stroke caps**: Round (`stroke-linecap="round"`)
- **Stroke joins**: Round (`stroke-linejoin="round"`)
- **Fill**: None (use `fill="none" stroke="currentColor"`)
- **Corner radius**: Consistent 1-2px rounding on rectangular shapes
- **Padding**: Content should fill 20x20 of the 24x24 space (2px visual padding)
- **Format**: SVG, named `{icon-name}.svg`
- **Location**: `public/assets/icons/`

## Why currentColor?
Icons inherit color from the parent element via CSS `color` property. This means one SVG works in both light and dark mode, and can be tinted by any accent color without editing the file.

---

## Navigation / Tab Icons

### `dashboard.svg`
**Visual**: Grid of 4 squares (2x2), like a dashboard layout. Top-left square slightly larger or different to suggest "home."
**Context**: Main home/dashboard tab.

### `meds.svg`
**Visual**: Pill capsule — horizontal, split down the middle with two halves.
**Context**: Medications tab, medication references throughout.

### `labs.svg`
**Visual**: Test tube or Erlenmeyer flask with liquid line inside.
**Context**: Lab results tab.

### `search.svg`
**Visual**: Magnifying glass, handle at 45 degrees bottom-right.
**Context**: Symptom checker tab, search actions, filtering.

### `clipboard.svg`
**Visual**: Clipboard with a short horizontal line suggesting text. No checkmark (that's a different icon).
**Context**: Summary tab, plan types, profile section headers.

### `scroll.svg`
**Visual**: Vertical document/scroll with slight curl at bottom, two or three horizontal lines suggesting text.
**Context**: Timeline tab.

### `doctors.svg`
**Visual**: Person silhouette with stethoscope, or person with a medical cross badge.
**Context**: Doctor Finder tab, doctor references.

### `edit.svg`
**Visual**: Pencil at 45 degrees, with a small edit line at the tip.
**Context**: Log/edit tab, inline edit actions.

### `hospital.svg`
**Visual**: Building with medical cross on it, or medical cross inside a shield.
**Context**: Insurance Finder tab, healthcare facility references.

### `settings.svg`
**Visual**: Single gear/cog wheel with 6 teeth.
**Context**: Profile/settings button in header.

### `camera.svg`
**Visual**: Simple camera body with circular lens in center.
**Context**: Photo capture for supplements and visual symptoms.

---

## Professional Icons (4 — already designed, included for reference)

### `doctor.svg` ✅
**Visual**: Your existing doctor icon.
**Color context**: Uses `--accent3` (#B394A7 mauve).

### `nutrition.svg` ✅
**Visual**: Your existing dietitian icon.
**Color context**: Uses `--accent5` (#AAAC24 olive-green).

### `trainer.svg` ✅
**Visual**: Your existing trainer icon.
**Color context**: Uses `--accent4` (#00BED6 cyan).

### `therapist.svg` ✅
**Visual**: Your existing therapist icon.
**Color context**: Uses `--accent2` (#F5A800 amber).

---

## Health Metric Icons

### `water.svg`
**Visual**: Water droplet — teardrop shape, single clean drop.
**Context**: Water intake ring chart, water logging.

### `fire.svg`
**Visual**: Small flame — simple, 2-3 curves suggesting a candle flame.
**Context**: Calorie ring chart, streak badge.

### `protein.svg`
**Visual**: Drumstick/meat leg, or a simple steak cut shape.
**Context**: Protein ring chart, protein tracking.

### `sleep.svg`
**Visual**: Crescent moon with 1-2 small stars, or a closed eye with lashes.
**Context**: Sleep ring chart, sleep tracking.

### `steps.svg`
**Visual**: Sneaker/shoe seen from the side, simple outline.
**Context**: Step counting, activity references.

---

## Action / UI Icons

### `close.svg`
**Visual**: X mark — two diagonal lines crossing. Simple, no circle around it.
**Context**: Dismiss buttons, remove items, close dialogs.

### `check.svg`
**Visual**: Single checkmark — diagonal line going down-right then up-right.
**Context**: Selected state, confirmation, success indicators.

### `warning.svg`
**Visual**: Triangle with exclamation mark inside.
**Context**: Alerts, disclaimers, abnormal lab flags.

### `tip.svg`
**Visual**: Lightbulb — simple bulb shape with 2-3 horizontal lines at the base.
**Context**: Tips, helpful information, suggestions.

### `share.svg`
**Visual**: Three dots connected by two angled lines (share network), or an arrow pointing out of a box.
**Context**: Plan sharing between professionals.

### `save.svg`
**Visual**: Floppy disk outline (classic save icon), or a downward arrow into a tray.
**Context**: Save doctor, save results.

### `plus.svg`
**Visual**: Simple + sign — two perpendicular lines.
**Context**: Add new items (lab entries, medications, conditions).

### `refresh.svg`
**Visual**: Two curved arrows forming a circle (sync/retry).
**Context**: Retry actions, data sync.

### `folder.svg`
**Visual**: File folder — rectangular with a tab on top.
**Context**: Past records, history sections.

### `mic.svg`
**Visual**: Microphone — vertical oval on a stand/base, or classic studio mic shape.
**Context**: Voice input button.

---

## Medical / Data Icons

### `memory.svg`
**Visual**: Brain — side profile, with 2-3 curves suggesting the cerebral folds. Simple, not anatomically detailed.
**Context**: AI Memory, learning notes, brain/intelligence references.

### `document.svg`
**Visual**: Single page with top-right corner folded, one or two horizontal lines.
**Context**: PubMed citations, document references.

### `fda.svg`
**Visual**: Building with columns (government/institutional), or a shield with a medical cross.
**Context**: FDA citations, regulatory source badge.

### `research.svg`
**Visual**: Microscope — simple side view with eyepiece, tube, and stage.
**Context**: Research citations, web search results.

### `chat.svg`
**Visual**: Speech bubble — rounded rectangle with small tail at bottom-left.
**Context**: Chat starters, conversation prompts.

### `attach.svg`
**Visual**: Paperclip — classic S-curve clip shape.
**Context**: File upload, PDF attachment.

### `location.svg`
**Visual**: Map pin — teardrop/inverted drop shape with circle inside.
**Context**: Body area selector, doctor office location.

### `notes.svg`
**Visual**: Notepad with pencil — small pad with lines and a pencil at an angle.
**Context**: Additional notes, manual entry fields.

### `injection.svg`
**Visual**: Syringe — horizontal, with plunger on left and needle on right.
**Context**: Timeline events: vaccinations, injections.

### `procedure.svg`
**Visual**: Wrench or small scalpel — single tool suggesting medical procedure.
**Context**: Timeline events: surgeries, procedures.

---

## Contact Icons (Doctor Finder)

### `phone.svg`
**Visual**: Classic phone handset — curved shape, earpiece top-left, mouthpiece bottom-right.
**Context**: Doctor phone number.

### `fax.svg`
**Visual**: Fax machine — boxy shape with paper coming out the top, or phone with page.
**Context**: Doctor fax number.

### `email.svg`
**Visual**: Envelope — rectangular with flap lines forming a V on top.
**Context**: Email address.

### `web.svg`
**Visual**: Globe with latitude/longitude lines — circle with curved cross-lines.
**Context**: Website links.

### `distance.svg`
**Visual**: Route/road — winding path with location pin at end, or car seen from side.
**Context**: Distance to doctor office.

---

## Theme Toggle Icons

### `sun.svg`
**Visual**: Circle with 8 short rays radiating outward (like a simple sun drawing).
**Context**: Switch to light mode.

### `moon.svg`
**Visual**: Crescent moon — simple C-curve shape, no stars.
**Context**: Switch to dark mode.

---

## File Naming Convention
All files go in `public/assets/icons/` with the exact names listed above. The `<Icon name="xxx">` component loads `/assets/icons/xxx.svg`.

## Testing
After placing SVG files:
1. Bump `CACHE_BUST` in `src/components/ui/Icon.jsx` (currently `?v=3` → change to `?v=4`)
2. `npm run build`
3. Upload `dist/` to Hostinger
4. Verify each icon renders at multiple sizes (16px in tabs, 28px in cards, 48px in empty states)

## Color Reference
Icons inherit color automatically, but here's which accent is used where:
- Doctor contexts: `--accent3` (#B394A7)
- Dietitian contexts: `--accent5` (#AAAC24)
- Trainer contexts: `--accent4` (#00BED6)
- Therapist contexts: `--accent2` (#F5A800)
- Primary actions: `--accent` (#6B5A24)
- Danger/alerts: `--danger` (#b85454)
- Success/positive: `--success` (#5a8a52)
- Neutral/dim: `--dim` (#7a7680)
