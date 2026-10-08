# Feature Spec 03: Clerk Authentication Integration

## Goal
Integrate the complete identity and authentication layer using Clerk. Secure the application routes, configure user session hooks, construct custom dark-themed sign-in/sign-up pages, and embed the user profile panel cleanly into the navbar shell.

## Architecture & Structural Rules
- **Host Framework:** Next.js 16 (React 19 ecosystem)
- **File Constraint:** Explicitly implement localized routing security inside the `ghost-ai` subfolder context. Do NOT create a global `middleware.ts` at the monorepo root directory. Use the designated `proxy.ts` pattern or localized sub-app layout files.
- **Access Rule:** All routes under `ghost-ai/app/editor/**` must be strictly private. Anonymous requests must drop into a 401 state or pivot back to `/sign-in`. Only `/sign-in` and `/sign-up` are explicitly public.
- **Theme Identity:** Build custom theme overrides matching our existing `globals.css` configuration. Use CSS variables instead of injecting unmapped hex tokens into the Clerk appearance configuration.

## Implementation Details
1. **Context Providers:** Wrap your main layout file (`ghost-ai/app/layout.tsx`) with Clerk's `<ClerkProvider>` bundled with dark mode adjustments inside the `<body>` element.
2. **Auth Interface View:** Create a sleek two-column desktop frame for auth screens. Left column presents core project branding and feature overviews. Right column centers the interactive `<SignIn>` or `<SignUp>` wrapper.
3. **Routing Hooks:** 
   - Signed-in sessions landing on the `/` index route automatically redirect to `/editor`, where the server loads their workspaces.
   - Guest sessions targeting active workspaces are cleanly intercepted.
4. **Navbar Injection:** Place Clerk's native `<UserButton />` component directly into the right-hand panel of our existing `editor-navbar.tsx` component.

## Verification Checklist
- [ ] Route-interceptor logic functions securely without breaking sibling folders in the monorepo.
- [ ] Direct unauthenticated traffic hitting `/editor` triggers a smooth bounce to `/sign-in`.
- [ ] Clerk dialog states accurately consume the dark theme CSS variables.
- [ ] Account profile popover matches layout alignment on the top menu bar.
- [ ] Local framework build compiles cleanly without strict mode, custom hooks, or linter errors.
