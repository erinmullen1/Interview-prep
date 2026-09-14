import { useCallback, useEffect, useRef, useState } from 'react'
import { InfoDot } from '../../components/InfoDot'

const PAGE_SIZE = 15
const TOTAL_ITEMS = 120

function fakeFetchPage(page: number): Promise<{ items: string[]; hasMore: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = page * PAGE_SIZE
      const items = Array.from({ length: PAGE_SIZE }, (_, i) => `Item #${start + i + 1}`).filter(
        (_, i) => start + i < TOTAL_ITEMS,
      )
      resolve({ items, hasMore: start + PAGE_SIZE < TOTAL_ITEMS })
    }, 500)
  })
}

export default function InfiniteScrollDemo() {
  const [items, setItems] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadNext = useCallback(() => {
    setLoading(true)
    fakeFetchPage(page).then(({ items: newItems, hasMore: more }) => {
      setItems((prev) => [...prev, ...newItems])
      setHasMore(more)
      setPage((p) => p + 1)
      setLoading(false)
    })
  }, [page])

  // Load the first page on mount.
  useEffect(() => {
    loadNext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Observe a "sentinel" div at the bottom of the list; when it scrolls into
  // view, load the next page. This avoids attaching a scroll listener and
  // manually computing scrollTop/offsetHeight math.
  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadNext()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, loadNext])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        Scrollable feed ({items.length}/{TOTAL_ITEMS} loaded)
        <InfoDot label="Why IntersectionObserver">
          <strong>Why not a scroll listener?</strong> Scroll events fire dozens of
          times a second and need manual throttling plus scrollTop/clientHeight
          math. <code>IntersectionObserver</code> is native, async, and only
          fires when the sentinel element actually becomes visible &mdash; better
          performance with less code.
        </InfoDot>
      </div>
      <div style={{ height: 260, overflowY: 'auto', border: '1px solid #e4e4ec', borderRadius: 8, padding: '4px 10px' }}>
        {items.map((item) => (
          <div key={item} style={{ padding: '8px 4px', borderBottom: '1px solid #f0f0f6', fontSize: 14 }}>
            {item}
          </div>
        ))}
        <div ref={sentinelRef} style={{ height: 1 }} />
        {loading && <p style={{ fontSize: 13, color: '#6b6b7c', textAlign: 'center' }}>Loading more…</p>}
        {!hasMore && <p style={{ fontSize: 13, color: '#6b6b7c', textAlign: 'center' }}>You've reached the end.</p>}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: '#6b6b7c', display: 'flex', alignItems: 'center' }}>
        200px rootMargin
        <InfoDot label="Why rootMargin">
          <strong>Why a 200px margin?</strong> Without it, the observer fires only
          once the sentinel is fully visible, which means the user briefly sees a
          blank gap while the next page loads. Expanding the root margin triggers
          the load slightly <em>before</em> the sentinel is on-screen, so new items
          are usually ready by the time the user scrolls to them.
        </InfoDot>
      </div>
    </div>
  )
}
