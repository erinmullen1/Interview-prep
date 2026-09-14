import { useMemo, useState } from 'react'
import { InfoDot } from '../../components/InfoDot'

interface Product {
  id: string
  name: string
  price: number
}

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Mechanical Keyboard', price: 89 },
  { id: 'p2', name: 'Ultrawide Monitor', price: 349 },
  { id: 'p3', name: 'Standing Desk', price: 429 },
  { id: 'p4', name: 'Ergonomic Chair', price: 259 },
]

const FREE_SHIPPING_THRESHOLD = 400
const BULK_DISCOUNT_THRESHOLD = 3 // items of the same product
const BULK_DISCOUNT_RATE = 0.1

export default function ShoppingCartDemo() {
  // The cart itself is the ONLY source of truth: { productId: quantity }.
  // Everything else (subtotal, discounts, shipping, total) is derived from it.
  const [cart, setCart] = useState<Record<string, number>>({})

  function addItem(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }
  function removeItem(id: string) {
    setCart((prev) => {
      const next = { ...prev }
      if (next[id] <= 1) delete next[id]
      else next[id] -= 1
      return next
    })
  }

  const summary = useMemo(() => {
    const lines = Object.entries(cart).map(([id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id)!
      const lineSubtotal = product.price * qty
      const bulkDiscount = qty >= BULK_DISCOUNT_THRESHOLD ? lineSubtotal * BULK_DISCOUNT_RATE : 0
      return { product, qty, lineSubtotal, bulkDiscount }
    })
    const subtotal = lines.reduce((sum, l) => sum + l.lineSubtotal, 0)
    const totalDiscount = lines.reduce((sum, l) => sum + l.bulkDiscount, 0)
    const afterDiscount = subtotal - totalDiscount
    const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : 15
    const total = afterDiscount + shipping
    return { lines, subtotal, totalDiscount, shipping, total }
  }, [cart])

  return (
    <div>
      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {PRODUCTS.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #f0f0f6', borderRadius: 8, padding: '8px 12px' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#6b6b7c' }}>${p.price}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => removeItem(p.id)} disabled={!cart[p.id]} style={qtyBtnStyle}>
                −
              </button>
              <span style={{ minWidth: 16, textAlign: 'center', fontSize: 14 }}>{cart[p.id] ?? 0}</span>
              <button onClick={() => addItem(p.id)} style={qtyBtnStyle}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #e4e4ec', paddingTop: 12, fontSize: 13 }}>
        <Row label="Subtotal" value={summary.subtotal} />
        <Row
          label={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              Bulk discount
              <InfoDot label="Bulk discount rule">
                <strong>Rule:</strong> buying 3 or more of the <em>same</em>{' '}
                product gets 10% off that line. It's computed per-line, not on
                the cart total, so mixing different products doesn't trigger it.
              </InfoDot>
            </span>
          }
          value={-summary.totalDiscount}
        />
        <Row
          label={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              Shipping
              <InfoDot label="Free shipping rule">
                <strong>Rule:</strong> orders of $400 or more (after discount)
                ship free; otherwise a flat $15. This is computed from the
                post-discount total, not the pre-discount subtotal &mdash;
                worth clarifying explicitly with a PM in a real spec, since
                it's genuinely ambiguous which one "the order total" means.
              </InfoDot>
            </span>
          }
          value={summary.shipping}
        />
        <Row label="Total" value={summary.total} bold />
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: React.ReactNode; value: number; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: bold ? 700 : 400 }}>
      <span>{label}</span>
      <span>{value < 0 ? `-$${Math.abs(value).toFixed(2)}` : `$${value.toFixed(2)}`}</span>
    </div>
  )
}

const qtyBtnStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 6,
  border: '1px solid #d8d8e4',
  background: '#fff',
  cursor: 'pointer',
}
