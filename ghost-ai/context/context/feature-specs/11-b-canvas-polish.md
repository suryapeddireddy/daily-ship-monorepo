# Feature Spec 11-B: Canvas Interaction Fixes & Component Polish

## 1. Goal
Resolve canvas interface blockers by stabilizing the node creation buttons, aligning layout matrices for circular nodes, and adding dedicated mouse controls for deleting blocks.

## 2. Interaction & Styling Layout Decisions
- **Absolute Canvas Positioning:** Node spawning functions must query the exact viewport center using React Flow's `screenToFlowPosition` bounds to guarantee new boxes appear directly in front of the user regardless of zoom level.
- **Flex-Center Structural Anchors:** Custom circular node blocks must use strict Tailwind flex alignment (`flex items-center justify-center text-center`) alongside an explicit inner content boundary block to guarantee text remains anchored perfectly in the center.
- **Visual Action Handles:** Add a destructive action trigger directly on the canvas floating utility menu and inside the right-hand panel sheet to allow immediate mouse-driven deletions.

## 3. Implementation Plan
- **Spawning Logic Fix (`components/editor/workspace-canvas.tsx`):**
  - Fix the click listener on the palette menu toolbar so it appends nodes correctly using unique UUID handles without dropping current layout arrays.
- **Node Shape Realignment:** Refactor your shape renderer component wrappers to cleanly support equal height-to-width ratios (`aspect-square rounded-full`) for circular models.
- **Mouse Deletion Button Wrapper:** Inject a crimson-red floating delete button container that appears overlaying a node on hover, or add a prominent trash icon right into the customization panel grid.

## 4. Verification Benchmarks
- [ ] Clicking menu shortcuts reliably generates fresh system cards without build faults.
- [ ] Circular shape entities contain perfectly centered, scannable labels.
- [ ] Nodes are easily removable with a mouse click, triggering background auto-saves.
