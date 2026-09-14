import { useEffect, useRef, useState } from 'react'
import { InfoDot } from '../../components/InfoDot'

export default function AccessibleModalDemo() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  function close() {
    setOpen(false)
    // Restore focus to whatever opened the dialog, so keyboard/screen-reader
    // users land back where they were, not at the top of the page.
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.[0]?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key === 'Tab' && focusable && focusable.length > 0) {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        // Focus trap: if Tab would move focus outside the dialog, wrap it
        // back around to the first/last focusable element instead.
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer' }}
      >
        Open dialog
      </button>
      <div style={{ marginTop: 10, fontSize: 12, color: '#6b6b7c', display: 'flex', alignItems: 'center' }}>
        Try Tab, Shift+Tab, and Escape once it's open
        <InfoDot label="Why a focus trap">
          <strong>Why trap focus?</strong> Without it, Tab-ing past the last
          button inside the dialog would move focus to elements behind it on
          the page — invisible to a sighted user under the backdrop, but very
          confusing for keyboard and screen-reader users who can't see that
          they've "left" the dialog.
        </InfoDot>
      </div>

      {open && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
        >
          <div
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            style={{ background: '#fff', borderRadius: 10, padding: 24, width: 320, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}
          >
            <h3 id="modal-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center' }}>
              Confirm action
              <InfoDot label="Why role=dialog and aria-modal">
                <strong>role="dialog" + aria-modal="true"</strong> tells
                assistive technology this is a modal dialog, so screen readers
                announce it properly and treat content behind it as hidden.
              </InfoDot>
            </h3>
            <p style={{ fontSize: 14, color: '#444' }}>
              This is a real, working modal. Try tabbing through its buttons —
              focus wraps around instead of escaping to the page behind it.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={close} style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #d8d8e4', background: '#fff', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={close} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
