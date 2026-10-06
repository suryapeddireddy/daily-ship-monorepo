# Feature Spec 01: Cyber Midnight Design System & Primitives

## 🎯 Goal
Install, configure, and lock down the atomic UI design system foundations for Ghost AI. This establishes our customized "Cyber Midnight" styling tokens, core layout utility wrappers, and base interactive components. This document freezes all styling rules so the coding agent cannot invent arbitrary styling configurations.

## 🧠 Design & Layout Decisions
* **Visual Palette Taste:** Cyber Midnight theme layout. Strictly dark mode with rich blue-grey background layers. No light mode files or colors should be generated.
* **Accent & Borders:** Use a technical Electric Blue accent color for focused/selected items. Keep element panels boxy but with slightly soft, clean rounded corners (`rounded-md` max / 4px).
* **Tailwind Architecture:** Follow the clean Tailwind CSS v4 directives approach. Configure all system tokens directly within the centralized global stylesheet file.

## 🛠️ Step-by-Step Implementation Details

### Step 1: Layout Class Merger Setup
* Create a standalone structural utility file at `lib/utils.ts`.
* Implement a typed `cn()` function helper combining `clsx` and `tailwind-merge` to handle conditional CSS classes cleanly without creating code bugs.

### Step 2: Global Cyber Midnight Styling
* Modify `app/globals.css` to host our exact custom property mappings under the base configuration layers:
  * `--background`: `#0B0F19` (Deep spatial midnight base background)
  * `--panel`: `#121826` (Solid sidebar/navbar surface fill)
  * `--border-faint`: `rgba(255, 255, 255, 0.06)` (Subtle grid layout seam)
  * `--text-primary`: `#F8FAFC` (Pure crisp white text)
  * `--text-muted`: `#94A3B8` (Descriptions and placeholder states)
  * `--accent-focus`: `#3B82F6` (Focused Electric Blue color)
  * `--color-node-default`: `#1E293B` (Standard charcoal structural canvas node)

### Step 3: Base Component Primitives Installation
* Initialize and install standard **Shadcn UI** primitives alongside **Lucide React** for icons.
* Generate and store the following essential core UI building blocks within the `components/ui/` folder:
  * `button.tsx` (For interactive mouse clicks)
  * `dialog.tsx` (For pop-up display panels)
  * `tabs.tsx` (For sorting list options smoothly)
  * `input.tsx` (For text configuration boxes)

## 🚫 Out of Scope
* Do not build any working dynamic page interfaces, layout grids, or routing files yet. Focus entirely on configuring this static structural primitives kit.

## ✅ Verification Checklist
* [ ] The application compiles cleanly with `npm run build` showing zero TypeScript or ESLint errors.
* [ ] The `lib/utils.ts` file properly exports a working `cn()` utility class string merger helper.
* [ ] No raw, hardcoded hex colors are scattered across components; everything reads from the central variables.
* [ ] Custom UI button primitives load onto test files without triggering error panels.
