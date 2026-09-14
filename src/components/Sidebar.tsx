import { NavLink, useLocation } from 'react-router-dom'
import { categories, challenges } from '../challenges/registry'
import styles from './Sidebar.module.css'

interface SidebarProps {
  open: boolean
}

type Mode = 'challenge' | 'training' | 'tests'

const MODES: { key: Mode; label: string; hint: string }[] = [
  { key: 'challenge', label: 'Challenges', hint: 'Working demos with explanations' },
  { key: 'training', label: 'Training', hint: 'Guided, step-by-step builds' },
  { key: 'tests', label: 'Tests', hint: 'Quiz yourself on each challenge' },
]

function modeFromPath(pathname: string): Mode {
  if (pathname.startsWith('/training')) return 'training'
  if (pathname.startsWith('/tests')) return 'tests'
  return 'challenge'
}

export function Sidebar({ open }: SidebarProps) {
  const { pathname } = useLocation()
  const mode = modeFromPath(pathname)
  const active = MODES.find((m) => m.key === mode)!

  return (
    <nav className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`} aria-label="Site navigation">
      <div className={styles.brand}>
        <h1>Frontend Interview Playground</h1>
        <p>Common mid-level take-home &amp; live-coding exercises, fully explained.</p>
      </div>

      <div className={styles.modes} role="tablist" aria-label="Section">
        {MODES.map((m) => (
          <NavLink
            key={m.key}
            to={m.key === 'challenge' ? '/' : `/${m.key}`}
            role="tab"
            aria-selected={mode === m.key}
            className={mode === m.key ? styles.modeActive : styles.mode}
          >
            {m.label}
          </NavLink>
        ))}
      </div>
      <p className={styles.modeHint}>{active.hint}</p>

      {categories.map((category) => (
        <div key={category}>
          <div className={styles.category}>{category}</div>
          {challenges
            .filter((c) => c.category === category)
            .map((c) => (
              <NavLink
                key={c.id}
                to={`/${mode}/${c.id}`}
                className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
              >
                {c.title}
              </NavLink>
            ))}
        </div>
      ))}
    </nav>
  )
}
