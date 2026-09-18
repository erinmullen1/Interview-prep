import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { ChallengePage } from './components/ChallengePage'
import { TrainingPage } from './components/TrainingPage'
import { TestPage } from './components/TestPage'
import { challenges } from './challenges/registry'
import { GENERAL_CATEGORY, generalTests } from './tests/general'
import styles from './components/Layout.module.css'

function Landing() {
  return (
    <div className={styles.landing}>
      <h2>Welcome</h2>
      <p>
        This is a small library of the most common mid-level frontend "take-home" and
        live-coding exercises &mdash; built as real, working mini-features rather than
        LeetCode-style puzzles. Pick one from the sidebar.
      </p>
      <p>Each one includes:</p>
      <ul>
        <li>A fully interactive, working implementation</li>
        <li>A plain-language explanation of the approach and why it was chosen</li>
        <li>The trade-offs against alternative approaches</li>
        <li>
          Hover the <strong>ⓘ</strong> badges inside each demo and its notes for
          explanations of specific decisions
        </li>
      </ul>
      <p>{challenges.length} challenges are currently available, grouped by category in the sidebar.</p>
      <p>
        Use the <strong>Training</strong> tab to build each one step by step, then the{' '}
        <strong>Tests</strong> tab to check what stuck.
      </p>
    </div>
  )
}

function TrainingLanding() {
  return (
    <div className={styles.landing}>
      <h2>Training</h2>
      <p>
        Each module walks you through building a challenge from scratch, one step at a time. Every step
        has a goal, concrete instructions, reference code you can reveal when stuck, a checkpoint question,
        and the best practices an interviewer expects.
      </p>
      <p>
        Progress is saved in your browser. Finish a module and you will be pointed straight at its test.
      </p>
      <ul>
        {challenges.map((c) => (
          <li key={c.id}>
            <Link to={`/training/${c.id}`}>{c.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TestsLanding() {
  return (
    <div className={styles.landing}>
      <h2>Tests</h2>
      <p>
        Multiple-choice quizzes on the approach, trade-offs and common pitfalls of each challenge. These are
        the questions an interviewer is likely to ask after you build the feature.
      </p>
      <p>Your best score per test is saved in your browser.</p>
      <h3>Challenge tests</h3>
      <ul>
        {challenges.map((c) => (
          <li key={c.id}>
            <Link to={`/tests/${c.id}`}>{c.title}</Link>
          </li>
        ))}
      </ul>
      <h3>{GENERAL_CATEGORY}</h3>
      <p>
        Background questions that get mixed into frontend interviews alongside the practical exercises:
        language fundamentals, data structures, complexity, how the browser and network work, security,
        and React itself.
      </p>
      <ul>
        {generalTests.map((t) => (
          <li key={t.id}>
            <Link to={`/tests/${t.id}`}>{t.title}</Link>
            <span style={{ color: 'var(--text-dim)' }}> — {t.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          type="button"
          className={styles.overlayOpen}
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} />
      <main className={styles.main}>
        <button type="button" className={styles.menuButton} onClick={() => setSidebarOpen((v) => !v)}>
          ☰ Menu
        </button>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/challenge/:id" element={<ChallengePage />} />
          <Route path="/training" element={<TrainingLanding />} />
          <Route path="/training/:id" element={<TrainingPage />} />
          <Route path="/tests" element={<TestsLanding />} />
          <Route path="/tests/:id" element={<TestPage />} />
        </Routes>
      </main>
    </div>
  )
}
