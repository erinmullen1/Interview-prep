import { useEffect, useState } from 'react'
import { InfoDot } from '../../components/InfoDot'

const PAGE_SIZE = 5
const TOTAL_ITEMS = 43

const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, (_, i) => `Order #${1000 + i}`)

// Simulates a real paginated API: the server only ever sends back one page
// plus a total count, never the whole dataset.
function fakeFetchPage(page: number): Promise<{ items: string[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * PAGE_SIZE
      resolve({ items: ALL_ITEMS.slice(start, start + PAGE_SIZE), total: TOTAL_ITEMS })
    }, 350)
  })
}

export default function PaginationDemo() {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
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
  }, [page])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        Orders (server-paginated)
        <InfoDot label="Server- vs client-side paging">
          <strong>This fetches one page at a time</strong> from the "server"
          (`page` is sent, only 5 items + a total count come back) — the full
          43-item list is never in the browser at once. That's the realistic
          version of pagination for any dataset too large to load wholesale.
        </InfoDot>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, minHeight: 190 }}>
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <li key={i} style={{ padding: '8px 4px', borderBottom: '1px solid #f0f0f6', color: '#bbb', fontSize: 14 }}>
                Loading…
              </li>
            ))
          : items.map((item) => (
              <li key={item} style={{ padding: '8px 4px', borderBottom: '1px solid #f0f0f6', fontSize: 14 }}>
                {item}
              </li>
            ))}
      </ul>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtnStyle}>
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{ ...pageBtnStyle, background: p === page ? '#6366f1' : '#fff', color: p === page ? '#fff' : '#1c1c28' }}
          >
            {p}
          </button>
        ))}
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtnStyle}>
          Next
        </button>
      </div>
      <p style={{ fontSize: 12, color: '#6b6b7c', textAlign: 'center', marginTop: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        Page {page} of {totalPages}
        <InfoDot label="Why cancelled flag">
          <strong>Why the `cancelled` flag?</strong> If you click Page 3 then
          quickly click Page 1, the Page 3 response could resolve after the
          Page 1 response and overwrite it with the wrong data. The cleanup
          function sets `cancelled = true` for the superseded effect so its
          result is ignored when it eventually arrives.
        </InfoDot>
      </p>
    </div>
  )
}

const pageBtnStyle: React.CSSProperties = {
  minWidth: 30,
  height: 30,
  padding: '0 6px',
  borderRadius: 6,
  border: '1px solid #d8d8e4',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
}
