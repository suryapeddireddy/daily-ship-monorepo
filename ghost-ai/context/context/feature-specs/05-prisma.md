# Feature Spec 05: Database Layer Initialization via Prisma & PostgreSQL

## 1. Goal
Initialize the database layer using Prisma ORM with the PostgreSQL provider. Define data models for projects and room collaborators, apply the initial schema migration to the production Prisma database instance, and export a globally cached client singleton instance.

## 2. Design & Architectural Decisions
- **Provider & Credentials:** Use `postgresql` as the datasource provider. Map it cleanly to the `DATABASE_URL` stored securely inside `.env` or `.env.local`.
- **Hybrid Data Model:** Keep the PostgreSQL metadata lean. Store core relational project details (names, owners, status enums) inside structural columns, while utilizing a string path field (`canvasBlobUrl`) to point to massive layout tracking payloads.
- **Relational Integrity:** Establish explicit cascade delete mechanics (`onDelete: Cascade`) between parent Project entries and ProjectCollaborator records to protect against orphaned permission items.

## 3. Implementation Plan
- **Prisma Schema Models (`prisma/schema.prisma`):**
  1. `Project`: Fields for unique ID (UUID string), clerk `ownerId` string, `name`, optional `description`, a `status` enum (`DRAFT`, `ARCHIVED`), timestamp logs (`createdAt`, `updatedAt`), and an optional string field for `canvasBlobUrl`. Add composite database indexes on `ownerId` and `createdAt`.
  2. `ProjectCollaborator`: Fields for unique mapping tracking ID, reference `projectId`, collaborator email profile string, and creation timelines.
- **Global Cached Client Singleton (`lib/prisma.ts`):** Scaffold a unified database access client that checks for an existing runtime execution connection pointer to prevent local hot-reloading from spawning duplicate connection pools.

## 4. Verification Checklist
- [ ] Database data models compile smoothly via Prisma validation runners.
- [ ] Schema generation runs successfully with correct foreign key mappings.
- [ ] Code compiles cleanly with zero type errors.
