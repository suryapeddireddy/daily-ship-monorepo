# Feature Spec 08: Liveblocks Workspace Shell (Custom Architecture)

## 1. Objective
Integrate the Liveblocks real-time multiplayer coordination infrastructure into the specific project dynamic route layer. This shell must guard project membership boundaries server-side before initiating active websocket channels.

## 2. System Boundaries & Constraints
- **Strict Input Validation:** malformed or non-UUID parameter queries must immediately hit a 404 block prior to invoking any database operations.
- **Explicit Access Tokens:** Project membership validation tokens must be verified directly against the active Clerk user identity session before a Liveblocks room signature is issued.
- **Placeholder Seeding:** Replace the central canvas blank state with a clean, centered layout primitive container wrapped entirely inside the Liveblocks RoomProvider. Do not drop in React Flow primitives or custom node layouts yet.

## 3. Structural Rework & Additions

### A. Dynamic Layout Routing (`app/editor/[projectId]/page.tsx`)
- Transform this specific project boundary route into a server-protected workspace shell.
- Run a quick database verification pass using your existing `lib/projects.ts` helpers.
- **Access Guard Rules:**
  - If the user is unauthenticated or has zero permissions to view this project record ID, return an immediate layout fallback block matching an "Access Denied" screen primitive.
  - If the project record doesn't exist, gracefully redirect them back to the `/editor` homepage dashboard index layout.

### B. Secure Token Handlers (`app/api/liveblocks-auth/route.ts`)
- Implement a standalone POST API wrapper endpoint to handle the Liveblocks access authorization handshake protocols.
- **Handshake Verification Steps:**
  - Decode the request stream payload containing the destination `room` parameter.
  - Pull the active user identity from Clerk middleware wrappers.
  - Query your Prisma schema models to confirm if the user's email or identity string exists inside either the `ownerId` column or the `ProjectCollaborator` link tables for that precise target workspace.
  - Only when permission maps perfectly, pass the session payload to the Liveblocks Node SDK instance to sign a unique JWT room token key. Otherwise, fail cleanly with a 403 response.

### C. Context Mounting Shell
- Wrap the main centralized canvas viewport block cleanly inside your project workspace layout using:
  1. `LiveblocksProvider` (feeding it your secure endpoint reference mapping string).
  2. `RoomProvider` (assigning the specific project record target as the unique room string reference key).
- In the center frame workspace layout canvas field area, output a clean placeholder message tracking real-time setup: *"Connecting to Liveblocks session space..."*

## 4. Acceptance Criteria & Build Checks
- Malformed lookups must hit 404 blocks instantly without triggering unexpected 500 runtime exceptions.
- Opening an unauthorized project string URL path directly via an uninvited browser window profile must completely trigger an "Access Denied" error shield layout.
- Local monorepo bundle check commands must build cleanly with zero type errors.
