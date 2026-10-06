# Feature Spec 02: Structural Editor Workspace Frame Shell

## 🎯 Goal
Build the permanent structural UI Chrome components framing the editor screen layout: the fixed top navigation bar and the floating absolute left project sidebar shell. This establishes the structural viewport slots and state boundaries for the app without connecting backend API routes or active canvas nodes yet.

## 🧠 Design & Layout Decisions
* **Layout Isolation:** The application workspace must span 100% of the active window viewport height and width (`h-screen w-screen overflow-hidden`).
* **Sidebar Layout Rule:** The left project sidebar panel must use absolute/fixed positioning over the viewport. When toggled open, it slides cleanly over the canvas layer via a higher `z-index` stacking parameter rather than shrinking or shifting the main canvas container frame.
* **Header Aesthetics:** The top navbar uses our designated `--panel` fill color background with a razor-thin bottom border seam (`border-b border-white/[0.06]`). It displays a clean, single project title indicator field alongside layout toggle selectors.

## 🛠️ Step-by-Step Implementation Details

### Step 1: Layout Route Architecture
* Configure the dynamic page layout pathway at `app/editor/[projectId]/page.tsx`.
* Implement a parent React server component workspace loop that wraps our coming primitive layers securely.

### Step 2: Top Editor Navbar Primitive
* Create a dedicated presentational component at `components/editor/editor-navbar.tsx`.
* The navbar must expose 3 structural slot lanes:
  * **Left Lane:** Menu toggle icon button using Lucide React (`Menu`) to control the open/closed visibility state of the sidebar.
  * **Center Lane:** Clean typography title indicator referencing the active target project filename or placeholder text metadata.
  * **Right Lane:** Layout placeholders reserving spatial coordinates for the coming multiplayer share dialog buttons and user state buttons.

### Step 3: Absolute Project Sidebar Shell
* Create a layout component container at `components/editor/project-sidebar.tsx`.
* It must accept programmatic functional properties: `isOpen: boolean` and `onClose: () => void` explicitly.
* Use our custom Shadcn UI `Tabs` primitive blocks within this view box frame to segment workspace folder slots seamlessly:
  * **Tab 1: "My Systems"** -> Mounts a clean empty layout state view with a full-width action link button at the bottom labeled "+ Create Project" with a leading plus icon marker.
  * **Tab 2: "Shared Workspaces"** -> Displays an empty, descriptive text line block for collaboration assets.

### Step 4: State Coordination
* Wire the `isOpen` reactive state loop within the core `/editor/[projectId]` page shell.
* Ensure clicking the navbar menu button opens the sidebar panel, and clicking a close trigger or clicking an underlying absolute background backdrop screen overlays hides the panel frame.

## 🚫 Out of Scope
* Do not hook up real-time websocket protocols, Liveblocks rooms, Prisma database collection queries, or interactive flow charts yet. Keep the dataset state purely controlled via temporary local client states.

## ✅ Verification Checklist
* [ ] The project successfully builds with zero active linting or TypeScript compilation errors.
* [ ] The left sidebar completely slides away out of sight when its visibility parameter changes to false.
* [ ] The sidebar panel sits layered absolutely above the main background without altering or squeezing code dimensions underneath.
* [ ] Component property schemas match correctly; the sidebar accurately triggers the `onClose` callback hook on toggle signals.
