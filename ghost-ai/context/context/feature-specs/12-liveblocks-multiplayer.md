# Feature Spec 12: Real-Time Collaborative Canvas Synchronization via Liveblocks

## 1. Goal
Integrate Liveblocks to wrap our dynamic canvas route (`/editor/[projectId]`) into a shared real-time session space. Synchronize mouse cursor presence coordinates and state arrays (nodes and edges) natively across concurrent sessions.

## 2. Structural & Architectural Decisions
- **Decoupled Convergence Pipeline:** Live updates to client actions (dragging elements, connecting lines) must map directly through Liveblocks storage streams to ensure zero-latency canvas shifts. 
- **Ephemeral User Presence:** Mouse pointer paths and active selecting highlights are treated as short-lived data. Do not save cursor layout trails to our PostgreSQL database rows.

## 3. Implementation Plan
- **Session Auth Handshake Handler (`app/api/liveblocks-auth/route.ts`):**
  - Implement a secure Liveblocks authentication route matching incoming Clerk user credentials. 
  - Assign random accent user cursor colors based on the logged-in profile identity string.
- **Collaborative Room Wrapper Component (`components/editor/room-provider.tsx`):**
  - Scaffold a client-side provider context that opens a distinct room scope mapped directly to the dynamic `projectId` parameter.
- **Canvas Real-Time Wiring:** Update `useCanvasSync.ts` to listen for multi-user connection movements and reflect layout transformations on your monitor screen immediately.

## 4. Verification Check Constraints
- Opening two independent browser panels side-by-side demonstrates visible, low-latency cross-cursor tracking.
- Moving a geometric block element on one panel updates its coordinates instantly on the second canvas view without a page refresh.
- Production type compilations evaluate smoothly with zero build errors.
