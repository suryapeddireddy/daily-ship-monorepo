# Feature Spec 14: Automated AI Edge Routing & Layout Connections

## 1. Goal
Upgrade the Gemini AI system generation pipeline to parse systemic relationships and automatically establish functional connecting wires (Edges) between custom canvas node shapes upon prompt completion.

## 2. Structural & Architectural Decisions
- **Relational Link Matrices:** The server-side API generation route must inspect its generated nodes array, establish valid logical pathways (e.g., source node to target node dependencies), and format them into React Flow compliant edge objects (`id`, `source`, `target`, `animated`).
- **Visual Path Styling:** Enforce a clean, animated dark aesthetic theme for AI connections using smooth curved bezier lines or smart orthogonal layout routing paths to emphasize data streaming flows.

## 3. Implementation Plan
- **Server API Refactor (`app/api/generate-blueprint/route.ts`):**
  - Update the Gemini system orchestration prompt. Order the AI agent to explicitly generate an array of connecting relations matching the exact unique node IDs it just constructed.
- **Frontend Canvas Integration (`components/editor/workspace-canvas.tsx`):**
  - Ensure the client-side state manager handles receiving both nodes and edges concurrently from the AI payload, triggering your active debounced auto-save hook to commit the complete wiring maps to PostgreSQL seamlessly.

## 4. Verification Check Constraints
- Prompting the AI assistant generates both system blocks and their corresponding connecting lines simultaneously.
- Connection wires animate smoothly across the screen and can be disconnected or rerouted manually by clicking handles.
- Code compiles cleanly with zero TypeScript compiler errors.
