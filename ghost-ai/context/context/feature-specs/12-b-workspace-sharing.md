Read context/feature-specs/12-b-workspace-sharing.md and check your system guidelines. Stay strictly within scope and do not copy Adrian's templates.

First, update context/progress-tracker.md by appending Phase 12-B Workspace Authority UI as IN_PROGRESS.

Next, implement the interactive collaboration interface layers precisely:
1. SHARE POPOVER: Implement the `Share` dropdown container. Add a select menu allowing the user to switch permission criteria between "Can Edit" and "View Only". Generate the matching tokenized link string and save it to the system clipboard.
2. ACTIVE USERS BAR: Construct the horizontal profile avatar cluster next to the header sharing buttons using Liveblocks' `useOthers()` hook to track active connection sessions live.
3. ADMIN ROSTER DROPDOWN: Attach a click-context setting panel to those avatar blocks. If the user is the project Owner, allow them to click an active bubble to open an option box supporting instant role mutations and an explicit crimson "Kick User" button that dispatches a DELETE fetch call straight to our `/api/projects/[projectId]/collaborators` endpoint.

Ensure all layout structures compile cleanly with zero TypeScript errors and use strict Tailwind CSS layout centering.
