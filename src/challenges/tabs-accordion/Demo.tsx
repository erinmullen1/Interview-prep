import { useRef, useState } from 'react'
import { InfoDot } from '../../components/InfoDot'

const TABS = [
  { id: 'overview', label: 'Overview', content: 'High-level summary of the project goes here.' },
  { id: 'specs', label: 'Specs', content: 'Technical specifications and requirements go here.' },
  { id: 'reviews', label: 'Reviews', content: 'Customer reviews and ratings go here.' },
]

const ACCORDION_ITEMS = [
  { id: 'shipping', title: 'Shipping details', body: 'Orders ship within 2 business days via standard courier.' },
  { id: 'returns', title: 'Return policy', body: 'Items can be returned within 30 days in original condition.' },
  { id: 'warranty', title: 'Warranty', body: 'All products include a 1-year limited warranty.' },
]

function Tabs() {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(e: React.KeyboardEvent) {
    // WAI-ARIA tabs pattern: arrow keys move focus AND selection between
    // tabs; Home/End jump to the first/last tab.
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

  return (
    <div>
      <div role="tablist" aria-label="Product info" onKeyDown={handleKeyDown} style={{ display: 'flex', borderBottom: '1px solid #e4e4ec' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === i}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: active === i ? 700 : 400,
              color: active === i ? '#6366f1' : '#1c1c28',
              borderBottom: active === i ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {TABS.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== i}
          style={{ padding: '14px 4px', fontSize: 14 }}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}

function Accordion() {
  const [openId, setOpenId] = useState<string | null>('shipping')

  return (
    <div>
      {ACCORDION_ITEMS.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id} style={{ borderBottom: '1px solid #f0f0f6' }}>
            <h4 style={{ margin: 0 }}>
              <button
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${item.id}`}
                id={`accordion-header-${item.id}`}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 4px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                {item.title}
                <span>{isOpen ? '−' : '+'}</span>
              </button>
            </h4>
            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
              hidden={!isOpen}
              style={{ padding: '0 4px 12px', fontSize: 13.5, color: '#444' }}
            >
              {item.body}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function TabsAccordionDemo() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        Tabs
        <InfoDot label="Why role=tablist etc.">
          <strong>Arrow keys, not just clicks.</strong> The WAI-ARIA tabs
          pattern expects Left/Right/Home/End to move between tabs, with only
          the active tab in the Tab order (<code>tabIndex=-1</code> on the
          rest) — this is what makes it a genuine tab widget for
          screen-reader/keyboard users, not just visually styled buttons.
        </InfoDot>
      </div>
      <Tabs />

      <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, margin: '20px 0 4px' }}>
        Accordion
        <InfoDot label="Why aria-expanded">
          <strong>aria-expanded</strong> tells assistive tech whether a
          section is open or closed; <code>hidden</code> on the closed panel
          removes it from the accessibility tree entirely (not just visually)
          so a screen reader doesn't read collapsed content.
        </InfoDot>
      </div>
      <Accordion />
    </div>
  )
}
