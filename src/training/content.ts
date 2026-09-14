export interface WalkthroughSection {
  /** Explanation of what to do and why. */
  text: string
  /** The code to write for this part, shown directly below the explanation. */
  code?: string
}

export interface TrainingStep {
  title: string
  /** The idea behind this step: what you are learning and why it matters. */
  concept: string
  /** Ordered teaching sections, each pairing an explanation with the code it produces. */
  walkthrough: WalkthroughSection[]
  /** Mistakes people commonly make on this step. */
  pitfalls?: string[]
  /** A question to answer in your own words before moving on. */
  checkpoint: string
}

export interface TrainingModule {
  challengeId: string
  intro: string
  /** What you should be able to do after finishing. */
  outcomes: string[]
  steps: TrainingStep[]
}

export const trainingModules: TrainingModule[] = [
  // ---------------------------------------------------------------------------
  {
    challengeId: 'debounced-search',
    intro:
      'A search box that fetches as the user types looks trivial, but it hides two classic problems: hammering the network on every keystroke, and slow responses arriving after fast ones. This module teaches the standard fix for both.',
    outcomes: [
      'Explain debouncing and choose a sensible delay',
      'Cancel stale requests with AbortController',
      'Structure async effects with proper cleanup',
      'Render loading, results and empty states correctly',
    ],
    steps: [
      {
        title: 'Controlled input and result state',
        concept:
          'In React, the input\'s text should live in state so the component, not the DOM, is the source of truth. That lets other logic (like the debounce in the next step) react to changes declaratively. Start by declaring every piece of state the feature needs, so the shape of the problem is clear before writing behaviour.',
        walkthrough: [
          {
            text: 'Declare three pieces of state. `input` is exactly what the user has typed. `results` holds whatever the API returned last. `loading` tells the UI whether a request is in flight.',
            code: `import { useEffect, useRef, useState } from 'react'

export default function DebouncedSearch() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)`,
          },
          {
            text: 'Render a labelled, controlled input. `value` comes from state and `onChange` writes back to it. The `htmlFor`/`id` pair links the label to the field so screen readers announce it and clicking the label focuses the input.',
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
            text: 'You also need something to search against. In an interview you will usually mock the API. Write a function that filters a static list after a random delay, and accepts an `AbortSignal` so it can be cancelled later. The random latency is deliberate: it makes out-of-order responses possible, which is the bug you are about to solve.',
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
          'Reading the value from the DOM with a ref instead of state. It works, but nothing else in the component can react to changes.',
          'Forgetting the label. An unlabelled input is an accessibility failure interviewers notice immediately.',
        ],
        checkpoint: 'In your own words: what does "controlled input" mean, and what does it buy you here?',
      },
      {
        title: 'Debounce the typed value',
        concept:
          'Debouncing means waiting until the user pauses before acting. Instead of firing a request per keystroke, you keep a second state value, `debounced`, that only catches up with `input` after 300ms of silence. Every new keystroke restarts the clock. The key mechanism is the effect cleanup: React runs the previous effect\'s cleanup before running the new one, so the pending timer is cancelled automatically.',
        walkthrough: [
          {
            text: 'Add the `debounced` state next to the others.',
            code: `const [debounced, setDebounced] = useState('')`,
          },
          {
            text: 'Write an effect that depends only on `input`. It starts a 300ms timer that copies `input` into `debounced`. The returned cleanup clears the timer. Trace what happens when the user types "r", "e", "a" quickly: three effects run, but the first two timers are cleared before firing, so `setDebounced` runs once, with "rea".',
            code: `useEffect(() => {
  const timer = setTimeout(() => setDebounced(input), 300)
  return () => clearTimeout(timer)
}, [input])`,
          },
          {
            text: 'Why 300ms? Shorter feels more instant but sends more requests; longer saves requests but starts to feel laggy. 200 to 400ms is the usual range. Be ready to say this out loud rather than treating the number as magic.',
          },
        ],
        pitfalls: [
          'Putting the fetch inside this same effect. It works, but it couples typing timing with network timing and makes both harder to reason about.',
          'Forgetting the cleanup, which means every keystroke eventually fires its own `setDebounced`.',
        ],
        checkpoint: 'Explain the sequence of events when a user types three characters within 300ms. How many times does `setDebounced` run?',
      },
      {
        title: 'Fetch on the debounced value and cancel stale requests',
        concept:
          'Now fetch only when `debounced` changes. The subtle bug here is a race: request A for "re" might be slow and request B for "react" fast, so A\'s response lands last and overwrites the correct results with stale ones. The fix is to abort the previous request whenever a new one starts. AbortController is the browser primitive for this, and the effect cleanup is the natural place to call it.',
        walkthrough: [
          {
            text: 'Keep the current controller in a ref so it survives re-renders without causing them.',
            code: `const abortRef = useRef<AbortController | null>(null)`,
          },
          {
            text: 'Write the fetch effect. If the query is blank, clear everything and return early. Otherwise abort any previous controller, create a fresh one, flag loading, and call the API with its signal.',
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
            text: 'Handle the promise. On success store results and clear loading. In the catch, an `AbortError` is expected, not a failure: a newer request is now in flight and owns the loading flag, so do nothing. Return a cleanup that aborts, which covers both "a newer value arrived" and "the component unmounted".',
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
          'Clearing `loading` on AbortError. That shows "0 results" for a moment while the newer request is still running.',
          'Not cleaning up on unmount, which leads to setState on an unmounted component.',
        ],
        checkpoint: 'Walk through the "re" then "react" race without abort, then with it. Where exactly does the stale write get stopped?',
      },
      {
        title: 'Render loading, results and empty states',
        concept:
          'Every async UI has at least three states the user must be able to distinguish: waiting, data, and no data. Missing the empty state is one of the most common gaps in take-home submissions.',
        walkthrough: [
          {
            text: 'Show a status line. While loading say so; otherwise show the count.',
            code: `<div>{loading ? 'Searching…' : \`\${results.length} result\${results.length === 1 ? '' : 's'}\`}</div>`,
          },
          {
            text: 'Render the list. Then add the empty message, guarded three ways: not loading (otherwise it flashes before data arrives), the debounced query is non-empty (an untouched box should be blank, not "No matches"), and results are empty.',
            code: `<ul>
  {results.map((r) => (
    <li key={r}>{r}</li>
  ))}
  {!loading && debounced && results.length === 0 && <li>No matches.</li>}
</ul>`,
          },
          {
            text: 'Note the guard uses `debounced`, not `input`. Between a keystroke and the debounce firing, `input` is ahead of the results, and checking it would show a misleading empty message.',
          },
        ],
        checkpoint: 'Why does the empty-state guard check `debounced` rather than `input`?',
      },
      {
        title: 'Review and extract',
        concept:
          'Before calling it done, audit against what interviewers actually probe, and consider what you would extract if this pattern repeated across an app.',
        walkthrough: [
          {
            text: 'Checklist: race condition handled (abort in cleanup), timers and requests cleaned up on unmount, loading and empty states visible, label present.',
          },
          {
            text: 'The debounce effect is completely generic. Pull it into a hook. Same effect, just parameterised, and now the component reads as "debounce, then fetch".',
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
            text: 'Know the alternative. Throttling fires at a fixed rate regardless of pauses, which suits things like scroll position. Debouncing waits for a pause, which suits search because partial mid-word results add nothing.',
          },
        ],
        checkpoint: 'Give one example where throttling is the right choice and one where debouncing is.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'infinite-scroll',
    intro:
      'Infinite scroll loads more content as the user nears the bottom. The naive approach uses scroll events and pixel math; the modern approach uses IntersectionObserver and a sentinel element. This module builds the latter and covers the accessibility conversation you should be ready for.',
    outcomes: [
      'Explain why IntersectionObserver beats scroll listeners',
      'Model paged data and avoid duplicate requests',
      'Use functional state updates correctly',
      'Discuss the accessibility trade-offs of infinite scroll',
    ],
    steps: [
      {
        title: 'Model the paged data',
        concept:
          'The client never has the whole list, so it must track what it has, where it is, and whether more exists. A paged API returns items plus some signal of completeness, either `hasMore` or a total count.',
        walkthrough: [
          {
            text: 'Mock a paged API. It resolves one page of `PAGE_SIZE` items and a `hasMore` flag after a short delay.',
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
            text: 'Declare state for the accumulated items, the next page index, whether more exist, and whether a request is in flight. `loading` is not cosmetic here: it is the guard against duplicate requests later.',
            code: `const [items, setItems] = useState<string[]>([])
const [page, setPage] = useState(0)
const [hasMore, setHasMore] = useState(true)
const [loading, setLoading] = useState(false)`,
          },
        ],
        checkpoint: 'Why can the client not decide by itself whether more pages exist?',
      },
      {
        title: 'Write loadNext',
        concept:
          'One function fetches the current page, appends it, and advances the counter. Because new state depends on old state, use functional updates. Wrap it in `useCallback` so the observer effect in a later step can list it as a dependency without re-creating the observer every render.',
        walkthrough: [
          {
            text: 'Fetch `page`, then append with a functional update. `setItems((prev) => [...prev, ...newItems])` reads the latest state at update time; `setItems([...items, ...newItems])` would read whatever `items` was when the closure was created and could drop a page.',
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
            text: 'Load the first page on mount. The empty dependency array is intentional: this should run once. (Under StrictMode in development, React mounts twice, so you may see the first page loaded twice; a production build does not do this.)',
            code: `useEffect(() => {
  loadNext()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])`,
          },
        ],
        pitfalls: ['Using `items` directly inside the promise callback. Stale closures are the number one infinite-scroll bug.'],
        checkpoint: 'What could go wrong if `loadNext` used `setItems([...items, ...newItems])`?',
      },
      {
        title: 'Add a sentinel and observe it',
        concept:
          'Instead of measuring scroll position, place an invisible element at the bottom of the list and ask the browser to tell you when it becomes visible. IntersectionObserver does this asynchronously and off the main thread\'s hot path, so there is no throttling to write and no pixel math to get wrong.',
        walkthrough: [
          {
            text: 'Create a ref and render a 1px div after the last item, inside the scrollable container.',
            code: `const sentinelRef = useRef<HTMLDivElement | null>(null)

// inside the scroll container, after the items:
<div ref={sentinelRef} style={{ height: 1 }} />`,
          },
          {
            text: 'Set up the observer in an effect. Bail early if there is no node or nothing more to load. `rootMargin: "200px"` expands the detection area so the load starts before the user actually reaches the gap. In the callback, only call `loadNext` if the sentinel is intersecting and no request is already running. Disconnect in cleanup.',
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
            text: 'The dependency array matters. When `loading` flips or `page` changes, the effect re-runs with a fresh closure, so the callback never sees a stale `loading` value.',
          },
        ],
        pitfalls: [
          'Forgetting the `!loading` guard. The observer can fire repeatedly while the sentinel stays visible, requesting the same page again and duplicating items.',
          'Not disconnecting, which leaks observers on every re-run.',
        ],
        checkpoint: 'What does `rootMargin` change about when the callback fires, and why is that useful here?',
      },
      {
        title: 'Finish the UI and talk about accessibility',
        concept:
          'The visible states are simple. The harder part is knowing that infinite scroll has real accessibility costs, and being able to say so in an interview even when you implement it.',
        walkthrough: [
          {
            text: 'Show progress, a loading line, and an end-of-list line.',
            code: `<div>Scrollable feed ({items.length}/{TOTAL_ITEMS} loaded)</div>
<div style={{ height: 260, overflowY: 'auto' }}>
  {items.map((item) => <div key={item}>{item}</div>)}
  <div ref={sentinelRef} style={{ height: 1 }} />
  {loading && <p>Loading more…</p>}
  {!hasMore && <p>You've reached the end.</p>}
</div>`,
          },
          {
            text: 'The trade-off: keyboard and screen-reader users can get trapped in a page that keeps growing, never reaching the footer. Items are also hard to bookmark by position. A common production compromise is infinite scroll visually, plus a real "Load more" button as an accessible escape hatch. Mentioning this unprompted is a strong signal.',
          },
        ],
        checkpoint: 'Name one accessibility problem with infinite scroll and one concrete mitigation.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'optimistic-todo',
    intro:
      'Optimistic UI updates the screen before the server confirms, then rolls back on failure. It is how modern apps feel instant. The skill is in the failure path: every mutation needs a rollback strategy, and the right strategy depends on what the user would lose.',
    outcomes: [
      'Implement the optimistic update pattern end to end',
      'Choose between inline-error and snapshot rollback',
      'Avoid conflicting concurrent updates to one item',
      'Know when optimistic updates are inappropriate',
    ],
    steps: [
      {
        title: 'Put save status on each item',
        concept:
          'The UI needs to show, per row, whether a change is pending, confirmed, or failed. The simplest way is to carry a `status` field on each todo rather than tracking pending ids separately. And because you cannot test a rollback path without failures, the mock API must fail sometimes.',
        walkthrough: [
          {
            text: 'Define the model. `status` is a small union that drives the row\'s appearance.',
            code: `interface Todo {
  id: string
  text: string
  done: boolean
  status: 'saved' | 'saving' | 'error'
}`,
          },
          {
            text: 'Mock a flaky backend that rejects roughly 30% of the time. If your API never fails in development, you will ship a rollback that has never run.',
            code: `function fakeSaveApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (Math.random() < 0.3 ? reject(new Error('Network error')) : resolve()), 700)
  })
}`,
          },
          {
            text: 'Seed state and add an input value.',
            code: `const [todos, setTodos] = useState<Todo[]>([
  { id: 'a', text: 'Review pull request', done: false, status: 'saved' },
  { id: 'b', text: 'Write unit tests', done: true, status: 'saved' },
])
const [text, setText] = useState('')`,
          },
        ],
        checkpoint: 'Why is a mock API that always succeeds dangerous for this feature?',
      },
      {
        title: 'Optimistic add with an inline error',
        concept:
          'When the user adds a todo, insert it immediately with `status: "saving"` and clear the input. If the save fails, do not delete the row: the user typed that text, and removing it destroys their work. Mark it as an error and let them retry.',
        walkthrough: [
          {
            text: 'Generate an id, push the item, clear the input. All of this happens before any network call. Use a functional update so it composes with other in-flight updates.',
            code: `let nextId = 1

function addTodo() {
  if (!text.trim()) return
  const id = \`t\${nextId++}\`
  setTodos((prev) => [...prev, { id, text, done: false, status: 'saving' }])
  setText('')`,
          },
          {
            text: 'Fire the save. On success, flip that one item to `saved`. On failure, flip it to `error`. Notice both branches map by id, touching only the affected row.',
            code: `  fakeSaveApi()
    .then(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'saved' } : t))))
    .catch(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'error' } : t))))
}`,
          },
        ],
        pitfalls: ['Removing the item on failure. Interviewers will ask what happened to the user\'s text.'],
        checkpoint: 'Why is "mark as error" the right rollback for adding, rather than "remove the row"?',
      },
      {
        title: 'Optimistic toggle with snapshot rollback',
        concept:
          'Toggling "done" is different: reverting loses nothing, so the simplest rollback is to snapshot the whole list before mutating and restore it on failure. This is easy and correct for a single change, but has a known weakness with concurrent changes, which you should be able to name.',
        walkthrough: [
          {
            text: 'Capture the current list, apply the optimistic flip, then restore the snapshot on failure.',
            code: `function toggleDone(id: string) {
  const previous = todos
  setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done, status: 'saving' } : t)))
  fakeSaveApi()
    .then(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'saved' } : t))))
    .catch(() => setTodos(previous))
}`,
          },
          {
            text: 'The weakness: if the user toggles item A, then item B, and A fails, restoring A\'s snapshot also undoes B\'s optimistic change. For large or busy lists you would revert only the affected field. The demo sidesteps the worst case by disabling a checkbox while its row is saving.',
          },
        ],
        pitfalls: ['Reading `previous` from inside a functional updater. The snapshot must be taken synchronously before the optimistic write.'],
        checkpoint: 'Describe a sequence of two toggles where full-snapshot rollback produces the wrong result.',
      },
      {
        title: 'Retry, per-row status, and knowing the limits',
        concept:
          'A failed state needs a way out. Add retry, render status per row, and lock rows that are mid-save. Then be ready to say when optimistic updates are the wrong tool.',
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
            text: 'Render each row. The checkbox is disabled while saving so two changes to one item cannot overlap. Error rows show the message and a Retry button.',
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
            text: 'When not to do this: anything where a false success is harmful. Payments, irreversible deletions, sending messages. For those, wait for the server (pessimistic) and show a spinner.',
          },
        ],
        checkpoint: 'Name a feature where optimistic UI would be actively harmful, and explain why.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'form-validation',
    intro:
      'A signup form with three fields sounds easy, but it combines sync validation, an async server check, and error messaging that must work for screen readers. This module builds it by hand so you understand what form libraries do for you.',
    outcomes: [
      'Show errors at the right moment using touched state',
      'Derive validation during render instead of storing it',
      'Debounce and cancel an async server check',
      'Wire aria-invalid, aria-describedby and role="alert"',
    ],
    steps: [
      {
        title: 'Controlled fields and touched tracking',
        concept:
          'Showing "too short" while someone is still typing their first character is hostile. The standard pattern: validate on blur first, then live-update. To do that you track which fields have been visited.',
        walkthrough: [
          {
            text: 'State for each field, plus a `touched` record keyed by field name.',
            code: `const [username, setUsername] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [touched, setTouched] = useState<Record<string, boolean>>({})`,
          },
          {
            text: 'Each input marks itself touched on blur. Merge into the record so other fields keep their state.',
            code: `<input
  id="fv-username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  onBlur={() => setTouched((t) => ({ ...t, username: true }))}
/>`,
          },
        ],
        checkpoint: 'Compare validate-on-change, validate-on-blur, and validate-on-submit. What is wrong with each in isolation?',
      },
      {
        title: 'Derive sync errors during render',
        concept:
          'Errors are a pure function of the current values and touched flags, so compute them during render. Storing them in state and syncing with an effect adds a render of lag and a second source of truth that can drift.',
        walkthrough: [
          {
            text: 'Build an `errors` object each render. Each rule only applies if the field is touched.',
            code: `interface Errors { username?: string; email?: string; password?: string }

const errors: Errors = {}
if (touched.username && username.trim().length < 3) errors.username = 'Username must be at least 3 characters.'
if (touched.email && !/^\\S+@\\S+\\.\\S+$/.test(email)) errors.email = 'Enter a valid email address.'
if (touched.password && password.length < 8) errors.password = 'Password must be at least 8 characters.'`,
          },
          {
            text: 'Compute `isValid` separately, from the raw values and ignoring `touched`. This is what submit checks. If it respected `touched`, an untouched form would count as valid.',
            code: `const isValid =
  username.trim().length >= 3 &&
  /^\\S+@\\S+\\.\\S+$/.test(email) &&
  password.length >= 8`,
          },
          {
            text: 'The email regex is deliberately loose: has something, an @, something, a dot, something. Fully RFC-compliant regexes are a rabbit hole and still cannot prove the inbox exists. The real check is a confirmation email.',
          },
        ],
        pitfalls: ['Storing `errors` in state and updating it in an effect. Derive it.'],
        checkpoint: 'Why must `isValid` ignore `touched` while `errors` respects it?',
      },
      {
        title: 'Async username check with debounce and abort',
        concept:
          'Checking "is this username taken" requires a server call. Doing it on every keystroke spams the server and can resolve out of order. This is exactly the debounced-search pattern: wait 400ms after typing stops, run the check, and cancel it if a newer keystroke arrives.',
        walkthrough: [
          {
            text: 'Mock the check with a cancellable promise.',
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
            text: 'The effect: skip short values, start a timer, run the check when it fires, and clean up both the timer and the controller. The combined cleanup handles every case: typed again before 400ms (timer cleared), typed again during the request (aborted), unmounted (both).',
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
            text: 'Fold the result into the derived errors and into `isValid`.',
            code: `else if (touched.username && usernameTaken) errors.username = 'That username is already taken.'
// and add \`&& !usernameTaken\` to isValid`,
          },
        ],
        checkpoint: 'List the three situations the cleanup function handles, and what would go wrong in each without it.',
      },
      {
        title: 'Make errors accessible',
        concept:
          'Red text is invisible to a screen reader. Three attributes make an error real for assistive technology: `aria-invalid` flags the field, `aria-describedby` links the message to it so it is read when the field is focused, and `role="alert"` announces the message the moment it appears.',
        walkthrough: [
          {
            text: 'On the input, set both attributes conditionally so nothing points at a missing element.',
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
            text: 'Extract a `Field` wrapper so this wiring is written once and every field gets it for free.',
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
        checkpoint: 'What does each of `aria-invalid`, `aria-describedby` and `role="alert"` do for a screen-reader user?',
      },
      {
        title: 'Submit correctly',
        concept:
          'A user can click Submit without ever blurring a field, so no errors would be showing. Submit must mark everything touched and check the real validity. Also disable the browser\'s native validation so its bubbles do not fight your messages.',
        walkthrough: [
          {
            text: 'Prevent default, mark all touched, proceed only if valid.',
            code: `function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setTouched({ username: true, email: true, password: true })
  if (isValid) setSubmitted(true)
}

<form onSubmit={handleSubmit} noValidate>`,
          },
          {
            text: 'When to reach for a library: three fields by hand is fine and transparent. Ten or more, nested objects, or validation shared with the server point toward React Hook Form plus a schema like Zod as the single source of truth.',
          },
        ],
        checkpoint: 'Why mark every field touched on submit rather than just blocking submission?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'data-table',
    intro:
      'A filterable, sortable table is the classic "mini admin panel" exercise. The lesson underneath is about derived state: computing the rows from the source data plus a few UI flags, rather than storing copies that can drift.',
    outcomes: [
      'Derive filtered and sorted rows instead of storing them',
      'Sort a copy, never the source array',
      'Explain when useMemo matters and when it is premature',
      'Handle empty results and the client-vs-server boundary',
    ],
    steps: [
      {
        title: 'Data and the minimal UI state',
        concept:
          'The only things the user controls are the filter text, which column to sort by, and which direction. Those three values are the state. The rows on screen are a function of them, not state themselves.',
        walkthrough: [
          {
            text: 'Define the row type and a static dataset.',
            code: `interface Employee { id: number; name: string; department: string; salary: number }

const EMPLOYEES: Employee[] = [
  { id: 1, name: 'Alex Chen', department: 'Engineering', salary: 118000 },
  { id: 2, name: 'Priya Patel', department: 'Design', salary: 96000 },
  { id: 3, name: 'Jordan Smith', department: 'Engineering', salary: 132000 },
]`,
          },
          {
            text: 'Declare the three pieces of UI state. Typing `sortKey` as `keyof Employee` means the compiler stops you sorting by a column that does not exist.',
            code: `type SortKey = keyof Employee
type SortDir = 'asc' | 'desc'

const [filter, setFilter] = useState('')
const [sortKey, setSortKey] = useState<SortKey>('name')
const [sortDir, setSortDir] = useState<SortDir>('asc')`,
          },
        ],
        pitfalls: ['Adding a `rows` state and updating it in an effect whenever filter or sort changes. It lags one render and can drift from the source.'],
        checkpoint: 'What are the exact inputs that determine which rows appear, and why is none of the output stored in state?',
      },
      {
        title: 'Derive the rows with useMemo',
        concept:
          'Filter first, then sort. Sorting must happen on a copy because `Array.prototype.sort` mutates in place, and mutating the shared dataset causes bugs anywhere else it is used. `useMemo` caches the result so unrelated re-renders do not redo O(n log n) work.',
        walkthrough: [
          {
            text: 'Filter by name or department, case-insensitively.',
            code: `const rows = useMemo(() => {
  const q = filter.toLowerCase()
  const filtered = EMPLOYEES.filter(
    (e) => e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q),
  )`,
          },
          {
            text: 'Spread into a new array before sorting. Compare numbers numerically and strings with `localeCompare` so accents and case behave. Negate the comparison for descending. List every input as a dependency.',
            code: `  return [...filtered].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })
}, [filter, sortKey, sortDir])`,
          },
          {
            text: 'Honesty about `useMemo`: for eight rows it changes nothing measurable. It is here to show you know that filtering and sorting re-run on every render otherwise, and that you know the tool. Say that, rather than claiming it is a performance win.',
          },
        ],
        pitfalls: ['`EMPLOYEES.sort(...)` with no copy. Interviewers check for this specifically.'],
        checkpoint: 'What are two distinct problems caused by sorting the original array in place?',
      },
      {
        title: 'Sortable headers',
        concept:
          'Clicking a new column sorts it ascending. Clicking the active column flips the direction. Show the direction visually so the state is legible.',
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
            text: 'Render headers from a column config so adding a column is one line.',
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
            text: 'A `<th onClick>` is not keyboard accessible. The improvement, if asked, is to put a `<button>` inside the header and set `aria-sort` on the `<th>`.',
          },
        ],
        checkpoint: 'How would you make these headers usable from the keyboard, and which ARIA attribute describes the sort state?',
      },
      {
        title: 'Empty state and the scale boundary',
        concept:
          'Handle the no-results case, then be ready for the follow-up: what changes when the dataset is large?',
        walkthrough: [
          {
            text: 'Render a single full-width row when nothing matches.',
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
            text: 'Client-side filtering and sorting only work while the entire dataset is in the browser. Once you are at thousands of rows, the server must do it: the table sends filter, sortKey and sortDir as query params and receives one page. The Pagination module covers that side.',
          },
        ],
        checkpoint: 'At what point does this approach stop working, and what does the API need to accept instead?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'accessible-modal',
    intro:
      'Visually, a modal is a fixed overlay. Making it usable for keyboard and screen-reader users is where most submissions fall short. This module builds the four things that make it a real dialog: correct ARIA, focus moved in, focus trapped, and focus restored.',
    outcomes: [
      'Apply role="dialog", aria-modal and aria-labelledby',
      'Move focus into the dialog and restore it on close',
      'Implement a Tab / Shift+Tab focus trap',
      'Close on Escape and backdrop click, but not inner clicks',
    ],
    steps: [
      {
        title: 'State, refs, and focus restoration',
        concept:
          'You need to remember two DOM elements: the button that opened the dialog, so you can send focus back to it on close, and the dialog container, so you can find its focusable children. Restoring focus is the most frequently forgotten piece, so build it into `close()` from the start.',
        walkthrough: [
          {
            text: 'Declare the state and both refs.',
            code: `const [open, setOpen] = useState(false)
const triggerRef = useRef<HTMLButtonElement | null>(null)
const dialogRef = useRef<HTMLDivElement | null>(null)`,
          },
          {
            text: 'Close hides the dialog and returns focus. Without this, focus falls to the document body and a keyboard user is dumped at the top of the page.',
            code: `function close() {
  setOpen(false)
  triggerRef.current?.focus()
}

<button ref={triggerRef} onClick={() => setOpen(true)}>Open dialog</button>`,
          },
        ],
        checkpoint: 'What does a keyboard user experience on close if focus is not restored?',
      },
      {
        title: 'Semantic markup and click handling',
        concept:
          '`role="dialog"` tells assistive technology what this is. `aria-modal="true"` says the content behind is inert. `aria-labelledby` gives it a name from its heading. Clicking the backdrop should close; clicking inside should not, which means stopping propagation on the inner container.',
        walkthrough: [
          {
            text: 'The backdrop is the click-to-close target. The inner container carries the ARIA and swallows its own clicks.',
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
        pitfalls: ['Styling something to look like a modal without any role. To a screen reader it is just more page content.'],
        checkpoint: 'What would happen on a click inside the dialog if `stopPropagation` were removed?',
      },
      {
        title: 'Move focus in and handle Escape',
        concept:
          'When the dialog opens, focus should land inside it so keyboard users do not have to Tab through the whole page to reach it. Escape should close it. Both are done in an effect that runs when `open` becomes true and cleans up when it becomes false.',
        walkthrough: [
          {
            text: 'Find the focusable elements with a selector that covers the common cases, and focus the first.',
            code: `useEffect(() => {
  if (!open) return
  const dialog = dialogRef.current
  const focusable = dialog?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  focusable?.[0]?.focus()`,
          },
          {
            text: 'Listen on `document` so Escape works no matter what inside the dialog has focus. Remove the listener in cleanup.',
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
        checkpoint: 'Why attach the keydown listener to `document` rather than to the dialog element?',
      },
      {
        title: 'Trap Tab and Shift+Tab',
        concept:
          'By default, tabbing past the last button inside the dialog moves focus to elements behind the backdrop, invisible to sighted users and disorienting for everyone else. The trap intercepts Tab at the edges and wraps focus around.',
        walkthrough: [
          {
            text: 'Inside the keydown handler: on Tab from the last element, jump to the first; on Shift+Tab from the first, jump to the last. Prevent default so the browser does not also move focus.',
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
            text: 'Limitation to mention: the focusable list is captured once when the dialog opens. If elements inside are added or removed while it is open, the trap is stale. That is one reason production code should prefer the native `<dialog>` element with `showModal()`, which traps focus and handles Escape natively, or a tested library like focus-trap-react.',
          },
        ],
        checkpoint: 'Name two things the native `<dialog>` element handles for you that this hand-rolled version does by hand.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'shopping-cart',
    intro:
      'A cart with quantities, a bulk discount and a shipping rule is a state-management exercise in disguise. The lesson: keep state tiny and derive every number from it, so the total can never be stale.',
    outcomes: [
      'Keep a single source of truth and derive everything else',
      'Implement quantity changes that remove empty lines',
      'Encode business rules explicitly and name their ambiguities',
      'Choose a state shape and justify it',
    ],
    steps: [
      {
        title: 'The smallest possible state',
        concept:
          'The bug you see constantly in real take-homes is a `total` in state that gets updated in three different places and drifts. The fix is structural: store only `{ productId: quantity }`. Subtotal, discount, shipping and total are computed, never stored.',
        walkthrough: [
          {
            text: 'Products and the business-rule constants. Naming the constants makes the rules visible and easy to change.',
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
            text: 'The cart is a record from id to quantity. A record gives O(1) lookup and update; an array of `{ productId, qty }` would need a `find` for every change.',
            code: `const [cart, setCart] = useState<Record<string, number>>({})`,
          },
        ],
        checkpoint: 'Describe concretely how a stored `total` gets out of sync. Which operations would have to update it?',
      },
      {
        title: 'Add and remove with clean-up at zero',
        concept:
          'Increment is simple. Decrement has an edge: when quantity would hit zero, delete the key so no "0" row lingers. Both must copy the object before changing it, because React compares references.',
        walkthrough: [
          {
            text: 'Add: spread, then set the id to one more than its current value, defaulting to zero.',
            code: `function addItem(id: string) {
  setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
}`,
          },
          {
            text: 'Remove: copy, then either delete or decrement.',
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
        pitfalls: ['Mutating `prev` directly. React will not see a change and the UI will not update.'],
        checkpoint: 'Why must `removeItem` copy the object rather than deleting from `prev`?',
      },
      {
        title: 'Derive the summary in one pass',
        concept:
          'One `useMemo` over the cart produces every number on screen. Discount is per product line, applied when that line reaches the threshold. Shipping depends on the post-discount total. Both of those are interpretations of an ambiguous spec, and saying so is part of the exercise.',
        walkthrough: [
          {
            text: 'Map entries to lines with their subtotal and discount.',
            code: `const summary = useMemo(() => {
  const lines = Object.entries(cart).map(([id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id)!
    const lineSubtotal = product.price * qty
    const bulkDiscount = qty >= BULK_DISCOUNT_THRESHOLD ? lineSubtotal * BULK_DISCOUNT_RATE : 0
    return { product, qty, lineSubtotal, bulkDiscount }
  })`,
          },
          {
            text: 'Reduce to totals. Shipping is free when the cart is empty (no order, no fee) or when the post-discount amount clears the threshold.',
            code: `  const subtotal = lines.reduce((sum, l) => sum + l.lineSubtotal, 0)
  const totalDiscount = lines.reduce((sum, l) => sum + l.bulkDiscount, 0)
  const afterDiscount = subtotal - totalDiscount
  const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : 15
  const total = afterDiscount + shipping
  return { lines, subtotal, totalDiscount, shipping, total }
}, [cart])`,
          },
          {
            text: 'Verify by hand: 3 keyboards at $89 is $267. Ten percent off is $26.70, leaving $240.30, under $400, so shipping is $15 and the total is $255.30. If your numbers differ, check whether you applied the discount per line or per cart.',
          },
        ],
        checkpoint: '"Free shipping over $400." Before or after discount? Per-line or per-cart discount? What should you do when a spec is ambiguous like this?',
      },
      {
        title: 'Render and verify',
        concept:
          'The UI is a product list with quantity controls and a summary block. The minus button is disabled when the item is not in the cart. Because every figure comes from `summary`, there is no path where the display can be wrong.',
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
            text: 'Summary rows. Show the discount as a negative.',
            code: `<Row label="Subtotal" value={summary.subtotal} />
<Row label="Bulk discount" value={-summary.totalDiscount} />
<Row label="Shipping" value={summary.shipping} />
<Row label="Total" value={summary.total} bold />`,
          },
        ],
        checkpoint: 'Give one advantage and one cost of storing the cart as a record keyed by id rather than an array.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'tabs-accordion',
    intro:
      'Tabs and accordions are a few divs and click handlers until someone says "now make it keyboard accessible". This module builds both to the WAI-ARIA authoring patterns so you understand what headless UI libraries do under the hood.',
    outcomes: [
      'Wire tab, tablist and tabpanel roles with their relationships',
      'Implement roving tabindex',
      'Handle arrow, Home and End keys',
      'Build an accordion with real buttons and aria-expanded',
    ],
    steps: [
      {
        title: 'Tab markup and ARIA relationships',
        concept:
          'The tabs pattern is a set of roles plus id links. The tablist contains tabs; each tab points at its panel with `aria-controls` and each panel points back with `aria-labelledby`. Inactive panels use the `hidden` attribute, which removes them from the accessibility tree, not just from view.',
        walkthrough: [
          {
            text: 'Data and state.',
            code: `const TABS = [
  { id: 'overview', label: 'Overview', content: 'High-level summary.' },
  { id: 'specs', label: 'Specs', content: 'Technical specifications.' },
  { id: 'reviews', label: 'Reviews', content: 'Customer reviews.' },
]

const [active, setActive] = useState(0)`,
          },
          {
            text: 'The tablist and tabs. Each tab is a real `<button>` so it is focusable and activates with Enter or Space for free.',
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
            text: 'Render every panel, hiding the inactive ones. Rendering all and toggling `hidden` keeps the ids stable for the ARIA links.',
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
        checkpoint: 'What is the difference, for a screen reader, between `hidden` and `opacity: 0`?',
      },
      {
        title: 'Roving tabindex',
        concept:
          'Pressing Tab should move past the whole tablist in one stop, the way it does with a native select. Only the active tab sits in the tab order; the rest are reachable by arrow keys. This is called roving tabindex, and it needs refs so you can focus tabs programmatically.',
        walkthrough: [
          {
            text: 'Collect a ref per tab button.',
            code: `const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

<button
  ref={(el) => { tabRefs.current[i] = el }}
  tabIndex={active === i ? 0 : -1}
  ...
/>`,
          },
          {
            text: 'Try it: with all tabs at `tabIndex=0`, a keyboard user has to press Tab three times to get past the widget. With roving tabindex it is one press.',
          },
        ],
        checkpoint: 'Why is having every tab in the natural Tab order a problem for keyboard users?',
      },
      {
        title: 'Arrow, Home and End keys',
        concept:
          'Arrow keys move both focus and selection between tabs, wrapping at the ends. Home and End jump to the first and last. Any other key must be ignored and left to the browser.',
        walkthrough: [
          {
            text: 'Compute the next index with modulo arithmetic for wrap-around. Return early for unhandled keys, so you do not `preventDefault` on things like Tab itself.',
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
            text: 'The `(active - 1 + TABS.length) % TABS.length` form avoids a negative result from `-1 % 3` in JavaScript.',
          },
        ],
        pitfalls: ['Calling `preventDefault()` before the early return, which breaks Tab and Enter inside the tablist.'],
        checkpoint: 'Why does the handler return early for unrecognised keys instead of just doing nothing?',
      },
      {
        title: 'Accordion with real buttons',
        concept:
          'The accordion is simpler: a heading containing a button, with `aria-expanded` reflecting state and `aria-controls` linking to the panel. Using a `<button>` instead of a clickable div gives focus and keyboard activation for free. This version is single-open, tracking one `openId`.',
        walkthrough: [
          {
            text: 'State is a single id or null.',
            code: `const [openId, setOpenId] = useState<string | null>('shipping')`,
          },
          {
            text: 'Each item: header button inside an `<h4>`, panel with `role="region"` and `hidden`.',
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
            text: 'To allow multiple open sections, change `openId` to a `Set<string>` and toggle membership. In production, reach for Radix or React Aria, which encode these patterns plus edge cases like RTL and focus management.',
          },
        ],
        checkpoint: 'What would you change to allow several accordion sections open at once?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'pagination',
    intro:
      'Numbered pagination over a server API is one of the most common admin-list requests. It is also a vehicle for a design conversation: where should paging logic live, and how do you stop a slow page response overwriting a fast one?',
    outcomes: [
      'Mock a server that returns one page plus a total',
      'Guard against out-of-order responses with a cancelled flag',
      'Show loading feedback on every page change',
      'Compare client-side, server-side and cursor-based pagination',
    ],
    steps: [
      {
        title: 'A server that only returns one page',
        concept:
          'Real pagination means the browser never has the full dataset. The mock must respect that: given a page number, return that slice and the total count, nothing more. The total is what lets you render numbered buttons.',
        walkthrough: [
          {
            text: 'The mock API. Pages are 1-based here because that is what the UI shows.',
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
            text: 'State, plus a derived page count. `Math.max(1, …)` prevents a zero-page state before the first response.',
            code: `const [page, setPage] = useState(1)
const [items, setItems] = useState<string[]>([])
const [total, setTotal] = useState(0)
const [loading, setLoading] = useState(true)

const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))`,
          },
        ],
        checkpoint: 'Why does the API need to return `total` when it only sends five items?',
      },
      {
        title: 'Fetch on page change with a cancelled flag',
        concept:
          'Click page 3, then quickly page 1. If page 3\'s response is slower it arrives last and overwrites page 1\'s data. A local `cancelled` flag, flipped in the effect cleanup, tells the stale response to drop its result. This is a lighter alternative to AbortController when you cannot or need not cancel the underlying request.',
        walkthrough: [
          {
            text: 'The effect. Each run gets its own `cancelled` variable in its own closure; the cleanup for that run sets it before the next run starts.',
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
            text: 'Compare with AbortController: the flag ignores the response; abort stops the request. Use abort when the request is real and cancellable (saves bandwidth). Use the flag when you only need to ignore a result, or the API has no cancel path.',
          },
        ],
        checkpoint: 'Trace the page-3-then-page-1 sequence and show where the stale write is stopped.',
      },
      {
        title: 'Skeleton rows and page controls',
        concept:
          'Loading feedback must appear on every page change, not just the first. Placeholder rows keep the layout height stable so the controls do not jump. Prev and Next are clamped and disabled at the edges.',
        walkthrough: [
          {
            text: 'Render placeholders while loading.',
            code: `<ul>
  {loading
    ? Array.from({ length: PAGE_SIZE }).map((_, i) => <li key={i} style={{ color: '#bbb' }}>Loading…</li>)
    : items.map((item) => <li key={item}>{item}</li>)}
</ul>`,
          },
          {
            text: 'Controls. Clamp in the handlers so a double-click cannot go out of range.',
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
        checkpoint: 'Why render placeholder rows rather than an empty list while loading?',
      },
      {
        title: 'The pagination design conversation',
        concept:
          'Interviewers will ask which approach you would pick for a given dataset. The right answer is "it depends on the volume", followed by the trade-offs.',
        walkthrough: [
          {
            text: 'Client-side: fetch everything once, slice in the browser. Instant page switches, trivial to implement, only viable when the whole dataset is small enough to download and hold. Hundreds of rows, not millions.',
          },
          {
            text: 'Server-side numbered (this module): one round-trip per page, visible as a loading state. Required once the data cannot be shipped whole. The server must also sort and filter before paginating, since the client only ever sees a slice. Numbered buttons need truncation past a couple dozen pages.',
          },
          {
            text: 'Cursor-based: `next` and `prev` tokens instead of page numbers. Scales for huge or frequently changing datasets and avoids skipped or duplicated rows when data shifts, but loses "jump to page 7".',
          },
        ],
        checkpoint: 'A list has 300 rows. Which approach do you pick and why? What changes at 3 million rows, or when rows are inserted constantly?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    challengeId: 'drag-drop-list',
    intro:
      'Native HTML5 drag-and-drop needs no library, but it has one famous gotcha and one structural accessibility gap. This module builds a reorderable list, handles both, and explains when you would reach for a library instead.',
    outcomes: [
      'Wire dragstart, dragover, drop and dragend correctly',
      'Understand why preventDefault in dragover is required',
      'Reorder immutably with splice on a copy',
      'Provide a keyboard path and live-region announcements',
    ],
    steps: [
      {
        title: 'State for the list and the drag',
        concept:
          'You need the list itself, which item is being dragged, and which item the pointer is currently over (for a visual drop indicator). The live region ref is for announcements later.',
        walkthrough: [
          {
            text: 'Model and initial data.',
            code: `interface Task { id: string; text: string }

const INITIAL: Task[] = [
  { id: 't1', text: 'Design the onboarding flow' },
  { id: 't2', text: 'Write API documentation' },
  { id: 't3', text: 'Fix Safari flexbox bug' },
  { id: 't4', text: 'Ship v2.4 release' },
]`,
          },
          {
            text: 'State and refs. `dragId` and `overId` are separate because they change at different times and drive different visuals.',
            code: `const [tasks, setTasks] = useState<Task[]>(INITIAL)
const [dragId, setDragId] = useState<string | null>(null)
const [overId, setOverId] = useState<string | null>(null)
const liveRegionRef = useRef<HTMLDivElement | null>(null)`,
          },
        ],
        checkpoint: 'What visual does `overId` drive, and why is it different from `dragId`?',
      },
      {
        title: 'The drag handlers and the preventDefault gotcha',
        concept:
          'By default, browsers do not allow dropping on most elements. Calling `preventDefault()` in the `dragover` handler is what opts an element in as a drop target. Forget it and `onDrop` silently never fires. This trips up almost everyone the first time.',
        walkthrough: [
          {
            text: 'Record the dragged id on start. On dragover, prevent default and update `overId` only when it changes, to avoid re-rendering on every mouse move.',
            code: `function handleDragStart(id: string) {
  setDragId(id)
}

function handleDragOver(e: React.DragEvent, id: string) {
  e.preventDefault() // required: without this, onDrop never fires
  if (id !== overId) setOverId(id)
}`,
          },
          {
            text: 'Wire them on each `<li>`, and clear state on dragend so a cancelled drag does not leave a stale highlight.',
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
        pitfalls: ['Omitting `preventDefault()` in dragover. The symptom is "drop does nothing" with no error.'],
        checkpoint: 'What is the exact symptom when `preventDefault()` is missing from `dragover`, and why is it hard to debug?',
      },
      {
        title: 'Reorder on drop',
        concept:
          'Take the dragged item out of the array and put it back at the target\'s index. Do it on a copy so React sees a new reference. Announce the result to the live region in the same update so it reflects the final positions.',
        walkthrough: [
          {
            text: 'Guard the no-op cases, then splice.',
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
            text: 'Splice-out then splice-in is O(n) per drop and easy to reason about. It handles moving up and down without index-adjustment tricks.',
          },
        ],
        checkpoint: 'Why must the reorder operate on `[...prev]` rather than `prev`?',
      },
      {
        title: 'Keyboard buttons and the live region',
        concept:
          'Native drag-and-drop has no keyboard equivalent at all. A drag-only reorder is inaccessible by construction, not by oversight. Up and down buttons are the actual fix. And because a visual reorder says nothing to a screen reader, an `aria-live` region announces every move.',
        walkthrough: [
          {
            text: 'Swap with an adjacent item and announce.',
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
            text: 'Buttons per row with descriptive labels, disabled at the ends.',
            code: `<button aria-label={\`Move \${task.text} up\`} onClick={() => moveByKeyboard(task.id, -1)} disabled={i === 0}>↑</button>
<button aria-label={\`Move \${task.text} down\`} onClick={() => moveByKeyboard(task.id, 1)} disabled={i === tasks.length - 1}>↓</button>`,
          },
          {
            text: 'The live region is visually hidden but present in the accessibility tree. `polite` waits for the screen reader to finish its current sentence.',
            code: `<div
  ref={liveRegionRef}
  aria-live="polite"
  style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
/>`,
          },
          {
            text: 'When to use a library: native DnD has an awkward `dataTransfer` API, inconsistent drag images, and no touch support. Pointer-event libraries like dnd-kit reimplement dragging from pointer events, giving touch, animation and accessibility hooks. Most production apps should use one.',
          },
        ],
        checkpoint: 'Why are the arrow buttons a requirement rather than a courtesy fallback?',
      },
    ],
  },
]

export function getTraining(challengeId: string): TrainingModule | undefined {
  return trainingModules.find((m) => m.challengeId === challengeId)
}
