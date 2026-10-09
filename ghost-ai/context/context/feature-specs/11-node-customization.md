# Feature Spec 11: Node UX Polish

## 1. Goal
Implement generic customizable canvas blocks with single-button creation, hover settings access, and a consolidated property drawer.

## 2. Interface & System Design Rules
- **Generic Blocks:** Do not expose or seed Frontend App, API Endpoint, or Relational Database archetypes. A new block receives a random shape from `rectangle`, `circle`, and `rounded-square`.
- **Dynamic Shape Mutation:** The property drawer supports `rectangle`, `circle`, `rounded-square`, and `diamond`; the active node updates immediately when its shape changes.
- **Responsive Node Text:** Node containers grow naturally between 160px and 320px wide and wrap their names. The editor limits node names to 40 characters.
- **Viewport-Aware Placement:** Spawn new blocks at the center of the current React Flow viewport using its screen-to-flow coordinate transform.
- **Theme Guardrails:** Background color accents must use the predefined `NODE_COLORS` palette.
- **Immediate State Hydration:** Name and color changes update React Flow node state and use the existing debounced persistence pipeline.

## 3. Implementation Plan
- **Unified Property Drawer Sheet (`components/editor/property-panel.tsx`):**
  - Slide the drawer in when the node's hover gear is activated.
  - Provide a name field limited to 40 characters, a node-shape selector, background color selection, and a prominent delete action.
- **Generic Node Renderer (`components/editor/workspace-canvas.tsx`):**
  - Render one hover-only settings gear per node; do not render a node-level delete button.
  - Remove double-click customization and archetype-specific controls.
  - Render node names with responsive sizing and text wrapping rather than fixed pixel widths.
  - Create new generic blocks at the projected viewport center and persist their name, shape, and colors through the existing canvas state hook.

## 4. Verification Benchmarks
- [ ] The canvas offers one `+ Add Block` button and no archetype shortcuts.
- [ ] Clicking it adds a generic block at the current viewport center with one of the three spawn shapes.
- [ ] Hovering a block reveals only its settings gear; clicking it opens the property drawer.
- [ ] Name and background color updates render immediately and flow through the debounced auto-save hook.
- [ ] The Node Shape selector updates the active block immediately; names are limited to 40 characters.
- [ ] The drawer's delete action removes the node and its connected edges through the canvas state.
