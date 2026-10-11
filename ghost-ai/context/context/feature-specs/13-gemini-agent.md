# Feature Spec 13: System Architecture AI Generation via Google Gemini

## 1. Goal
Integrate the Google Gemini API to build a natural language prompt command bar. The AI agent must parse user descriptions of system architectures and return a structured JSON layout mapping nodes and edges to inject directly onto the React Flow canvas.

## 2. Structural & Architectural Decisions
- **Structured JSON Outputs (JSON Mode):** Force the Gemini API to respond exclusively with a valid JSON schema matching React Flow's structural object requirements (specifying node IDs, random geometric shapes, dimension labels, and edge link connections).
- **State Appending Model:** Newly generated AI node nodes must cleanly append to or overwrite the active layout state, instantly triggering our existing debounced background auto-save hook to commit the blueprint rows permanently to PostgreSQL.

## 3. Implementation Plan
- **AI Prompt Interface Panel (`components/editor/prompt-bar.tsx`):**
  - Scaffold a floating, absolute-positioned input field centered at the top of the canvas viewport.
  - Add text submission handlers tracking loading spinners and disabled inputs while the AI model executes in the background.
- **Server-Side Agent Route (`app/api/generate-blueprint/route.ts`):**
  - Create an asynchronous POST Route Handler initializing the `@google/genai` or `google-genai` client using `process.env.GEMINI_API_KEY`.
  - Inject a rigid system engineering prompt framing the model as an elite Systems Architect. Enforce character count constraints matching our `maxLength={40}` layout safety rules.

## 4. Verification Check Constraints
- Typing a description and submitting throws zero network or type parsing faults.
- Gemini returns a perfectly valid array collection of layout components that parse directly onto the screen matrix.
- Newly spawned AI nodes successfully auto-save to the database.
