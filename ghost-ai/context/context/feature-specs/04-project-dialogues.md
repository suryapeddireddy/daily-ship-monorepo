# Feature Spec 04: Project Dialogues & Workspace Management Shell

## 1. Goal
Build the editor dashboard's initial landing views, the centralized state engine for controlling workspace modals, and the project management interaction overlays (Create, Rename, Delete) using isolated mock state arrays. No database or network operations are permitted in this unit.

## 2. Design Decisions
- **Theme Consistency:** Modals must use the absolute flat dark background tokens inherited from `globals.css`. Overlay containers require a blur-scrim background to mask the structural canvas plane underneath.
- **Dynamic Suffixing:** The creation input form must strip non-alphanumeric entities, convert whitespace to dashes, enforce lower-casing, and suffix a brief unique string to generate url-safe project slugs live as the user types.

## 3. Implementation Plan
- **State Hook (`useProjectDialogs`):** Track the active modal type (`'create' | 'rename' | 'delete' | null`), the currently focused project scope, text input values, and temporary mock button loading spinners.
- **Center Canvas Empty View:** When no project context is loaded, display an explicit visual dashboard welcoming the developer ("Create a project or open an existing workspace from the left panel").
- **Overlay Layer:** Scaffold conditional rendering sheets wrapping form validation fields for:
  1. Creating a project (binds live title-to-slug transformations).
  2. Renaming a project (pre-populates current string labels).
  3. Deleting a project (presents an explicit warning prompt).

## 4. Verification Checklist
- [ ] Active project name input generates safe browser slugs smoothly on keypress.
- [ ] Modals overlay correctly atop the viewport without shifting parent sidebar alignment frames.
- [ ] Code passes all TypeScript compiler checks and zero 'any' fallback types are introduced.
