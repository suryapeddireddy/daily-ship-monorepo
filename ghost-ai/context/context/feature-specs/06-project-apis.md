# Feature Spec 06: Project CRUD Backend REST API Routes

## 1. Goal
Construct secure App Router server-side API endpoints (`GET`, `POST`, `PATCH`, `DELETE`) to execute database actions on `Project` records using the cached Prisma instance.

## 2. Security Guardrails & Invariants
- **Authentication Gate:** Every incoming network request must fetch the authenticated user session from Clerk. If the session is missing, immediately short-circuit the pipeline and return a `401 Unauthorized` response.
- **Strict Multi-Tenant Isolation:** For state mutations (`PATCH` and `DELETE`), query the record first to ensure the caller's verified `userId` matches the database row's `ownerId`. Reject unauthorized tampering with a `403 Forbidden` response.
- **Missing Data Backstops:** When creating projects, default missing title strings to "Untitled Project". Use standard database string layouts without modifying sequential identification keys.

## 3. Implementation Plan
- **Collection Router (`app/api/projects/route.ts`):**
  - `GET`: Fetch all project entities matching the authenticated Clerk user identity column. Order chronologically.
  - `POST`: Parse the incoming JSON body (`name`, `description`). Insert a new entry row into the database, explicitly setting the `ownerId` to the caller's user session string.
- **Resource Instance Router (`app/api/projects/[projectId]/route.ts`):**
  - `PATCH`: Extract `projectId` from URL context parameters, verify row ownership parameters, and commit the parsed name modification.
  - `DELETE`: Confirm resource ownership variables and execute a clean cascading data row deletion. Return an empty `204 No Content` block on success.

## 4. Verification Checklist
- [ ] Direct unauthenticated endpoint queries return clear 401 error objects.
- [ ] Multi-tenant manipulation attempts trigger strict server-side 403 blocks.
- [ ] Endpoints compile perfectly under Next.js server bundling steps with zero type errors.
