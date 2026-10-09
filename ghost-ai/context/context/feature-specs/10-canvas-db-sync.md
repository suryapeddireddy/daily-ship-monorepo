# Feature Spec 10: Canvas Data State Serialization & Database Persistence

## 1. Goal
Establish a live data-synchronization bridge between the client-side React Flow canvas state nodes/edges array matrices and the persistent Prisma PostgreSQL database row layer matching the active project dynamic UUID route.

## 2. Security Guardrails & Data Invariants
- **Multi-Tenant State Authorization:** Before writing or saving incoming schema payload data, the API middleware controller must actively cross-reference the calling Clerk identity string with the database project row ownerId. Reject unauthorized writes with a tight 403 Forbidden payload wrapper.
- **Transactional Atomicity:** Save both nodes and edges configurations simultaneously inside a single structured string object or native JSON column payload to block fragmented canvas layouts from rendering upon site reloading.

## 3. Implementation Plan
- **Backend Mutation Route Updates (`app/api/projects/[projectId]/route.ts`):**
  - Refactor the existing PATCH request endpoint to support an optional body payload matching `canvasNodes` and `canvasEdges`.
  - Handle updating the targeted Project row entry securely, serializing complex object arrays using database-friendly string fields if necessary.
- **Frontend Debounced Auto-Save Engine (`hooks/useCanvasSync.ts`):**
  - Build a custom React utility hook that watches active state modifications (`onNodesChange`, `onEdgesChange`, `onConnect`).
  - Implement a clean debounced timeout delay execution trigger (e.g., 800ms) that intercepts rapid drag operations, packing data matrices cleanly before throwing a singular background asynchronous fetch request up to your API routes.

## 4. Verification Check Constraints
- [ ] Dragging structural elements across the viewport triggers seamless asynchronous background network logs.
- [ ] Refreshing the web browser completely preserves card layout coordinates and link connections exactly as positioned.
- [ ] Active modifications appear instantly inside the raw visual data spreadsheets on your Prisma Studio online web console.
