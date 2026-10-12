# Feature Spec 14: Invincible AI Edge Routing via Trigger.dev Background Tasks

## 1. Goal
Integrate Trigger.dev to offload the long-running Google Gemini system blueprint generation task into a resilient, timeout-proof background execution worker pipeline.

## 2. Structural & Architectural Decisions
- **Durable Task Workers:** Shift AI layout generation from synchronous serverless Next.js API endpoints to a durable Trigger.dev background task runner.
- **Dagre Mechanical Layouts:** Upon task success, pipe the dual-array object layout payload (nodes and edges) directly through the internal Dagre graph layout manager (`lib/layout.ts`) to assign spatial x/y pixel grid coordinates before saving.

## 3. Implementation Plan
- **Background Task Framework (`trigger/generate-blueprint.ts`):**
  - Construct an authentic Trigger.dev task configuration block initialized using `task({...})`.
  - Wire up the Gemini content generation engine within the run handler block using the production parameters for `gemini-3.8-flash` in JSON mode.
- **REST Status Handlers (`app/api/generate-blueprint/route.ts`):**
  - Refactor the API route to serve strictly as a rapid task trigger invocation gate using `@trigger.dev/sdk`.

## 4. Verification Check Constraints
- Submitting a prompt immediately returns a running execution handle without triggering 502/504 errors.
- Background logs on the local task manager dashboard confirm stable token deliveries.

