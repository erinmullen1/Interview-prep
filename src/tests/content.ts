export interface Question {
  prompt: string
  /** Optional code shown with the prompt. */
  code?: string
  options: string[]
  /** Index into `options`. */
  answer: number
  explanation: string
}

export interface TestModule {
  challengeId: string
  questions: Question[]
}

export const testModules: TestModule[] = [
  {
    challengeId: 'debounced-search',
    questions: [
      {
        prompt: 'Why does the demo split debouncing and fetching into two separate useEffects?',
        options: [
          'React only allows one setTimeout per effect',
          'They are different timing concerns (typing speed vs. network speed) and are easier to reason about and test independently',
          'Two effects run in parallel and are faster',
          'A single effect cannot return a cleanup function',
        ],
        answer: 1,
        explanation: 'Both can live in one effect, but coupling typing timing with network timing makes the logic harder to reason about and test.',
      },
      {
        prompt: 'What bug does AbortController prevent in a search-as-you-type UI?',
        options: [
          'The input losing focus when results render',
          'Memory leaks from unused strings',
          'A slow, older request resolving after a newer one and overwriting fresh results with stale ones',
          'The browser sending duplicate requests',
        ],
        answer: 2,
        explanation: 'This is the race condition interviewers most often check for. Aborting the previous request whenever a new one starts prevents it.',
      },
      {
        prompt: 'What happens when the user types another character before the 300ms debounce timer fires?',
        code: `useEffect(() => {
  const timer = setTimeout(() => setDebounced(input), 300)
  return () => clearTimeout(timer)
}, [input])`,
        options: [
          'Both timers fire and setDebounced is called twice',
          'The cleanup clears the pending timer and a new 300ms timer starts',
          'The effect is skipped because input is a string',
          'React throws because the timer was not awaited',
        ],
        answer: 1,
        explanation: 'Each change to `input` re-runs the effect. React calls the previous cleanup first, which clears the old timer.',
      },
      {
        prompt: 'When would throttling be a better fit than debouncing?',
        options: [
          'When the user needs partial results at a steady rate while continuously interacting, such as scroll position updates',
          'When network requests must be cancelled',
          'Never; debouncing is always superior',
          'When the input is a checkbox',
        ],
        answer: 0,
        explanation: 'Throttling fires at a fixed rate regardless of pauses. Debouncing waits for a pause, which suits search since partial mid-word results add nothing.',
      },
      {
        prompt: 'In the catch handler, why is an AbortError ignored rather than clearing the loading state?',
        options: [
          'AbortError is not a real error class',
          'An abort means a newer request is already in flight and owns the loading state; clearing it would show a false "done"',
          'Setting state in a catch is not allowed',
          'AbortError is always followed by a retry',
        ],
        answer: 1,
        explanation: 'An aborted request is expected. The newer request set loading to true and will clear it when it resolves.',
      },
    ],
  },
  {
    challengeId: 'infinite-scroll',
    questions: [
      {
        prompt: 'Why is IntersectionObserver preferred over a scroll event listener for infinite scroll?',
        options: [
          'Scroll events do not work inside overflow containers',
          'It is native, asynchronous, and fires only when visibility changes, so no manual throttling or scrollTop math is needed',
          'IntersectionObserver is synchronous and therefore more accurate',
          'Scroll listeners are deprecated',
        ],
        answer: 1,
        explanation: 'Scroll events fire dozens of times a second and need throttling plus fragile pixel math. The observer only fires on intersection changes.',
      },
      {
        prompt: 'What is the purpose of `rootMargin: "200px"` on the observer?',
        options: [
          'It adds 200px of padding to each list item',
          'It triggers the load slightly before the sentinel is visible, so new items are usually ready before the user reaches the gap',
          'It limits the observer to elements at least 200px tall',
          'It prevents the observer from firing more than once per 200ms',
        ],
        answer: 1,
        explanation: 'Expanding the root margin makes the sentinel "intersect" earlier, hiding the loading gap.',
      },
      {
        prompt: 'What does the `!loading` check inside the observer callback guard against?',
        options: [
          'Rendering before the first page arrives',
          'The observer being created twice',
          'Firing multiple simultaneous requests for the same page while one is already in flight',
          'Loading past the last page',
        ],
        answer: 2,
        explanation: 'Without it, repeated intersection callbacks while a request is pending would request the same page again and duplicate items.',
      },
      {
        prompt: 'Why does `loadNext` use `setItems((prev) => [...prev, ...newItems])` instead of `setItems([...items, ...newItems])`?',
        options: [
          'The functional form always uses the latest state, avoiding stale closures when several updates happen',
          'Spread syntax only works inside callbacks',
          'It is required for TypeScript to infer the array type',
          'It triggers fewer re-renders',
        ],
        answer: 0,
        explanation: 'The callback form always receives the newest list. Using `items` directly would use whatever value the function captured when it was created, which may be out of date. Use the callback form whenever new state depends on old state.',
      },
      {
        prompt: 'Which is a genuine accessibility concern with infinite scroll?',
        options: [
          'Screen readers cannot read list items',
          'Keyboard and screen-reader users can be trapped in an ever-growing page with no way to reach the footer',
          'IntersectionObserver is not supported by assistive technology',
          'The sentinel div is announced repeatedly',
        ],
        answer: 1,
        explanation: 'A common mitigation is to pair infinite scroll with a manual "Load more" button as an escape hatch.',
      },
    ],
  },
  {
    challengeId: 'optimistic-todo',
    questions: [
      {
        prompt: 'What is the defining characteristic of an optimistic update?',
        options: [
          'The server is called before any UI change',
          'The UI updates immediately as if the request succeeded, and rolls back if it fails',
          'Updates are batched and sent every few seconds',
          'Errors are hidden from the user',
        ],
        answer: 1,
        explanation: 'Optimistic UI trades complexity (every mutation needs a rollback path) for perceived speed.',
      },
      {
        prompt: 'Why does the demo keep a failed new todo visible with a Retry button instead of removing it?',
        options: [
          'Removing items from arrays is expensive',
          'The user typed that text; silently removing it would lose their effort',
          'React cannot remove items that were added optimistically',
          'The server requires all todos to be retried',
        ],
        answer: 1,
        explanation: 'Match the rollback strategy to what the user would lose. Toggles can silently revert; typed content should be preserved.',
      },
      {
        prompt: 'What risk does `catch(() => setTodos(previous))` in toggleDone carry?',
        code: `const previous = todos
setTodos((prev) => prev.map(...))
fakeSaveApi().catch(() => setTodos(previous))`,
        options: [
          'It restores a whole-list snapshot, which can wipe out other optimistic changes made after the snapshot was taken',
          'It causes an infinite render loop',
          '`previous` is always undefined inside catch',
          'It marks every todo as error',
        ],
        answer: 0,
        explanation: 'Restoring a full copy of the list is simple and correct when only one change is in progress. If two changes overlap, restoring the older copy also undoes the newer change. Busy lists need to revert just the one item instead.',
      },
      {
        prompt: 'Which feature is a poor candidate for optimistic updates?',
        options: [
          'Liking a post',
          'Toggling a todo as done',
          'Submitting a payment',
          'Reordering a personal list',
        ],
        answer: 2,
        explanation: 'Showing a false success for a payment is actively harmful. Optimistic updates suit low-stakes, easily reversible actions.',
      },
      {
        prompt: 'Why is the checkbox disabled while a todo has status "saving"?',
        options: [
          'To prevent a second in-flight change to the same item whose rollback could overwrite the first',
          'Disabled checkboxes render faster',
          'React does not allow state changes during a promise',
          'The server rejects concurrent requests',
        ],
        answer: 0,
        explanation: 'Concurrent optimistic updates to the same item are a classic bug source. Locking the row is the simplest defence.',
      },
    ],
  },
  {
    challengeId: 'form-validation',
    questions: [
      {
        prompt: 'Why track a `touched` flag per field?',
        options: [
          'So the form can be submitted without validation',
          'So errors only render for fields the user has visited, avoiding a wall of red before they type',
          'Because React requires it for controlled inputs',
          'To count how many times each field was clicked',
        ],
        answer: 1,
        explanation: 'Validate-on-blur then live-update is the pattern most users find least annoying.',
      },
      {
        prompt: 'Which set of attributes makes a validation error reach assistive technology?',
        options: [
          'className="error" and a red border',
          'title on the input',
          'aria-invalid, aria-describedby pointing at the message, and role="alert" on the message',
          'data-error="true"',
        ],
        answer: 2,
        explanation: 'Visual styling alone is invisible to screen readers. These attributes announce the error and associate it with the input.',
      },
      {
        prompt: 'Why is the async username check debounced and cancellable?',
        options: [
          'Because setTimeout is required for all network calls',
          'To avoid spamming the server on every keystroke and to prevent stale checks resolving out of order',
          'Because React batches effects',
          'To make the "Checking availability…" hint visible longer',
        ],
        answer: 1,
        explanation: 'This is the same pattern as debounced search: wait 400ms after typing stops, then check, and abort superseded checks.',
      },
      {
        prompt: 'What does `handleSubmit` do to stop a user bypassing validation by clicking Submit quickly?',
        options: [
          'It reloads the page',
          'It marks every field touched and only proceeds if `isValid`, which is computed from raw values regardless of touched state',
          'It disables the button for 5 seconds',
          'It relies on the browser\'s native validation bubbles',
        ],
        answer: 1,
        explanation: 'Marking all fields touched surfaces every error at once; checking `isValid` guarantees the data really passes.',
      },
      {
        prompt: 'Why is the email regex intentionally loose?',
        options: [
          'Because JavaScript regex does not support the required syntax',
          'Matching the full official email format is a famous rabbit hole; a loose check catches typos and the real verification is a confirmation email',
          'Strict regexes are slower than network requests',
          'Loose regexes are required for aria-invalid to work',
        ],
        answer: 1,
        explanation: 'A very strict pattern rejects some real, unusual addresses and still cannot prove the inbox exists. Sending a confirmation email is the only real check.',
      },
    ],
  },
  {
    challengeId: 'data-table',
    questions: [
      {
        prompt: 'Why are the filtered and sorted rows derived in `useMemo` rather than stored in their own `useState`?',
        options: [
          'useState cannot hold arrays',
          'Storing derived data creates a second source of truth that can drift, and syncing it via useEffect adds a render of lag',
          'useMemo is required for tables',
          'It prevents the table from re-rendering at all',
        ],
        answer: 1,
        explanation: 'Deriving from the source of truth (optionally memoized) is simpler and always consistent.',
      },
      {
        prompt: 'What is wrong with `EMPLOYEES.sort(...)` instead of `[...filtered].sort(...)`?',
        options: [
          'It is slower',
          'Array.prototype.sort mutates in place, silently reordering the shared source data',
          'sort cannot be called on a const',
          'Nothing; they are equivalent',
        ],
        answer: 1,
        explanation: 'Mutating the shared array causes subtle bugs anywhere else it is used and can hide changes from React.',
      },
      {
        prompt: 'When does `useMemo` on an 8-row table make a measurable difference?',
        options: [
          'Always; it makes every render faster',
          'Never for 8 rows. It matters for large lists or expensive computations that would otherwise re-run on unrelated renders',
          'Only in production builds',
          'Only when the table has more than 3 columns',
        ],
        answer: 1,
        explanation: 'useMemo skips redoing a calculation when its inputs have not changed. That only matters when the calculation is slow or the list is big. Interviewers want you to know the tool and to admit when it is not needed.',
      },
      {
        prompt: 'What should clicking the currently active sort column do?',
        options: [
          'Reset to the default column',
          'Flip the sort direction',
          'Remove sorting entirely',
          'Nothing',
        ],
        answer: 1,
        explanation: 'Clicking a new column sorts ascending; clicking the active column toggles asc/desc.',
      },
      {
        prompt: 'At what point should sorting and filtering move to the server?',
        options: [
          'As soon as there is more than one column',
          'Once the dataset is too large to load into the browser in full, so the client only ever sees a slice',
          'Never; client-side is always faster',
          'Only when using TypeScript',
        ],
        answer: 1,
        explanation: 'Client-side operations only work while the whole dataset is in memory. Beyond that, send sort/filter state as query params.',
      },
    ],
  },
  {
    challengeId: 'accessible-modal',
    questions: [
      {
        prompt: 'Which combination correctly identifies a modal dialog to assistive technology?',
        options: [
          'class="modal" and position: fixed',
          'role="dialog", aria-modal="true", and aria-labelledby pointing at the title',
          'role="alert" and tabindex="0"',
          'aria-hidden="true" on the dialog',
        ],
        answer: 1,
        explanation: 'These tell screen readers it is a modal, that the page behind is inert, and what the dialog is called.',
      },
      {
        prompt: 'What is a focus trap?',
        options: [
          'Preventing the user from clicking outside the browser window',
          'Making Tab and Shift+Tab cycle only through the dialog\'s focusable elements, wrapping at the ends',
          'Disabling all buttons behind the modal',
          'Setting tabindex="-1" on the dialog',
        ],
        answer: 1,
        explanation: 'Without it, focus leaks to elements hidden under the backdrop, which is very confusing for keyboard users.',
      },
      {
        prompt: 'Why does `close()` call `triggerRef.current?.focus()`?',
        options: [
          'To re-open the dialog',
          'To restore keyboard position to where the user was before opening, instead of dumping them at the top of the page',
          'Because React requires focus to be set after state changes',
          'To trigger the onClick handler again',
        ],
        answer: 1,
        explanation: 'Restoring focus on close is one of the most frequently missed accessibility requirements.',
      },
      {
        prompt: 'Why does the inner dialog call `e.stopPropagation()` on click?',
        options: [
          'To prevent form submission',
          'So clicks inside the dialog do not bubble to the backdrop\'s onClick and close it',
          'To stop the Escape key',
          'To improve performance',
        ],
        answer: 1,
        explanation: 'Backdrop click closes; inside click must not.',
      },
      {
        prompt: 'What would you recommend for a production modal instead of a hand-rolled focus trap?',
        options: [
          'A div with a higher z-index',
          'The native <dialog> element with showModal(), or a well-tested library such as focus-trap-react',
          'An iframe',
          'Disabling keyboard events globally',
        ],
        answer: 1,
        explanation: 'Hand-rolling demonstrates understanding; production code should not re-solve edge cases like dynamically added focusable children.',
      },
    ],
  },
  {
    challengeId: 'shopping-cart',
    questions: [
      {
        prompt: 'What is the only piece of state the cart stores?',
        options: [
          'Subtotal, discount, shipping and total',
          'An array of products with prices',
          'A map of product id to quantity',
          'The last clicked button',
        ],
        answer: 2,
        explanation: 'Everything else is derived in one useMemo, so the displayed totals can never be stale or out of sync.',
      },
      {
        prompt: 'A user has 3 Mechanical Keyboards at $89 and nothing else. What is the total?',
        options: ['$267.00', '$255.30', '$240.30', '$282.00'],
        answer: 1,
        explanation: 'Subtotal 267. Bulk discount 10% = 26.70, leaving 240.30. That is under 400, so add $15 shipping: 255.30.',
      },
      {
        prompt: 'Is the bulk discount applied per line or across the whole cart?',
        options: [
          'Across the whole cart when total quantity reaches 3',
          'Per product line when that line\'s quantity reaches 3',
          'Only on the most expensive product',
          'On every line once any line reaches 3',
        ],
        answer: 1,
        explanation: 'Mixing three different products does not trigger it. Flagging this ambiguity is itself a good interview signal.',
      },
      {
        prompt: 'What should happen when a quantity is decremented from 1?',
        options: [
          'The row shows quantity 0',
          'The key is deleted from the cart so no empty line remains',
          'The quantity becomes -1',
          'The whole cart is cleared',
        ],
        answer: 1,
        explanation: 'Leaving a "0" row is a common bug interviewers look for.',
      },
      {
        prompt: 'Why is the free-shipping threshold checked against the post-discount total?',
        options: [
          'Because JavaScript evaluates discounts first',
          'It is a deliberate interpretation of an ambiguous spec, and should be confirmed with a PM',
          'Pre-discount totals are not available in useMemo',
          'Shipping is always free',
        ],
        answer: 1,
        explanation: '"Order total" is genuinely ambiguous. Pick one, make it explicit, and say so.',
      },
    ],
  },
  {
    challengeId: 'tabs-accordion',
    questions: [
      {
        prompt: 'In the WAI-ARIA tabs pattern, how many tabs should be in the sequential Tab order?',
        options: ['All of them', 'Only the active tab', 'None', 'The first and last'],
        answer: 1,
        explanation: 'This is called roving tabindex. The active tab has tabIndex 0 (in the Tab order) and the rest have -1 (reachable only by arrow keys), so pressing Tab jumps past the whole tab list in one press.',
      },
      {
        prompt: 'Which keys must move between tabs?',
        options: [
          'Enter and Space only',
          'ArrowLeft/ArrowRight, plus Home/End for first/last',
          'Page Up and Page Down',
          'Tab and Shift+Tab',
        ],
        answer: 1,
        explanation: 'Arrow keys move focus and selection; Home/End jump to the ends.',
      },
      {
        prompt: 'Why use the `hidden` attribute on inactive panels?',
        options: [
          'It animates the transition',
          'It removes the panel from the accessibility tree entirely, not just visually',
          'It is faster than CSS',
          'It keeps the panel focusable',
        ],
        answer: 1,
        explanation: 'Visually hiding via opacity or off-screen positioning leaves content readable by screen readers.',
      },
      {
        prompt: 'Why must the accordion header be a <button> rather than a <div onClick>?',
        options: [
          'Divs cannot have onClick',
          'A button is natively focusable and activates with Enter/Space; a div is invisible to keyboards',
          'Buttons are styled by default',
          'Only buttons can hold aria-expanded',
        ],
        answer: 1,
        explanation: 'Semantic elements give you keyboard behavior and a role for free.',
      },
      {
        prompt: 'What does `aria-controls` on a tab point to?',
        options: [
          'The tablist',
          'The tab\'s associated panel by id',
          'The next tab',
          'The heading',
        ],
        answer: 1,
        explanation: 'And the panel\'s aria-labelledby points back at the tab, completing the relationship.',
      },
    ],
  },
  {
    challengeId: 'pagination',
    questions: [
      {
        prompt: 'What does the `cancelled` flag in the effect cleanup prevent?',
        code: `useEffect(() => {
  let cancelled = false
  fakeFetchPage(page).then((res) => { if (cancelled) return; setItems(res.items) })
  return () => { cancelled = true }
}, [page])`,
        options: [
          'The user from clicking Next twice',
          'A slower response for a previously requested page landing after the current one and overwriting it',
          'React StrictMode double-invocation',
          'Memory leaks from closures',
        ],
        answer: 1,
        explanation: 'Click Page 3 then Page 1 quickly: without the flag, Page 3\'s data could arrive last and win.',
      },
      {
        prompt: 'What must a server-paginated API return besides the page of items?',
        options: [
          'The entire dataset for caching',
          'A total count (or total pages) so numbered controls can be rendered',
          'The user\'s session id',
          'Nothing else',
        ],
        answer: 1,
        explanation: 'Without a total, you cannot compute totalPages or disable Next correctly.',
      },
      {
        prompt: 'When is client-side pagination appropriate?',
        options: [
          'Always, because page switches are instant',
          'When the whole dataset is small enough to download and hold in memory',
          'Only for mobile',
          'Never',
        ],
        answer: 1,
        explanation: 'Hundreds of rows, not millions. The right answer in an interview is "it depends on data volume".',
      },
      {
        prompt: 'What is the main trade-off of cursor-based pagination versus numbered pages?',
        options: [
          'Cursors are slower',
          'Cursors scale better for huge or changing datasets but lose "jump to page N"',
          'Cursors require client-side sorting',
          'Numbered pages cannot show a loading state',
        ],
        answer: 1,
        explanation: 'Numbered buttons also need truncation past a couple dozen pages.',
      },
      {
        prompt: 'Why render placeholder rows while a page is loading?',
        options: [
          'To keep the layout height stable and show loading on every page change, not just initial mount',
          'Because empty lists throw errors',
          'To pre-fetch the next page',
          'To satisfy TypeScript',
        ],
        answer: 0,
        explanation: 'Interviewers check that loading feedback exists per page, not only once.',
      },
    ],
  },
  {
    challengeId: 'drag-drop-list',
    questions: [
      {
        prompt: 'What happens if `onDragOver` does not call `event.preventDefault()`?',
        options: [
          'The drag image disappears',
          'The element is not a valid drop target, so `onDrop` never fires',
          'The list re-renders twice',
          'Nothing; it is optional',
        ],
        answer: 1,
        explanation: 'Browsers refuse drops by default. This non-obvious line opts the element in.',
      },
      {
        prompt: 'Why does the demo include ↑/↓ buttons on every row?',
        options: [
          'For visual decoration',
          'Native HTML5 drag-and-drop has no keyboard equivalent, so a non-drag path is required for accessibility',
          'To support touch devices',
          'Because React does not support onDrop',
        ],
        answer: 1,
        explanation: 'A drag-only reorder is inaccessible by construction. The buttons are the actual fix, not a fallback.',
      },
      {
        prompt: 'What is the purpose of the visually hidden `aria-live="polite"` region?',
        options: [
          'To store the drag id',
          'To announce the result of each reorder to screen readers, since visual reordering communicates nothing to them',
          'To trap focus',
          'To improve drag performance',
        ],
        answer: 1,
        explanation: 'For example: "Task X moved to position 2 of 4."',
      },
      {
        prompt: 'How does the drop handler reorder the array?',
        options: [
          'It swaps the two ids in place',
          'It copies the array, splices the dragged item out, and splices it in at the target index',
          'It sorts by id',
          'It rebuilds the array from the DOM',
        ],
        answer: 1,
        explanation: 'Removing then re-inserting is easy to follow and works whether the item moves up or down. It touches every item once, which is fine for any realistic list size.',
      },
      {
        prompt: 'What would you recommend for a production drag-and-drop feature?',
        options: [
          'Native HTML5 DnD with more CSS',
          'A pointer-event-based library like dnd-kit for touch support, animation, and accessibility hooks',
          'jQuery UI',
          'Disabling drag on mobile',
        ],
        answer: 1,
        explanation: 'Native DnD has awkward APIs, inconsistent drag images, and no touch support.',
      },
    ],
  },
]

export function getTest(challengeId: string): TestModule | undefined {
  return testModules.find((m) => m.challengeId === challengeId)
}
