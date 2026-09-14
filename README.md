# Frontend Interview Playground

A self-study app for the most common mid-level frontend take-home and live-coding exercises. Each challenge is built as a real, working mini-feature (not a LeetCode puzzle), with an explanation of the approach, the trade-offs, and what interviewers probe for.

The app has three sections, switchable from the sidebar:

- **Challenges**: a working demo of each feature side by side with notes on the approach and trade-offs. Hover the ⓘ badges for explanations of specific decisions.
- **Training**: a step-by-step lesson for building each challenge from scratch. Every lesson explains the idea, walks through the code piece by piece, lists common mistakes, and ends with a self-check question. Progress is saved in the browser.
- **Tests**: a multiple-choice quiz per challenge covering the approach, trade-offs and pitfalls. Answers are explained after submission and your best score is saved in the browser.

## Challenges included

| Category | Challenge |
| --- | --- |
| Async & Data | Debounced Search / Autocomplete |
| Async & Data | Infinite Scroll / Load More |
| Async & Data | Pagination (Client vs. Server) |
| State Management | Optimistic Todo List |
| State Management | Shopping Cart State |
| Forms | Multi-Field Form Validation |
| UI Patterns | Sortable / Filterable Data Table |
| UI Patterns | Drag-and-Drop Reorderable List |
| UI Patterns & Accessibility | Accessible Modal Dialog |
| UI Patterns & Accessibility | Tabs & Accordion (ARIA) |

## Running it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:5173/.

Other scripts:

```bash
npm run build     # type-check and build to dist/
npm run preview   # serve the production build locally
npm run lint      # run oxlint
```

## Project structure

```
src/
  challenges/          one folder per challenge
    <id>/
      meta.ts          id, title, category, description
      Demo.tsx         the working implementation
      notes.mdx        approach and trade-offs shown next to the demo
    registry.ts        list of all challenges (lazy-loaded)
  training/content.ts  step-by-step lessons, keyed by challenge id
  tests/content.ts     quiz questions, keyed by challenge id
  components/          layout, sidebar, and the challenge / training / test pages
```

## Adding a challenge

1. Create `src/challenges/<id>/` with `meta.ts`, `Demo.tsx` and `notes.mdx`.
2. Register it in `src/challenges/registry.ts`.
3. Add a training module to `src/training/content.ts` and a test module to `src/tests/content.ts` using the same `id`.

The sidebar, routes and landing pages pick it up automatically.

## Stack

React 19, TypeScript, Vite, React Router, MDX. No UI library; all styling is CSS modules and inline styles so each demo stands on its own.
