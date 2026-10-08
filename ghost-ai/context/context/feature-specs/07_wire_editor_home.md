# Feature Spec 07: Wire Editor Home (Custom Architecture)

## 1. Objective
Establish a reliable, high-performance link between the editor home dashboard/sidebar and the Prisma PostgreSQL database layer using clean Next.js architecture. This screen must serve as the user's primary workspace nexus without fetching data on the client.

## 2. Structural Requirements
- **Monorepo Directory Isolation:** All modifications stay strictly confined inside the `ghost-ai/` path.
- **Server-First Delivery:** The editor landing area must remain a Next.js Server Component to fetch user workspaces directly on the initial page paint.
- **Atomic Mutation State:** Use native React hooks linked to unified API route endpoints for creation, updates, and deletion.

## 3. Detailed Data & Workflow Specifications

### A. Server Setup & Hydration (`lib/projects.ts`)
- Write an isolated query function to fetch projects where the authenticated user (via Clerk ID) is either the creator or a collaborative invitee.
- Order all returning array records dynamically by `updatedAt DESC` so the most active files populate at the top of the sidebar.

### B. Workspace Shell & Left Sidebar Layout
- **Dynamic Projects List:** Map out the array fetched from the database into a clean vertical link list inside the sidebar menu shell.
- **Active State Matching:** Highlight the sidebar navigation item if its unique database `id` string matches the current route parameter.
- **Empty State Fallback:** If the database return array is blank (`length === 0`), render an intuitive, clean graphic card stating: "Welcome to your AI workspace. Create your first project to get started."

### C. Mutation Hooks Layer (`hooks/useProjectActions.ts`)
- Ensure all mutations manage global loading and error state states cleanly.
- **Project Creation (`POST /api/projects`):**
  - Prompt user for a title.
  - Automatically transform the string into an organic URL-safe slug pattern.
  - On a successful database write, route the client seamlessly to the new room path (`/projects/[id]`).
- **Project Rename (`PATCH /api/projects/[projectId]`):**
  - Pass the string update down to the newly validated route endpoint.
  - Trigger a soft layout refresh via Next.js router invalidation context to update the sidebar titles instantly without resetting the page tree state.
- **Project Removal (`DELETE /api/projects/[projectId]`):**
  - Prompt user with a definitive confirmation step.
  - Upon completion, route the client cleanly back to the home `/projects` base index.

## 4. Acceptance Criteria & Compilation Rules
- Strict UUID validation rules must block raw bad URLs right at the boundary layer.
- The project validation layer must catch and prevent blank or special-character-only workspace titles.
- Zero local compilation warnings or hidden syntax bugs from the TypeScript processor.
