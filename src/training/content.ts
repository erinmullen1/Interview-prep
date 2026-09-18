export interface WalkthroughSection {
  /** Explanation of what to do and why, in plain language. */
  text: string
  /** The code to write for this part, shown directly below the explanation. */
  code?: string
}

export interface TrainingStep {
  title: string
  /** One sentence a beginner can hold onto. */
  summary: string
  /** The idea behind this step: what you are learning and why it matters. */
  concept: string
  /** Ordered teaching sections, each pairing an explanation with the code it produces. */
  walkthrough: WalkthroughSection[]
  /** Mistakes people commonly make on this step. */
  pitfalls?: string[]
  /** A question to answer in your own words before moving on. */
  checkpoint: string
}

export interface KeyTerm {
  term: string
  meaning: string
}

export interface TrainingModule {
  challengeId: string
  intro: string
  /** What you should be able to do after finishing. */
  outcomes: string[]
  /** Jargon used in this module, explained in plain words. */
  terms: KeyTerm[]
  steps: TrainingStep[]
}

export const trainingModules: TrainingModule[] = [
  // ---------------------------------------------------------------------------
  {
    challengeId: 'debounced-search',
    intro:
      'A search box that looks things up while you type seems simple. Underneath, it hides two classic problems: sending far too many requests, and slow answers arriving after fast ones and showing the wrong results. This module teaches the standard fix for both.',
    outcomes: [
      'Explain what debouncing is and pick a sensible delay',
      'Cancel requests that are no longer needed',
      'Write effects that clean up after themselves',
      'Show loading, results, and "nothing found" states correctly',
    ],
    terms: [
      { term: 'Controlled input', meaning: 'An input whose current text is stored in React state, so React (not the browser) is the source of truth.' },
      { term: 'Debounce', meaning: 'Wait until the user stops typing for a moment before doing something, instead of doing it on every keystroke.' },
      { term: 'Race condition', meaning: 'A bug where two things happen at once and the wrong one finishes last. Here: an old search response landing after a newer one.' },
      { term: 'AbortController', meaning: 'A built-in browser tool that lets you cancel a request you started earlier.' },
      { term: 'Effect cleanup', meaning: 'The function you return from useEffect. React runs it before the effect runs again, and when the component is removed.' },
    ],
    steps: [
      {
        title: 'Set up the input and the state',
        summary: 'Store what the user types, the results, and whether we are waiting, all in React state.',
        concept:
          'Before adding any clever behaviour, lay out the pieces of information the feature needs to remember. There are three: the text in the box, the list of results, and whether a request is currently running. Keeping the text in React state (a "controlled input") means the rest of the component can react whenever it changes.',
        walkthrough: [
          {
            text: 'Declare the three pieces of state. `input` is exactly what the user has typed. `results` is what came back from the last search. `loading` is true while we are waiting for an answer.',
            code: `import { useEffect, useRef, useState } from 'react'

export default function DebouncedSearch() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)`,
          },
          {
            text: 'Render the input. `value` reads from state and `onChange` writes back to it. The label is linked to the input with `htmlFor` and `id`, so screen readers announce it and clicking the label focuses the box.',
            code: `  return (
    <div>
      <label htmlFor="search-input">Search libraries</label>
      <input
        id="search-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Try 'react' or 'css'…"
      />
    </div>
  )
}`,
          },
          {
            text: 'You need something to search. In an interview you will usually fake the server. This function filters a fixed list after a random delay. The random delay matters: it means a slow request can finish after a fast one, which is exactly the bug you will fix in step 3. It also accepts an `AbortSignal` so it can be cancelled.',
            code: `const CATALOG = ['React', 'React Router', 'Redux', 'Vue', 'Svelte', 'TypeScript', 'Vite', 'Tailwind CSS']

function fakeSearchApi(query: string, signal: AbortSignal): Promise<string[]> {
  const latency = 200 + Math.random() * 600
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(CATALOG.filter((item) => item.toLowerCase().includes(query.toLowerCase())))
    }, latency)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}`,
          },
        ],
        pitfalls: [
          'Reading the text straight from the DOM with a ref. It works, but nothing else in the component can respond when it changes.',
          'Leaving out the label. An unlabelled input is an accessibility failure interviewers spot straight away.',
        ],
        checkpoint: 'In your own words: what is a controlled input, and why do we want one here?',
      },
      {
        title: 'Wait for the user to pause (debounce)',
        summary: 'Keep a second copy of the text that only updates 300ms after typing stops.',
        concept:
          'If you search on every keystroke, typing "react" sends five requests. Debouncing means waiting for a short pause before acting. You keep a second state value, `debounced`, that catches up with `input` only after 300ms of silence. Each new keystroke restarts the clock. The trick that makes this work is effect cleanup: React runs the previous cleanup before running the effect again, so the old timer is cancelled for you.',
        walkthrough: [
          {
            text: 'Add the second state value.',
            code: `const [debounced, setDebounced] = useState('')`,
          },
          {
            text: 'Write an effect that runs whenever `input` changes. It starts a 300ms timer that copies `input` into `debounced`. The cleanup cancels the timer. Trace it: type "r", "e", "a" quickly. Three effects run, but the first two timers are cancelled before they fire, so `setDebounced` runs once, with "rea".',
            code: `useEffect(() => {
  const timer = setTimeout(() => setDebounced(input), 300)
  return () => clearTimeout(timer)
}, [input])`,
          },
          {
            text: 'Why 300ms? Shorter feels snappier but sends more requests. Longer saves requests but starts to feel sluggish. Anything from 200 to 400ms is normal. Be ready to explain this rather than treating the number as magic.',
          },
        ],
        pitfalls: [
          'Doing the search inside this same effect. It works, but now typing speed and network speed are tangled together and harder to reason about.',
          'Forgetting the cleanup. Then every keystroke eventually fires its own timer and you are back to one search per key.',
        ],
        checkpoint: 'A user types three letters within 300ms. How many times does `setDebounced` run, and why?',
      },
      {
        title: 'Search, and cancel searches that are out of date',
        summary: 'Fetch when the debounced text changes, and cancel the previous fetch so an old answer can never overwrite a new one.',
        concept:
          'Now fetch whenever `debounced` changes. The subtle bug: you search "re", it is slow. You then search "react", it is fast. "react" results show, then the "re" results arrive and replace them. That is a race condition. The fix is to cancel the previous request whenever a new one starts. `AbortController` is the browser tool for this, and the effect cleanup is the natural place to call it.',
        walkthrough: [
          {
            text: 'Keep the current controller in a ref. A ref is a box that survives re-renders without causing them.',
            code: `const abortRef = useRef<AbortController | null>(null)`,
          },
          {
            text: 'Start the effect. If the box is empty, clear everything and stop. Otherwise cancel the previous controller, make a new one, mark loading, and call the API with the new signal.',
            code: `useEffect(() => {
  if (!debounced.trim()) {
    setResults([])
    setLoading(false)
    return
  }
  abortRef.current?.abort()
  const controller = new AbortController()
  abortRef.current = controller
  setLoading(true)`,
          },
          {
            text: 'Handle the answer. On success, store results and stop loading. In the catch, an `AbortError` is expected, not a failure: a newer request is running and is in charge of the loading flag, so do nothing. Return a cleanup that aborts. That covers both "a newer search started" and "the component was removed".',
            code: `  fakeSearchApi(debounced, controller.signal)
    .then((data) => {
      setResults(data)
      setLoading(false)
    })
    .catch((err) => {
      if (err.name !== 'AbortError') setLoading(false)
    })
  return () => controller.abort()
}, [debounced])`,
          },
        ],
        pitfalls: [
          'Setting loading to false on AbortError. That briefly shows "0 results" while the newer request is still running.',
          'Not cleaning up on unmount. You get a React warning about updating state on a component that no longer exists.',
        ],
        checkpoint: 'Walk through the "re" then "react" example without cancellation, then with it. At what exact line does the stale result get stopped?',
      },
      {
        title: 'Show loading, results, and "no matches"',
        summary: 'Every async UI needs three visible states: waiting, got data, got nothing.',
        concept:
          'Users need to tell the difference between "still searching", "here are results", and "nothing matched". Forgetting the last one is one of the most common gaps in take-home submissions.',
        walkthrough: [
          {
            text: 'A status line: say "Searching…" while loading, otherwise show a count.',
            code: `<div>{loading ? 'Searching…' : \`\${results.length} result\${results.length === 1 ? '' : 's'}\`}</div>`,
          },
          {
            text: 'The list, plus the empty message. The empty message has three guards: not loading (or it flashes before data arrives), the debounced text is not blank (an untouched box should be empty, not say "No matches"), and results are empty.',
            code: `<ul>
  {results.map((r) => (
    <li key={r}>{r}</li>
  ))}
  {!loading && debounced && results.length === 0 && <li>No matches.</li>}
</ul>`,
          },
          {
            text: 'Notice the guard checks `debounced`, not `input`. Between a keystroke and the timer firing, `input` is ahead of the results. Checking it would show "No matches" for text we have not searched yet.',
          },
        ],
        checkpoint: 'Why does the "No matches" check use `debounced` instead of `input`?',
      },
      {
        title: 'Review, then tidy up',
        summary: 'Check the interviewer list, then pull the debounce into a reusable hook.',
        concept:
          'Before you call it done, check it against what interviewers actually look for. Then notice that the debounce logic has nothing to do with search and could be reused anywhere.',
        walkthrough: [
          {
            text: 'Checklist: stale responses cancelled (abort in cleanup), timers and requests cleaned up on unmount, loading and empty states visible, label present.',
          },
          {
            text: 'The debounce effect is generic. Move it into a custom hook. Same code, just given a name and parameters. The component now reads as "debounce, then fetch".',
            code: `function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// in the component:
const debounced = useDebouncedValue(input, 300)`,
          },
          {
            text: 'Know the alternative. Throttling runs at a fixed rate no matter what (for example, at most once every 200ms), which suits things like tracking scroll position. Debouncing waits for a pause, which suits search because half-typed words are not worth searching.',
          },
        ],
        checkpoint: 'Give one situation where throttling is the better choice, and one where debouncing is.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'infinite-scroll',
    intro:
      'Infinite scroll loads more items as you near the bottom of a list. The old way listens to scroll events and does pixel maths. The modern way asks the browser to tell you when an invisible marker comes into view. This module builds the modern way and covers the accessibility conversation you should be ready for.',
    outcomes: [
      'Explain why IntersectionObserver beats scroll listeners',
      'Load pages of data without requesting the same page twice',
      'Use functional state updates correctly',
      'Discuss the accessibility trade-offs of infinite scroll',
    ],
    terms: [
      { term: 'Sentinel', meaning: 'An invisible element placed at the end of the list. When it comes into view, we know the user has reached the bottom.' },
      { term: 'IntersectionObserver', meaning: 'A browser feature that tells you when an element becomes visible on screen, without you checking scroll position yourself.' },
      { term: 'Functional update', meaning: 'Calling setState with a function, like `setItems((prev) => ...)`, so you always work from the latest value.' },
      { term: 'Stale closure', meaning: 'A function that captured an old value of a variable and keeps using it after the variable has changed.' },
    ],
    steps: [
      {
        title: 'Track what has been loaded',
        summary: 'Keep the items so far, the next page number, whether more exist, and whether a request is running.',
        concept:
          'The browser never has the whole list. So it must remember what it has, which page comes next, and whether there is anything left. A paged API sends back items plus some signal that says "more" or "done".',
        walkthrough: [
          {
            text: 'Fake a paged API. It returns one page of items and a `hasMore` flag after a short delay.',
            code: `const PAGE_SIZE = 15
const TOTAL_ITEMS = 120

function fakeFetchPage(page: number): Promise<{ items: string[]; hasMore: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = page * PAGE_SIZE
      const items = Array.from({ length: PAGE_SIZE }, (_, i) => \`Item #\${start + i + 1}\`)
        .filter((_, i) => start + i < TOTAL_ITEMS)
      resolve({ items, hasMore: start + PAGE_SIZE < TOTAL_ITEMS })
    }, 500)
  })
}`,
          },
          {
            text: 'Declare the state. `loading` is not just for a spinner: in step 3 it stops us requesting the same page twice.',
            code: `const [items, setItems] = useState<string[]>([])
const [page, setPage] = useState(0)
const [hasMore, setHasMore] = useState(true)
const [loading, setLoading] = useState(false)`,
          },
        ],
        checkpoint: 'Why can the browser not work out on its own whether more pages exist?',
      },
      {
        title: 'Write the function that loads the next page',
        summary: 'Fetch the current page, add its items to the end, and move the page counter on.',
        concept:
          'One function does the fetching. Because the new list depends on the old list, use a functional update so you always append to the latest version. Wrap it in `useCallback` so step 3 can list it as a dependency without recreating the observer on every render.',
        walkthrough: [
          {
            text: 'Fetch, then append. `setItems((prev) => [...prev, ...newItems])` reads the newest list at the moment it runs. `setItems([...items, ...newItems])` would use whatever `items` was when the function was created, and can silently drop a page.',
            code: `const loadNext = useCallback(() => {
  setLoading(true)
  fakeFetchPage(page).then(({ items: newItems, hasMore: more }) => {
    setItems((prev) => [...prev, ...newItems])
    setHasMore(more)
    setPage((p) => p + 1)
    setLoading(false)
  })
}, [page])`,
          },
          {
            text: 'Load the first page when the component appears. The empty dependency list means "run once". (In development, React StrictMode mounts components twice, so you may see the first page twice. Production builds do not do this.)',
            code: `useEffect(() => {
  loadNext()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])`,
          },
        ],
        pitfalls: ['Using `items` directly inside the promise callback. This stale-closure bug is the number one infinite-scroll mistake.'],
        checkpoint: 'What could go wrong if `loadNext` used `setItems([...items, ...newItems])`?',
      },
      {
        title: 'Watch a marker at the bottom of the list',
        summary: 'Put an invisible element after the last item and ask the browser to tell you when it appears.',
        concept:
          'Instead of measuring scroll position on every scroll event, place a tiny invisible element (the sentinel) after the last item and let `IntersectionObserver` tell you when it scrolls into view. The browser does this efficiently in the background. There is no throttling to write and no pixel maths to get wrong.',
        walkthrough: [
          {
            text: 'Create a ref and render a 1px-tall div after the items, inside the scrolling box.',
            code: `const sentinelRef = useRef<HTMLDivElement | null>(null)

// inside the scroll container, after the items:
<div ref={sentinelRef} style={{ height: 1 }} />`,
          },
          {
            text: 'Set up the observer in an effect. Stop early if there is no element or nothing more to load. `rootMargin: "200px"` makes the observer fire when the sentinel is within 200px of the visible area, so loading starts before the user actually hits the bottom. In the callback, only load if the sentinel is visible and nothing is already loading. Disconnect in cleanup.',
            code: `useEffect(() => {
  const node = sentinelRef.current
  if (!node || !hasMore) return
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading) loadNext()
    },
    { rootMargin: '200px' },
  )
  observer.observe(node)
  return () => observer.disconnect()
}, [hasMore, loading, loadNext])`,
          },
          {
            text: 'The dependency list matters. When `loading` flips or the page changes, the effect re-runs with fresh values, so the callback never uses an out-of-date `loading`.',
          },
        ],
        pitfalls: [
          'Forgetting the `!loading` check. The observer can fire repeatedly while the sentinel is on screen, requesting the same page again and duplicating items.',
          'Not disconnecting. Each re-run would leave another observer running.',
        ],
        checkpoint: 'What does `rootMargin` change about when the callback fires, and why is that helpful?',
      },
      {
        title: 'Finish the UI and know the trade-offs',
        summary: 'Show progress and an end message, and be able to explain why infinite scroll has accessibility costs.',
        concept:
          'The visible states are easy. The harder part is knowing infinite scroll has real downsides for keyboard and screen-reader users, and being able to say so in an interview even while you build it.',
        walkthrough: [
          {
            text: 'Show a count, a loading line, and an end-of-list line.',
            code: `<div>Scrollable feed ({items.length}/{TOTAL_ITEMS} loaded)</div>
<div style={{ height: 260, overflowY: 'auto' }}>
  {items.map((item) => <div key={item}>{item}</div>)}
  <div ref={sentinelRef} style={{ height: 1 }} />
  {loading && <p>Loading more…</p>}
  {!hasMore && <p>You've reached the end.</p>}
</div>`,
          },
          {
            text: 'The trade-off: someone navigating by keyboard or screen reader can get stuck in a page that keeps growing and never reach the footer. Items are also hard to bookmark by position. A common compromise is infinite scroll for mouse users plus a real "Load more" button as an escape hatch. Raising this without being asked is a strong signal.',
          },
        ],
        checkpoint: 'Name one accessibility problem with infinite scroll and one practical way to reduce it.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'optimistic-todo',
    intro:
      'An optimistic UI updates the screen straight away, before the server has confirmed, then undoes the change if the server says no. It is how modern apps feel instant. The skill is in the failure path: every change needs a way to roll back, and the right way depends on what the user would lose.',
    outcomes: [
      'Implement the optimistic update pattern from start to finish',
      'Choose between "show an error" and "revert to a snapshot" rollbacks',
      'Avoid two overlapping changes to the same item',
      'Know when optimistic updates are a bad idea',
    ],
    terms: [
      { term: 'Optimistic update', meaning: 'Show the change immediately, assuming the server will accept it. Fix things up afterwards if it does not.' },
      { term: 'Pessimistic update', meaning: 'The opposite: wait for the server to confirm before showing the change. Safer but feels slower.' },
      { term: 'Rollback', meaning: 'Undoing an optimistic change because the server rejected it.' },
      { term: 'Snapshot', meaning: 'A saved copy of the state from before a change, so you can restore it.' },
    ],
    steps: [
      {
        title: 'Give each todo a save status',
        summary: 'Each item records whether it is saved, saving, or failed, so each row can show its own state.',
        concept:
          'Each row needs to show whether its last change is pending, confirmed, or failed. The simplest way is a `status` field on the todo itself. And because you cannot test rollback without failures, the fake server must fail sometimes.',
        walkthrough: [
          {
            text: 'The model. `status` is a small set of allowed strings that drives how the row looks.',
            code: `interface Todo {
  id: string
  text: string
  done: boolean
  status: 'saved' | 'saving' | 'error'
}`,
          },
          {
            text: 'A flaky fake server that fails about 30% of the time. If it never fails while you develop, you will ship a rollback that has never actually run.',
            code: `function fakeSaveApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (Math.random() < 0.3 ? reject(new Error('Network error')) : resolve()), 700)
  })
}`,
          },
          {
            text: 'Starting state, plus the text in the input box.',
            code: `const [todos, setTodos] = useState<Todo[]>([
  { id: 'a', text: 'Review pull request', done: false, status: 'saved' },
  { id: 'b', text: 'Write unit tests', done: true, status: 'saved' },
])
const [text, setText] = useState('')`,
          },
        ],
        checkpoint: 'Why is a fake server that always succeeds risky for this feature?',
      },
      {
        title: 'Add a todo optimistically, keep it on failure',
        summary: 'Insert the todo immediately. If saving fails, mark it as failed rather than deleting it.',
        concept:
          'When the user adds a todo, put it in the list straight away with `status: "saving"` and clear the input. If the save fails, do not delete the row: the user typed that text, and throwing it away destroys their work. Mark it as failed and offer a retry.',
        walkthrough: [
          {
            text: 'Make an id, add the item, clear the input. All before any network call. The functional update means this works even if other changes are mid-flight.',
            code: `let nextId = 1

function addTodo() {
  if (!text.trim()) return
  const id = \`t\${nextId++}\`
  setTodos((prev) => [...prev, { id, text, done: false, status: 'saving' }])
  setText('')`,
          },
          {
            text: 'Send the save. On success, set that one item to `saved`. On failure, set it to `error`. Both branches find the item by id and leave everything else untouched.',
            code: `  fakeSaveApi()
    .then(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'saved' } : t))))
    .catch(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'error' } : t))))
}`,
          },
        ],
        pitfalls: ['Removing the item on failure. Interviewers will ask what happened to the text the user typed.'],
        checkpoint: 'Why is "mark as error" the right rollback for adding, rather than "remove the row"?',
      },
      {
        title: 'Toggle "done" optimistically, revert on failure',
        summary: 'Flip the checkbox immediately. If saving fails, restore the list from a saved copy.',
        concept:
          'Toggling "done" is different: undoing it loses nothing, so the simplest rollback is to save a copy of the list before changing it and restore that copy on failure. This is easy and correct for one change at a time. It has a known weakness with overlapping changes, which you should be able to describe.',
        walkthrough: [
          {
            text: 'Save a copy, apply the optimistic flip, restore the copy on failure.',
            code: `function toggleDone(id: string) {
  const previous = todos
  setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done, status: 'saving' } : t)))
  fakeSaveApi()
    .then(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'saved' } : t))))
    .catch(() => setTodos(previous))
}`,
          },
          {
            text: 'The weakness: toggle A, then toggle B, then A fails. Restoring A\'s snapshot also undoes B\'s change, because the snapshot was taken before B. For busy lists you would revert just the one field. The demo avoids the worst case by disabling a checkbox while its row is saving.',
          },
        ],
        pitfalls: ['Taking the snapshot inside the functional updater. It must be captured before the optimistic write, as a plain variable.'],
        checkpoint: 'Describe two toggles in a row where restoring the whole snapshot gives the wrong result.',
      },
      {
        title: 'Retry, show status per row, and know the limits',
        summary: 'Give failed rows a Retry button, lock rows while saving, and know when not to be optimistic.',
        concept:
          'A failed row needs a way out. Add retry, show status on each row, and disable rows that are mid-save so two changes cannot overlap. Then be ready to say when optimistic updates are the wrong tool.',
        walkthrough: [
          {
            text: 'Retry is the add flow without the insert.',
            code: `function retry(id: string) {
  setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'saving' } : t)))
  fakeSaveApi()
    .then(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'saved' } : t))))
    .catch(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'error' } : t))))
}`,
          },
          {
            text: 'Each row. The checkbox is disabled while saving so two changes to one item cannot overlap. Failed rows show a message and a Retry button.',
            code: `<li key={t.id}>
  <input type="checkbox" checked={t.done} onChange={() => toggleDone(t.id)} disabled={t.status === 'saving'} />
  <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
  {t.status === 'saving' && <span>Saving…</span>}
  {t.status === 'error' && (
    <>
      <span>Failed to save</span>
      <button onClick={() => retry(t.id)}>Retry</button>
    </>
  )}
</li>`,
          },
          {
            text: 'When not to do this: anywhere showing a false success would hurt. Payments, deleting something permanently, sending a message. For those, wait for the server and show a spinner.',
          },
        ],
        checkpoint: 'Name a feature where an optimistic update would be harmful, and say why.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'form-validation',
    intro:
      'A three-field signup form sounds easy. It actually combines instant checks (is this long enough?), a server check (is this username taken?), and error messages that must work for screen readers. This module builds it by hand so you understand what form libraries do for you.',
    outcomes: [
      'Show errors at the right moment, not too early',
      'Compute validation from state instead of storing it',
      'Debounce and cancel a server-side check',
      'Make error messages reach screen readers',
    ],
    terms: [
      { term: 'Touched', meaning: 'A field the user has visited and left at least once. We only show errors for touched fields.' },
      { term: 'Derived value', meaning: 'Something computed from state during render, rather than stored in state itself. Errors here are derived.' },
      { term: 'aria-invalid', meaning: 'An attribute that tells assistive technology the field currently has a problem.' },
      { term: 'aria-describedby', meaning: 'Links a field to another element (like an error message) so that message is read out when the field is focused.' },
      { term: 'role="alert"', meaning: 'Makes a screen reader announce the element\'s text as soon as it appears.' },
    ],
    steps: [
      {
        title: 'Track which fields the user has visited',
        summary: 'Only show an error for a field after the user has left it once.',
        concept:
          'Showing "too short" while someone is still typing their first letter is hostile. The pattern most users like: check when they leave the field, then update live after that. To do this you record which fields have been visited ("touched").',
        walkthrough: [
          {
            text: 'State for each field, plus a `touched` record keyed by field name.',
            code: `const [username, setUsername] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [touched, setTouched] = useState<Record<string, boolean>>({})`,
          },
          {
            text: 'Each input marks itself touched when it loses focus (`onBlur`). Merge into the record so other fields keep their value.',
            code: `<input
  id="fv-username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  onBlur={() => setTouched((t) => ({ ...t, username: true }))}
/>`,
          },
        ],
        checkpoint: 'Compare checking on every keystroke, checking on blur, and checking only on submit. What annoys users about each one alone?',
      },
      {
        title: 'Work out errors during render',
        summary: 'Errors are computed from the values every render, never stored in state.',
        concept:
          'The error for a field depends only on its current value and whether it is touched. So compute it during render. Storing errors in state and keeping them in sync with an effect adds a delay of one render and creates a second copy that can drift out of date.',
        walkthrough: [
          {
            text: 'Build an `errors` object each render. Each rule applies only if the field is touched.',
            code: `interface Errors { username?: string; email?: string; password?: string }

const errors: Errors = {}
if (touched.username && username.trim().length < 3) errors.username = 'Username must be at least 3 characters.'
if (touched.email && !/^\\S+@\\S+\\.\\S+$/.test(email)) errors.email = 'Enter a valid email address.'
if (touched.password && password.length < 8) errors.password = 'Password must be at least 8 characters.'`,
          },
          {
            text: 'Compute `isValid` separately from the raw values, ignoring `touched`. This is what submit checks. If it respected `touched`, an untouched form would count as valid.',
            code: `const isValid =
  username.trim().length >= 3 &&
  /^\\S+@\\S+\\.\\S+$/.test(email) &&
  password.length >= 8`,
          },
          {
            text: 'The email pattern is deliberately loose: some text, an @, some text, a dot, some text. Trying to match the full email specification is a famous rabbit hole and still cannot prove the inbox exists. The real check is sending a confirmation email.',
          },
        ],
        pitfalls: ['Keeping `errors` in state and updating it in an effect. Compute it instead.'],
        checkpoint: 'Why must `isValid` ignore `touched` while `errors` uses it?',
      },
      {
        title: 'Check the username with the server',
        summary: 'Wait 400ms after typing stops, ask the server, and cancel the check if the user keeps typing.',
        concept:
          '"Is this username taken?" needs a server call. Doing it on every keystroke floods the server and can return answers out of order. This is the debounced-search pattern again: wait 400ms after typing stops, run the check, and cancel it if a newer keystroke arrives.',
        walkthrough: [
          {
            text: 'A fake check that can be cancelled.',
            code: `const TAKEN = ['admin', 'root', 'test']

function checkUsernameAvailable(username: string, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(!TAKEN.includes(username.toLowerCase())), 500)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}`,
          },
          {
            text: 'The effect: skip short values, start a timer, run the check when it fires, and clean up both the timer and the request. The cleanup handles every case: typed again before 400ms (timer cancelled), typed again during the request (request cancelled), left the page (both).',
            code: `const [usernameChecking, setUsernameChecking] = useState(false)
const [usernameTaken, setUsernameTaken] = useState(false)

useEffect(() => {
  if (username.trim().length < 3) {
    setUsernameTaken(false)
    return
  }
  const controller = new AbortController()
  const timer = setTimeout(() => {
    setUsernameChecking(true)
    checkUsernameAvailable(username, controller.signal)
      .then((available) => {
        setUsernameTaken(!available)
        setUsernameChecking(false)
      })
      .catch(() => {})
  }, 400)
  return () => {
    clearTimeout(timer)
    controller.abort()
  }
}, [username])`,
          },
          {
            text: 'Feed the result into the errors and into `isValid`.',
            code: `else if (touched.username && usernameTaken) errors.username = 'That username is already taken.'
// and add \`&& !usernameTaken\` to isValid`,
          },
        ],
        checkpoint: 'List the three situations the cleanup handles, and say what would go wrong in each without it.',
      },
      {
        title: 'Make errors reach screen readers',
        summary: 'Red text is invisible to a screen reader. Three attributes fix that.',
        concept:
          'A red message under a field means nothing to someone who cannot see it. Three attributes make it real for assistive technology. `aria-invalid` flags the field as having a problem. `aria-describedby` links the message to the field so it is read when the field is focused. `role="alert"` announces the message the moment it appears.',
        walkthrough: [
          {
            text: 'On the input, set both attributes only when there is an error, so nothing points at an element that does not exist.',
            code: `<input
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'fv-email-error' : undefined}
/>`,
          },
          {
            text: 'Render the message with the matching id and the alert role.',
            code: `{errors.email && (
  <p id="fv-email-error" role="alert">{errors.email}</p>
)}`,
          },
          {
            text: 'Wrap this in a small `Field` component so the wiring is written once and every field gets it.',
            code: `function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <p id={\`\${htmlFor}-error\`} role="alert">{error}</p>}
    </div>
  )
}`,
          },
        ],
        checkpoint: 'What does each of `aria-invalid`, `aria-describedby` and `role="alert"` do for someone using a screen reader?',
      },
      {
        title: 'Handle submit properly',
        summary: 'On submit, mark every field touched and only continue if the data is really valid.',
        concept:
          'A user can click Submit without ever leaving a field, so no errors would be showing. Submit must mark everything touched (so all errors appear at once) and check real validity. Also turn off the browser\'s built-in validation so its popups do not compete with your messages.',
        walkthrough: [
          {
            text: 'Stop the page reload, mark all touched, continue only if valid.',
            code: `function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setTouched({ username: true, email: true, password: true })
  if (isValid) setSubmitted(true)
}

<form onSubmit={handleSubmit} noValidate>`,
          },
          {
            text: 'When to use a library: three fields by hand is fine and easy to follow. Ten or more fields, nested data, or rules shared with the server point toward React Hook Form plus a schema library like Zod, so the rules live in one place.',
          },
        ],
        checkpoint: 'Why mark every field touched on submit, rather than just refusing to submit?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'data-table',
    intro:
      'A table you can filter by typing and sort by clicking a column is the classic "mini admin panel" exercise. The real lesson is about derived state: compute the rows from the original data plus a few settings, instead of storing copies that can go out of date.',
    outcomes: [
      'Compute filtered and sorted rows instead of storing them',
      'Sort a copy, never the original array',
      'Explain when useMemo helps and when it is unnecessary',
      'Handle "no results" and know when to move the work to the server',
    ],
    terms: [
      { term: 'Derived state', meaning: 'Values you calculate from other state during render, rather than storing separately. The sorted rows are derived from the data plus the sort settings.' },
      { term: 'useMemo', meaning: 'A React hook that remembers the result of a calculation and only redoes it when its inputs change.' },
      { term: 'Mutate', meaning: 'Change an array or object in place. `Array.sort` mutates; spreading into a new array does not.' },
      { term: 'localeCompare', meaning: 'A string comparison that handles accents and case sensibly, for sorting text.' },
    ],
    steps: [
      {
        title: 'The data and the three settings',
        summary: 'The user controls three things: filter text, sort column, sort direction. Those are the state. The rows are not.',
        concept:
          'The only things the user changes are what they typed in the filter box, which column to sort by, and which direction. Those three values are state. The rows on screen are calculated from them and from the original data. They are not state themselves.',
        walkthrough: [
          {
            text: 'The row type and a fixed dataset.',
            code: `interface Employee { id: number; name: string; department: string; salary: number }

const EMPLOYEES: Employee[] = [
  { id: 1, name: 'Alex Chen', department: 'Engineering', salary: 118000 },
  { id: 2, name: 'Priya Patel', department: 'Design', salary: 96000 },
  { id: 3, name: 'Jordan Smith', department: 'Engineering', salary: 132000 },
]`,
          },
          {
            text: 'The three settings. Typing `sortKey` as `keyof Employee` means TypeScript stops you sorting by a column that does not exist.',
            code: `type SortKey = keyof Employee
type SortDir = 'asc' | 'desc'

const [filter, setFilter] = useState('')
const [sortKey, setSortKey] = useState<SortKey>('name')
const [sortDir, setSortDir] = useState<SortDir>('asc')`,
          },
        ],
        pitfalls: ['Adding a `rows` state and updating it in an effect whenever the settings change. It lags one render behind and can drift from the source.'],
        checkpoint: 'What exactly decides which rows appear, and why is the list of rows not stored in state?',
      },
      {
        title: 'Calculate the rows with useMemo',
        summary: 'Filter first, then sort a copy, and only recalculate when the inputs change.',
        concept:
          'Filter first, then sort. Sorting must be done on a copy because `Array.sort` changes the array in place, and changing the shared dataset breaks anything else that uses it. `useMemo` remembers the result so unrelated re-renders do not redo the work.',
        walkthrough: [
          {
            text: 'Filter by name or department, ignoring case.',
            code: `const rows = useMemo(() => {
  const q = filter.toLowerCase()
  const filtered = EMPLOYEES.filter(
    (e) => e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q),
  )`,
          },
          {
            text: 'Copy into a new array before sorting. Compare numbers by subtracting and strings with `localeCompare`. Flip the result for descending. List every input as a dependency.',
            code: `  return [...filtered].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })
}, [filter, sortKey, sortDir])`,
          },
          {
            text: 'Be honest about `useMemo`: with eight rows it makes no measurable difference. It is here to show you know that filtering and sorting would otherwise re-run on every render, and that you know the tool. Say that, rather than claiming it is a performance win.',
          },
        ],
        pitfalls: ['Calling `EMPLOYEES.sort(...)` with no copy. Interviewers look for this specifically.'],
        checkpoint: 'What are two separate problems caused by sorting the original array in place?',
      },
      {
        title: 'Make column headers sortable',
        summary: 'Click a new column to sort ascending. Click the current column to flip direction.',
        concept:
          'Clicking a new column sorts it ascending. Clicking the column that is already active flips the direction. Show an arrow so the current state is visible.',
        walkthrough: [
          {
            text: 'The toggle logic.',
            code: `function toggleSort(key: SortKey) {
  if (key === sortKey) {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
  } else {
    setSortKey(key)
    setSortDir('asc')
  }
}`,
          },
          {
            text: 'Render headers from a list of columns so adding one later is a single line.',
            code: `const columns: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'salary', label: 'Salary' },
]

<thead>
  <tr>
    {columns.map((col) => (
      <th key={col.key} onClick={() => toggleSort(col.key)} style={{ cursor: 'pointer' }}>
        {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
      </th>
    ))}
  </tr>
</thead>`,
          },
          {
            text: 'A clickable `<th>` cannot be reached with the keyboard. If asked, the fix is a `<button>` inside the header, plus `aria-sort` on the `<th>` to announce the current direction.',
          },
        ],
        checkpoint: 'How would you make these headers work from the keyboard, and which attribute tells a screen reader the sort direction?',
      },
      {
        title: 'Handle "no results" and know when to stop',
        summary: 'Show a message when nothing matches, and know when this must move to the server.',
        concept:
          'Handle the empty case, then be ready for the follow-up question: what changes when there are thousands of rows?',
        walkthrough: [
          {
            text: 'One full-width row when nothing matches.',
            code: `<tbody>
  {rows.map((row) => (
    <tr key={row.id}>
      <td>{row.name}</td>
      <td>{row.department}</td>
      <td>\${row.salary.toLocaleString()}</td>
    </tr>
  ))}
  {rows.length === 0 && (
    <tr>
      <td colSpan={3}>No matching rows.</td>
    </tr>
  )}
</tbody>`,
          },
          {
            text: 'Filtering and sorting in the browser only works while the whole dataset is in the browser. Once you have thousands of rows, the server must do it: the table sends the filter, column and direction as query parameters and receives one page back. The Pagination module covers that side.',
          },
        ],
        checkpoint: 'At what point does this approach stop working, and what does the server need to accept instead?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'accessible-modal',
    intro:
      'Visually, a modal is just a box on top of a dark overlay. Making it work for people using a keyboard or screen reader is where most submissions fall short. This module builds the four things that make it a real dialog: the right ARIA attributes, focus moved in, focus kept in, and focus put back afterwards.',
    outcomes: [
      'Apply role="dialog", aria-modal and aria-labelledby',
      'Move focus into the dialog and return it on close',
      'Keep Tab and Shift+Tab inside the dialog',
      'Close on Escape and backdrop click, but not on inner clicks',
    ],
    terms: [
      { term: 'ARIA', meaning: 'A set of HTML attributes that describe what things are and how they behave, for screen readers and other assistive technology.' },
      { term: 'Focus', meaning: 'The one element on the page that receives keyboard input. Tab moves it forward, Shift+Tab moves it back.' },
      { term: 'Focus trap', meaning: 'Keeping focus inside the dialog: Tab from the last element wraps to the first, and Shift+Tab from the first wraps to the last.' },
      { term: 'Backdrop', meaning: 'The dark overlay behind the dialog that covers the rest of the page.' },
      { term: 'Event propagation', meaning: 'A click on an element also fires on its parents. `stopPropagation()` prevents that.' },
    ],
    steps: [
      {
        title: 'State, refs, and putting focus back',
        summary: 'Remember the button that opened the dialog so you can return focus to it on close.',
        concept:
          'You need to remember two elements: the button that opened the dialog (so you can send focus back to it) and the dialog box (so you can find the buttons inside it). Returning focus is the piece people forget most often, so build it into `close()` from the start.',
        walkthrough: [
          {
            text: 'The open flag and both refs.',
            code: `const [open, setOpen] = useState(false)
const triggerRef = useRef<HTMLButtonElement | null>(null)
const dialogRef = useRef<HTMLDivElement | null>(null)`,
          },
          {
            text: 'Close hides the dialog and puts focus back on the trigger. Without this, focus falls to the top of the page and a keyboard user loses their place.',
            code: `function close() {
  setOpen(false)
  triggerRef.current?.focus()
}

<button ref={triggerRef} onClick={() => setOpen(true)}>Open dialog</button>`,
          },
        ],
        checkpoint: 'What happens to a keyboard user on close if focus is not put back?',
      },
      {
        title: 'The right markup and click behaviour',
        summary: 'Tell screen readers this is a dialog. Backdrop click closes; inside click does not.',
        concept:
          '`role="dialog"` tells assistive technology what this is. `aria-modal="true"` says the rest of the page is off-limits while it is open. `aria-labelledby` gives it a name from its heading. Clicking the dark backdrop should close it; clicking inside should not, which means stopping the click from bubbling up from the inner box.',
        walkthrough: [
          {
            text: 'The backdrop is the click-to-close target. The inner box carries the ARIA attributes and swallows its own clicks.',
            code: `{open && (
  <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }}>
    <div
      ref={dialogRef}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h3 id="modal-title">Confirm action</h3>
      <p>Are you sure?</p>
      <button onClick={close}>Cancel</button>
      <button onClick={close}>Confirm</button>
    </div>
  </div>
)}`,
          },
        ],
        pitfalls: ['Styling a box to look like a modal with no role. To a screen reader it is just more page content.'],
        checkpoint: 'What would happen when clicking inside the dialog if `stopPropagation` were removed?',
      },
      {
        title: 'Move focus in and handle Escape',
        summary: 'When the dialog opens, focus its first button. Escape closes it.',
        concept:
          'When the dialog opens, focus should land inside it so keyboard users do not have to Tab through the whole page to reach it. Escape should close it. Both live in an effect that runs when `open` becomes true and cleans up when it becomes false.',
        walkthrough: [
          {
            text: 'Find the focusable elements with a selector covering the common cases, and focus the first one.',
            code: `useEffect(() => {
  if (!open) return
  const dialog = dialogRef.current
  const focusable = dialog?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  focusable?.[0]?.focus()`,
          },
          {
            text: 'Listen on `document` so Escape works no matter which element inside has focus. Remove the listener in cleanup.',
            code: `  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close()
      return
    }
    // Tab handling goes here in the next step
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [open])`,
          },
        ],
        checkpoint: 'Why listen for keys on `document` rather than on the dialog element?',
      },
      {
        title: 'Keep Tab inside the dialog',
        summary: 'Tab from the last button wraps to the first. Shift+Tab from the first wraps to the last.',
        concept:
          'Normally, pressing Tab on the last button in the dialog moves focus to the page behind it. Sighted users cannot see where it went; everyone else is confused. The focus trap catches Tab at the edges and wraps focus around.',
        walkthrough: [
          {
            text: 'Inside the keydown handler: Tab on the last element jumps to the first; Shift+Tab on the first jumps to the last. `preventDefault()` stops the browser also moving focus.',
            code: `if (e.key === 'Tab' && focusable && focusable.length > 0) {
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}`,
          },
          {
            text: 'A limitation worth mentioning: the list of focusable elements is captured once, when the dialog opens. If buttons are added or removed while it is open, the trap is out of date. That is one reason production code should prefer the browser\'s built-in `<dialog>` element with `showModal()`, which traps focus and handles Escape itself, or a tested library like focus-trap-react.',
          },
        ],
        checkpoint: 'Name two things the built-in `<dialog>` element does for you that this version does by hand.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'shopping-cart',
    intro:
      'A cart with quantities, a bulk discount and a shipping rule is really a state-management exercise. The lesson: keep the stored state tiny and calculate every number from it, so the total can never be wrong.',
    outcomes: [
      'Keep one source of truth and derive everything else from it',
      'Change quantities without leaving empty lines behind',
      'Write business rules explicitly and point out where they are ambiguous',
      'Choose a shape for the state and explain why',
    ],
    terms: [
      { term: 'Source of truth', meaning: 'The one place a piece of information is stored. Everything else is calculated from it.' },
      { term: 'Record', meaning: 'An object used as a lookup table, like `{ p1: 2, p3: 1 }` meaning two of product p1 and one of p3.' },
      { term: 'Line', meaning: 'One product in the cart, with its quantity and its own subtotal.' },
      { term: 'Immutable update', meaning: 'Making a changed copy instead of editing the original, so React notices the change.' },
    ],
    steps: [
      {
        title: 'Store as little as possible',
        summary: 'The only state is a map of product id to quantity. Every price is calculated from it.',
        concept:
          'The bug you see constantly in take-homes is a `total` stored in state and updated in three different places, which eventually disagree. The structural fix: store only `{ productId: quantity }`. Subtotal, discount, shipping and total are calculated, never stored.',
        walkthrough: [
          {
            text: 'The products and the rule numbers. Naming the numbers makes the rules visible and easy to change.',
            code: `interface Product { id: string; name: string; price: number }

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Mechanical Keyboard', price: 89 },
  { id: 'p2', name: 'Ultrawide Monitor', price: 349 },
  { id: 'p3', name: 'Standing Desk', price: 429 },
]

const FREE_SHIPPING_THRESHOLD = 400
const BULK_DISCOUNT_THRESHOLD = 3
const BULK_DISCOUNT_RATE = 0.1`,
          },
          {
            text: 'The cart is a record from product id to quantity. Looking up or changing one product is instant. An array of `{ productId, qty }` would need a search for every change.',
            code: `const [cart, setCart] = useState<Record<string, number>>({})`,
          },
        ],
        checkpoint: 'Describe how a stored `total` ends up wrong. Which actions would all have to update it?',
      },
      {
        title: 'Add and remove, cleaning up at zero',
        summary: 'Increase is simple. Decrease must delete the product when its quantity would hit zero.',
        concept:
          'Adding is simple. Removing has one edge case: when the quantity would become zero, delete the product from the record so no "0" row is left behind. Both must copy the object before changing it, because React only notices a change if it gets a new object.',
        walkthrough: [
          {
            text: 'Add: copy, then set the product to one more than it was (defaulting to zero).',
            code: `function addItem(id: string) {
  setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
}`,
          },
          {
            text: 'Remove: copy, then either delete the key or reduce it.',
            code: `function removeItem(id: string) {
  setCart((prev) => {
    const next = { ...prev }
    if (next[id] <= 1) delete next[id]
    else next[id] -= 1
    return next
  })
}`,
          },
        ],
        pitfalls: ['Changing `prev` directly. React sees the same object and does not re-render.'],
        checkpoint: 'Why must `removeItem` copy the object rather than deleting from `prev`?',
      },
      {
        title: 'Calculate every number in one place',
        summary: 'One useMemo turns the cart into subtotal, discount, shipping and total.',
        concept:
          'One calculation over the cart produces every number on screen. The discount is per product: 10% off a line when that line has 3 or more. Shipping depends on the total after discount. Both of those are interpretations of a spec that could be read other ways, and saying so is part of the exercise.',
        walkthrough: [
          {
            text: 'Turn each cart entry into a line with its subtotal and discount.',
            code: `const summary = useMemo(() => {
  const lines = Object.entries(cart).map(([id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id)!
    const lineSubtotal = product.price * qty
    const bulkDiscount = qty >= BULK_DISCOUNT_THRESHOLD ? lineSubtotal * BULK_DISCOUNT_RATE : 0
    return { product, qty, lineSubtotal, bulkDiscount }
  })`,
          },
          {
            text: 'Add up the totals. Shipping is free when the cart is empty (no order, no fee) or when the after-discount amount reaches the threshold.',
            code: `  const subtotal = lines.reduce((sum, l) => sum + l.lineSubtotal, 0)
  const totalDiscount = lines.reduce((sum, l) => sum + l.bulkDiscount, 0)
  const afterDiscount = subtotal - totalDiscount
  const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : 15
  const total = afterDiscount + shipping
  return { lines, subtotal, totalDiscount, shipping, total }
}, [cart])`,
          },
          {
            text: 'Check by hand: 3 keyboards at $89 is $267. Ten percent off is $26.70, leaving $240.30. That is under $400, so shipping is $15 and the total is $255.30. If your number differs, check whether you applied the discount per line or across the whole cart.',
          },
        ],
        checkpoint: '"Free shipping over $400." Before or after the discount? Discount per product or across the cart? What should you do when a spec is unclear like this?',
      },
      {
        title: 'Show it and check it',
        summary: 'Render product rows with plus and minus, then the summary block.',
        concept:
          'The UI is a product list with quantity buttons and a summary. The minus button is disabled when the product is not in the cart. Because every figure comes from `summary`, there is no way for the display to be out of date.',
        walkthrough: [
          {
            text: 'Product rows.',
            code: `{PRODUCTS.map((p) => (
  <div key={p.id}>
    <span>{p.name} — \${p.price}</span>
    <button onClick={() => removeItem(p.id)} disabled={!cart[p.id]}>−</button>
    <span>{cart[p.id] ?? 0}</span>
    <button onClick={() => addItem(p.id)}>+</button>
  </div>
))}`,
          },
          {
            text: 'Summary rows. Show the discount as a negative number.',
            code: `<Row label="Subtotal" value={summary.subtotal} />
<Row label="Bulk discount" value={-summary.totalDiscount} />
<Row label="Shipping" value={summary.shipping} />
<Row label="Total" value={summary.total} bold />`,
          },
        ],
        checkpoint: 'Give one advantage and one cost of storing the cart as a record keyed by id rather than as an array.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'tabs-accordion',
    intro:
      'Tabs and accordions are a few boxes and click handlers, until someone says "now make it work with a keyboard". This module builds both to the official WAI-ARIA patterns, so you understand what UI libraries do for you under the hood.',
    outcomes: [
      'Connect tabs and panels with the right roles and ids',
      'Implement roving tabindex',
      'Handle arrow, Home and End keys',
      'Build an accordion with real buttons and aria-expanded',
    ],
    terms: [
      { term: 'WAI-ARIA patterns', meaning: 'Official, published recipes for how common widgets (tabs, dialogs, menus) should behave for keyboard and screen-reader users.' },
      { term: 'tabindex', meaning: 'Controls whether an element can receive keyboard focus. 0 means "in the normal Tab order", -1 means "focusable by code only".' },
      { term: 'Roving tabindex', meaning: 'Only one item in a group is in the Tab order at a time. Arrow keys move between the rest.' },
      { term: 'hidden attribute', meaning: 'Removes an element from both the screen and the accessibility tree, so screen readers skip it entirely.' },
      { term: 'aria-expanded', meaning: 'Tells assistive technology whether a section controlled by this button is currently open.' },
    ],
    steps: [
      {
        title: 'Tab markup and the links between tabs and panels',
        summary: 'Each tab points at its panel, each panel points back, and hidden panels are truly hidden.',
        concept:
          'The tabs pattern is a set of roles plus id links. The tab list holds the tabs. Each tab names its panel with `aria-controls`, and each panel names its tab with `aria-labelledby`. Panels that are not active use the `hidden` attribute, which removes them for screen readers too, not just visually.',
        walkthrough: [
          {
            text: 'The data and the active index.',
            code: `const TABS = [
  { id: 'overview', label: 'Overview', content: 'High-level summary.' },
  { id: 'specs', label: 'Specs', content: 'Technical specifications.' },
  { id: 'reviews', label: 'Reviews', content: 'Customer reviews.' },
]

const [active, setActive] = useState(0)`,
          },
          {
            text: 'The tab list and the tabs. Each tab is a real `<button>`, so it can be focused and pressed with Enter or Space with no extra work.',
            code: `<div role="tablist" aria-label="Product info">
  {TABS.map((tab, i) => (
    <button
      key={tab.id}
      role="tab"
      id={\`tab-\${tab.id}\`}
      aria-selected={active === i}
      aria-controls={\`panel-\${tab.id}\`}
      onClick={() => setActive(i)}
    >
      {tab.label}
    </button>
  ))}
</div>`,
          },
          {
            text: 'Render every panel and hide the inactive ones. Rendering all of them keeps the ids stable for the links above.',
            code: `{TABS.map((tab, i) => (
  <div
    key={tab.id}
    role="tabpanel"
    id={\`panel-\${tab.id}\`}
    aria-labelledby={\`tab-\${tab.id}\`}
    hidden={active !== i}
  >
    {tab.content}
  </div>
))}`,
          },
        ],
        checkpoint: 'For a screen reader, what is the difference between `hidden` and `opacity: 0`?',
      },
      {
        title: 'Only one tab in the Tab order',
        summary: 'Pressing Tab should jump past the whole tab list in one press.',
        concept:
          'Pressing Tab should skip past the whole tab list in one go, like it does with a native dropdown. Only the active tab is in the Tab order; the others are reached with arrow keys. This is called roving tabindex. It needs a ref for each tab so you can focus them from code.',
        walkthrough: [
          {
            text: 'Collect a ref per tab button and set `tabIndex` based on whether it is active.',
            code: `const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

<button
  ref={(el) => { tabRefs.current[i] = el }}
  tabIndex={active === i ? 0 : -1}
  ...
/>`,
          },
          {
            text: 'Try it both ways: with every tab at `tabIndex=0`, a keyboard user presses Tab three times to get past the widget. With roving tabindex it is one press.',
          },
        ],
        checkpoint: 'Why is it a problem for keyboard users if every tab is in the normal Tab order?',
      },
      {
        title: 'Arrow, Home and End keys',
        summary: 'Arrows move between tabs and wrap at the ends. Home and End jump to first and last.',
        concept:
          'Arrow keys move both focus and selection, wrapping from last to first. Home and End jump to the ends. Every other key must be left alone for the browser to handle.',
        walkthrough: [
          {
            text: 'Work out the next index. The modulo (`%`) gives wrap-around. Return early for keys you do not handle, so you never block Tab or Enter.',
            code: `function handleKeyDown(e: React.KeyboardEvent) {
  let next = active
  if (e.key === 'ArrowRight') next = (active + 1) % TABS.length
  else if (e.key === 'ArrowLeft') next = (active - 1 + TABS.length) % TABS.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = TABS.length - 1
  else return
  e.preventDefault()
  setActive(next)
  tabRefs.current[next]?.focus()
}

<div role="tablist" onKeyDown={handleKeyDown}>`,
          },
          {
            text: 'The `(active - 1 + TABS.length) % TABS.length` form is needed because in JavaScript `-1 % 3` is `-1`, not `2`.',
          },
        ],
        pitfalls: ['Calling `preventDefault()` before the early return. That breaks Tab and Enter inside the tab list.'],
        checkpoint: 'Why does the handler return early for keys it does not recognise, rather than just doing nothing?',
      },
      {
        title: 'An accordion with real buttons',
        summary: 'A button in a heading, aria-expanded on the button, hidden on the panel.',
        concept:
          'The accordion is simpler. Each section has a heading containing a button. The button has `aria-expanded` to say whether it is open and `aria-controls` to link to its panel. A `<button>` rather than a clickable div gives you focus and keyboard activation for free. This version allows one open section at a time.',
        walkthrough: [
          {
            text: 'State is a single id, or null for all closed.',
            code: `const [openId, setOpenId] = useState<string | null>('shipping')`,
          },
          {
            text: 'Each section: header button inside an `<h4>`, panel with `role="region"` and `hidden`.',
            code: `{ITEMS.map((item) => {
  const isOpen = openId === item.id
  return (
    <div key={item.id}>
      <h4>
        <button
          id={\`accordion-header-\${item.id}\`}
          aria-expanded={isOpen}
          aria-controls={\`accordion-panel-\${item.id}\`}
          onClick={() => setOpenId(isOpen ? null : item.id)}
        >
          {item.title} <span>{isOpen ? '−' : '+'}</span>
        </button>
      </h4>
      <div
        id={\`accordion-panel-\${item.id}\`}
        role="region"
        aria-labelledby={\`accordion-header-\${item.id}\`}
        hidden={!isOpen}
      >
        {item.body}
      </div>
    </div>
  )
})}`,
          },
          {
            text: 'To allow several open at once, change `openId` to a `Set<string>` and add or remove ids. In production, use a library like Radix or React Aria that already encodes these patterns plus edge cases you have not thought of.',
          },
        ],
        checkpoint: 'What would you change to allow more than one accordion section open at once?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'pagination',
    intro:
      'Numbered pages over a server API is one of the most common admin-list requests. It is also a design conversation: where should the paging logic live, and how do you stop a slow response for page 3 overwriting the fast response for page 1?',
    outcomes: [
      'Fake a server that returns one page plus a total',
      'Ignore out-of-date responses with a cancelled flag',
      'Show loading feedback on every page change',
      'Compare client-side, server-side and cursor-based paging',
    ],
    terms: [
      { term: 'Client-side pagination', meaning: 'Download everything once, then split it into pages in the browser.' },
      { term: 'Server-side pagination', meaning: 'Ask the server for one page at a time. The browser never has the full list.' },
      { term: 'Cursor-based pagination', meaning: 'Instead of page numbers, the server gives you a token that means "the next batch after this one".' },
      { term: 'Skeleton', meaning: 'Grey placeholder rows shown while real data loads, so the layout does not jump.' },
    ],
    steps: [
      {
        title: 'A server that returns one page at a time',
        summary: 'Given a page number, the fake server returns just that slice plus the total count.',
        concept:
          'Real pagination means the browser never has everything. The fake server must behave the same way: given a page number, return that slice and the total count, nothing else. The total is what lets you draw the numbered buttons.',
        walkthrough: [
          {
            text: 'The fake API. Pages start at 1 here because that is what the UI shows.',
            code: `const PAGE_SIZE = 5
const TOTAL_ITEMS = 43
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, (_, i) => \`Order #\${1000 + i}\`)

function fakeFetchPage(page: number): Promise<{ items: string[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * PAGE_SIZE
      resolve({ items: ALL_ITEMS.slice(start, start + PAGE_SIZE), total: TOTAL_ITEMS })
    }, 350)
  })
}`,
          },
          {
            text: 'State, plus the page count calculated from the total. `Math.max(1, …)` avoids showing "page 1 of 0" before the first response.',
            code: `const [page, setPage] = useState(1)
const [items, setItems] = useState<string[]>([])
const [total, setTotal] = useState(0)
const [loading, setLoading] = useState(true)

const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))`,
          },
        ],
        checkpoint: 'Why does the server need to send `total` when it only returns five items?',
      },
      {
        title: 'Fetch when the page changes, ignoring old answers',
        summary: 'A flag set in cleanup tells a slow, out-of-date response to throw its result away.',
        concept:
          'Click page 3, then quickly page 1. If page 3\'s answer is slower, it arrives last and overwrites page 1. A local `cancelled` flag, set to true in the cleanup, tells the old response to drop its result. This is a lighter alternative to AbortController when you only need to ignore a result rather than cancel the request itself.',
        walkthrough: [
          {
            text: 'The effect. Each run has its own `cancelled` variable. The cleanup for that run sets it before the next run starts.',
            code: `useEffect(() => {
  let cancelled = false
  setLoading(true)
  fakeFetchPage(page).then((res) => {
    if (cancelled) return
    setItems(res.items)
    setTotal(res.total)
    setLoading(false)
  })
  return () => {
    cancelled = true
  }
}, [page])`,
          },
          {
            text: 'Compared with AbortController: the flag ignores the answer; abort stops the request. Use abort when the request is real and cancelling saves bandwidth. Use the flag when you only need to ignore a result or the API cannot be cancelled.',
          },
        ],
        checkpoint: 'Trace the page-3-then-page-1 sequence and show where the out-of-date result is stopped.',
      },
      {
        title: 'Placeholder rows and page buttons',
        summary: 'Show grey rows while loading. Prev and Next are disabled at the ends.',
        concept:
          'Loading feedback must show on every page change, not just the first. Placeholder rows keep the height stable so the buttons do not jump around. Prev and Next are clamped and disabled at the edges.',
        walkthrough: [
          {
            text: 'Placeholders while loading.',
            code: `<ul>
  {loading
    ? Array.from({ length: PAGE_SIZE }).map((_, i) => <li key={i} style={{ color: '#bbb' }}>Loading…</li>)
    : items.map((item) => <li key={item}>{item}</li>)}
</ul>`,
          },
          {
            text: 'The controls. Clamp inside the handlers so a fast double-click cannot go out of range.',
            code: `<button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
  <button key={p} onClick={() => setPage(p)} aria-current={p === page ? 'page' : undefined}>
    {p}
  </button>
))}
<button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
<p>Page {page} of {totalPages}</p>`,
          },
        ],
        checkpoint: 'Why show placeholder rows rather than an empty list while loading?',
      },
      {
        title: 'The pagination design conversation',
        summary: 'Which approach you pick depends on how much data there is.',
        concept:
          'Interviewers will ask which approach you would pick for a given dataset. The right answer starts with "it depends on the amount of data", followed by the trade-offs.',
        walkthrough: [
          {
            text: 'Client-side: download everything once, split it in the browser. Page switches are instant and the code is simple. Only works while the whole dataset is small enough to download and keep in memory. Hundreds of rows, not millions.',
          },
          {
            text: 'Server-side with page numbers (this module): one network round-trip per page, which the user sees as a loading state. Required once the data is too big to send whole. The server must also sort and filter before paging, because the browser only ever sees a slice. Numbered buttons need shortening ("1 2 3 … 8 9") past a couple of dozen pages.',
          },
          {
            text: 'Cursor-based: "next" and "previous" tokens instead of page numbers. Scales to huge or constantly changing data, and avoids rows being skipped or shown twice when data moves. But you lose "jump to page 7".',
          },
        ],
        checkpoint: 'A list has 300 rows. Which approach do you pick and why? What changes at 3 million rows, or when new rows arrive constantly?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'drag-drop-list',
    intro:
      'The browser has built-in drag-and-drop, so you need no library. But it has one famous gotcha and one built-in accessibility gap. This module builds a reorderable list, handles both, and explains when you would reach for a library instead.',
    outcomes: [
      'Wire up dragstart, dragover, drop and dragend',
      'Understand why preventDefault in dragover is required',
      'Reorder a list without changing the original array',
      'Provide a keyboard alternative and announce changes to screen readers',
    ],
    terms: [
      { term: 'HTML5 Drag and Drop', meaning: 'The browser\'s built-in drag support: mark an element `draggable` and handle a few events.' },
      { term: 'Drop target', meaning: 'An element that accepts a dropped item. Browsers refuse drops unless you opt in with preventDefault in dragover.' },
      { term: 'Splice', meaning: 'An array method that removes and/or inserts items at a given position.' },
      { term: 'Live region', meaning: 'An element with `aria-live` whose text changes are read out by screen readers automatically.' },
    ],
    steps: [
      {
        title: 'The list, and which item is being dragged',
        summary: 'Track the items, the item being dragged, and the item the pointer is over.',
        concept:
          'You need the list, which item is currently being dragged, and which item the pointer is hovering over (to draw a drop indicator). The live-region ref is for announcements later.',
        walkthrough: [
          {
            text: 'The model and starting data.',
            code: `interface Task { id: string; text: string }

const INITIAL: Task[] = [
  { id: 't1', text: 'Design the onboarding flow' },
  { id: 't2', text: 'Write API documentation' },
  { id: 't3', text: 'Fix Safari flexbox bug' },
  { id: 't4', text: 'Ship v2.4 release' },
]`,
          },
          {
            text: 'State and refs. `dragId` and `overId` are separate because they change at different moments and control different visuals.',
            code: `const [tasks, setTasks] = useState<Task[]>(INITIAL)
const [dragId, setDragId] = useState<string | null>(null)
const [overId, setOverId] = useState<string | null>(null)
const liveRegionRef = useRef<HTMLDivElement | null>(null)`,
          },
        ],
        checkpoint: 'What does `overId` control on screen, and why is it separate from `dragId`?',
      },
      {
        title: 'The drag events, including the famous gotcha',
        summary: 'You must call preventDefault in dragover, or drop silently never fires.',
        concept:
          'By default, browsers do not let you drop on most elements. Calling `preventDefault()` in the `dragover` handler is what says "this element accepts drops". Forget it and `onDrop` never fires, with no error message. This catches almost everyone the first time.',
        walkthrough: [
          {
            text: 'Record the dragged id on start. On dragover, prevent default and update `overId` only when it changes, to avoid re-rendering on every pixel of mouse movement.',
            code: `function handleDragStart(id: string) {
  setDragId(id)
}

function handleDragOver(e: React.DragEvent, id: string) {
  e.preventDefault() // required: without this, onDrop never fires
  if (id !== overId) setOverId(id)
}`,
          },
          {
            text: 'Wire them on each row, and clear state on dragend so a cancelled drag does not leave a stale highlight.',
            code: `<li
  key={task.id}
  draggable
  onDragStart={() => handleDragStart(task.id)}
  onDragOver={(e) => handleDragOver(e, task.id)}
  onDrop={() => handleDrop(task.id)}
  onDragEnd={() => { setDragId(null); setOverId(null) }}
  style={{
    border: overId === task.id && dragId !== task.id ? '2px dashed #6366f1' : '1px solid #e4e4ec',
    opacity: dragId === task.id ? 0.5 : 1,
  }}
>`,
          },
        ],
        pitfalls: ['Leaving out `preventDefault()` in dragover. The symptom is "drop does nothing", with no error to help you.'],
        checkpoint: 'What exactly happens when `preventDefault()` is missing from `dragover`, and why is it hard to debug?',
      },
      {
        title: 'Reorder on drop',
        summary: 'Take the dragged item out of the array and put it back at the target position.',
        concept:
          'Remove the dragged item from the array and insert it at the target\'s position. Do this on a copy so React sees a new array. Write the announcement text in the same update so it reflects the final positions.',
        walkthrough: [
          {
            text: 'Handle the do-nothing cases, then splice.',
            code: `function handleDrop(targetId: string) {
  if (!dragId || dragId === targetId) {
    setDragId(null)
    setOverId(null)
    return
  }
  setTasks((prev) => {
    const next = [...prev]
    const fromIndex = next.findIndex((t) => t.id === dragId)
    const toIndex = next.findIndex((t) => t.id === targetId)
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = \`\${moved.text} moved to position \${toIndex + 1} of \${next.length}.\`
    }
    return next
  })
  setDragId(null)
  setOverId(null)
}`,
          },
          {
            text: 'Remove-then-insert is easy to reason about and handles moving up or down without any index adjustments.',
          },
        ],
        checkpoint: 'Why must the reorder work on `[...prev]` rather than on `prev` directly?',
      },
      {
        title: 'Keyboard buttons and announcements',
        summary: 'Built-in drag has no keyboard version, so add up/down buttons and announce each move.',
        concept:
          'The browser\'s drag-and-drop has no keyboard equivalent at all. A list you can only reorder by dragging is unusable for keyboard users, and no amount of ARIA fixes that. Up and down buttons are the real fix. And because a visual reorder says nothing to a screen reader, a live region announces every move.',
        walkthrough: [
          {
            text: 'Swap with the neighbour and announce.',
            code: `function moveByKeyboard(id: string, direction: -1 | 1) {
  setTasks((prev) => {
    const index = prev.findIndex((t) => t.id === id)
    const target = index + direction
    if (target < 0 || target >= prev.length) return prev
    const next = [...prev]
    ;[next[index], next[target]] = [next[target], next[index]]
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = \`\${next[target].text} moved to position \${target + 1} of \${next.length}.\`
    }
    return next
  })
}`,
          },
          {
            text: 'Buttons on each row with labels that say what they do, disabled at the ends.',
            code: `<button aria-label={\`Move \${task.text} up\`} onClick={() => moveByKeyboard(task.id, -1)} disabled={i === 0}>↑</button>
<button aria-label={\`Move \${task.text} down\`} onClick={() => moveByKeyboard(task.id, 1)} disabled={i === tasks.length - 1}>↓</button>`,
          },
          {
            text: 'The live region is hidden visually but still present for screen readers. `polite` means it waits for the reader to finish its current sentence.',
            code: `<div
  ref={liveRegionRef}
  aria-live="polite"
  style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
/>`,
          },
          {
            text: 'When to use a library: the built-in API is awkward, drag images look different across browsers, and there is no touch support. Libraries like dnd-kit rebuild dragging from pointer events, adding touch, animation and accessibility hooks. Most production apps should use one.',
          },
        ],
        checkpoint: 'Why are the arrow buttons a requirement rather than a nice extra?',
      },
    ],
  },
]

export function getTraining(challengeId: string): TrainingModule | undefined {
  return trainingModules.find((m) => m.challengeId === challengeId)
}
