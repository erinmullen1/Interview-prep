import { useEffect, useRef, useState } from 'react'
import { InfoDot } from '../../components/InfoDot'

const CATALOG = [
  'React', 'React Router', 'React Query', 'Redux', 'Redux Toolkit', 'Vue', 'Vuex', 'Angular',
  'Svelte', 'SvelteKit', 'Solid.js', 'TypeScript', 'JavaScript', 'Vite', 'Webpack', 'Rollup',
  'Next.js', 'Remix', 'Node.js', 'Express', 'GraphQL', 'Apollo Client', 'Tailwind CSS', 'CSS Modules',
  'Styled Components', 'Jest', 'Vitest', 'Playwright', 'Cypress', 'Storybook',
]

// Simulates a real network call: random latency + occasionally slower requests,
// so that without cancellation, responses can arrive out of order.
function fakeSearchApi(query: string, signal: AbortSignal): Promise<string[]> {
  const latency = 200 + Math.random() * 600
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const results = CATALOG.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      resolve(results)
    }, latency)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

export default function DebouncedSearchDemo() {
  const [input, setInput] = useState('')
  const [debounced, setDebounced] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // 1) Debounce: only commit the input to `debounced` after the user pauses typing.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(input), 300)
    return () => clearTimeout(timer)
  }, [input])

  // 2) Fetch: runs only when the debounced value changes, and cancels any
  // in-flight request from a previous keystroke so a slow, stale response
  // can never overwrite a newer, faster one.
  useEffect(() => {
    if (!debounced.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    fakeSearchApi(debounced, controller.signal)
      .then((data) => {
        setResults(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLoading(false)
      })
    return () => controller.abort()
  }, [debounced])

  return (
    <div>
      <label htmlFor="search-input" style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
        Search libraries
        <InfoDot label="Why debounce">
          <strong>Why wait 300ms?</strong> Firing a request on every keystroke wastes
          bandwidth and can overwhelm a backend. 300ms is long enough to skip most
          "typing" keystrokes but short enough to still feel instant to the user.
        </InfoDot>
      </label>
      <input
        id="search-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Try 'react' or 'css'…"
        style={{ width: '100%', padding: '8px 10px', marginTop: 6, marginBottom: 12, border: '1px solid #d8d8e4', borderRadius: 6 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b6b7c', marginBottom: 8 }}>
        <span>
          {loading ? 'Searching…' : `${results.length} result${results.length === 1 ? '' : 's'}`}
        </span>
        <InfoDot label="Why AbortController">
          <strong>Why cancel requests?</strong> Without this, if request A (for "re")
          is slow and request B (for "react") is fast, A's response can land <em>after</em>{' '}
          B's and overwrite the correct results with stale ones. Aborting the previous
          request whenever a new one starts prevents this race condition.
        </InfoDot>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, minHeight: 40 }}>
        {results.map((r) => (
          <li key={r} style={{ padding: '6px 8px', borderBottom: '1px solid #f0f0f6', fontSize: 14 }}>
            {r}
          </li>
        ))}
        {!loading && debounced && results.length === 0 && (
          <li style={{ padding: '6px 8px', fontSize: 14, color: '#6b6b7c' }}>No matches.</li>
        )}
      </ul>
    </div>
  )
}
