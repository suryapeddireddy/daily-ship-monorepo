# Feature Spec 15: UI Theme Token Polish & Dialog Consistency

## 1. Goal
Refactor layout modal dialog styling to align completely with dark mode UI specifications. Eliminate hardcoded borders and replace them with standard structural theme tokens.

## 2. Design System Guidelines
- **Border Parameters:** Dialog containers, popover dividers, and configuration sheets must utilize subtle theme tokens (`border border-white/[0.08] bg-[var(--panel)]`) for structural consistency.
- **Typography Scannability:** Header tags inside overlay boxes must match font weight variables (`font-semibold tracking-tight text-white`).

## 3. Implementation Plan
- **Dialog Enhancements (`components/ui/dialog.tsx` or workspace overlays):**
  - Locate `DialogContent` layout sections. Update the CSS borders to inherit directly from dark token tokens.
- **Roster & Input Alignments:** Clean up input padding and background accent elements on your canvas palette buttons.

## 4. Verification Benchmarks
- Modals match the visual aesthetic of the main system canvas drawing grid layer perfectly.
- Build runs smoothly with zero validation or compiler warnings.
