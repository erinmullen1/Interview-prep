import { useState, useId, type ReactNode } from 'react'
import styles from './InfoDot.module.css'

interface InfoDotProps {
  /** Short label announced to screen readers, e.g. "Why 300ms debounce" */
  label: string
  children: ReactNode
}

/**
 * A small "ⓘ" badge you can drop next to any piece of UI or text.
 * Hovering or focusing it reveals a popover explaining the decision
 * behind that specific piece of code/UI. Works with mouse hover AND
 * keyboard focus (Tab + it announces via aria-describedby), and tap
 * on touch devices toggles it open.
 */
export function InfoDot({ label, children }: InfoDotProps) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span className={styles.wrapper}>
      <button
        type="button"
        className={styles.dot}
        aria-describedby={open ? id : undefined}
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        i
      </button>
      {open && (
        <span role="tooltip" id={id} className={styles.popover}>
          {children}
        </span>
      )}
    </span>
  )
}
