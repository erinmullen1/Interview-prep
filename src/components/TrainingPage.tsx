import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChallenge } from '../challenges/registry'
import { getTraining, type KeyTerm, type TrainingStep } from '../training/content'
import { getGeneralTraining } from '../training/general'
import layout from './Layout.module.css'
import styles from './Learn.module.css'
import { Prose } from './Prose'

function storageKey(id: string) {
  return `training:${id}`
}

function loadDone(id: string): number[] {
  try {
    const raw = localStorage.getItem(storageKey(id))
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export function TrainingPage() {
  const { id } = useParams<{ id: string }>()
  // Keying on the id remounts the inner page when navigating between
  // modules, so all step/progress state resets without an effect.
  return <TrainingInner key={id ?? ''} id={id} />
}

interface ResolvedTraining {
  title: string
  intro: string
  outcomes: string[]
  terms: KeyTerm[]
  steps: TrainingStep[]
  /** Link to the finished demo, only for challenge-backed modules. */
  demoId?: string
}

function resolveTraining(id: string): ResolvedTraining | undefined {
  const challenge = getChallenge(id)
  const challengeModule = getTraining(id)
  if (challenge && challengeModule) {
    return { ...challengeModule, title: challenge.title, demoId: challenge.id }
  }
  const general = getGeneralTraining(id)
  if (general) return general
  return undefined
}

function TrainingInner({ id }: { id?: string }) {
  const module = id ? resolveTraining(id) : undefined

  const [done, setDone] = useState<number[]>(() => (id ? loadDone(id) : []))
  const [current, setCurrent] = useState(() => {
    if (!module) return 0
    const firstIncomplete = module.steps.findIndex((_, i) => !done.includes(i))
    return firstIncomplete === -1 ? 0 : firstIncomplete
  })
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    if (!id) return
    try {
      localStorage.setItem(storageKey(id), JSON.stringify(done))
    } catch {
      /* ignore */
    }
  }, [id, done])

  // Scroll to the top of the lesson, and hide the previous lesson's answer, when the step changes.
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0 })
    setShowAnswer(false)
  }, [current])

  if (!id || !module) {
    return (
      <div className={layout.landing}>
        <h2>Not found</h2>
        <p>No training module matches "{id}". Pick one from the sidebar.</p>
      </div>
    )
  }

  const step = module.steps[current]
  const total = module.steps.length
  const isDone = done.includes(current)
  const isLast = current === total - 1
  const pct = Math.round((done.length / total) * 100)

  function markDone() {
    setDone((prev) => (prev.includes(current) ? prev : [...prev, current]))
    if (!isLast) setCurrent(current + 1)
  }

  function reset() {
    setDone([])
    setCurrent(0)
  }

  return (
    <div className={styles.wrap}>
      <div className={layout.header}>
        <p className={styles.eyebrow}>Training</p>
        <h2>{module.title}</h2>
        <p>
          <Prose text={module.intro} />
        </p>
      </div>

      {current === 0 && done.length === 0 && (
        <div className={styles.outcomes}>
          <p className={styles.sectionLabel}>By the end you will be able to</p>
          <ul>
            {module.outcomes.map((o) => (
              <li key={o}>
                <Prose text={o} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className={styles.terms}>
        <summary>Key terms used in this module ({module.terms.length})</summary>
        <dl>
          {module.terms.map((t) => (
            <div key={t.term}>
              <dt>{t.term}</dt>
              <dd>
                <Prose text={t.meaning} />
              </dd>
            </div>
          ))}
        </dl>
      </details>

      <div className={styles.progress}>
        <span>
          {done.length}/{total} lessons complete
        </span>
        <div className={styles.bar} aria-hidden="true">
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
        {module.demoId && (
          <Link className={styles.btnLink} to={`/challenge/${module.demoId}`}>
            View finished demo →
          </Link>
        )}
      </div>

      <div className={styles.stepList} role="list">
        {module.steps.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="listitem"
            aria-current={i === current ? 'step' : undefined}
            className={i === current ? styles.stepPillActive : done.includes(i) ? styles.stepPillDone : styles.stepPill}
            onClick={() => setCurrent(i)}
          >
            {done.includes(i) ? '✓ ' : ''}
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      <article className={styles.card}>
        <p className={styles.eyebrow}>
          Lesson {current + 1} of {total}
        </p>
        <h3>{step.title}</h3>
        <p className={styles.summary}>
          <Prose text={step.summary} />
        </p>

        <p className={styles.sectionLabel}>The idea</p>
        <p className={styles.concept}>
          <Prose text={step.concept} />
        </p>

        <p className={styles.sectionLabel}>Build it</p>
        <ol className={styles.walkthrough}>
          {step.walkthrough.map((section, i) => (
            <li key={i}>
              <p>
                <Prose text={section.text} />
              </p>
              {section.code && (
                <pre>
                  <code>{section.code}</code>
                </pre>
              )}
            </li>
          ))}
        </ol>

        {step.pitfalls && step.pitfalls.length > 0 && (
          <>
            <p className={styles.sectionLabel}>Common mistakes</p>
            <div className={styles.practices}>
              <ul>
                {step.pitfalls.map((p) => (
                  <li key={p}>
                    <Prose text={p} />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <p className={styles.sectionLabel}>Check yourself</p>
        <p className={styles.checkpoint}>
          <Prose text={step.checkpoint} />
        </p>
        <button type="button" className={styles.reveal} onClick={() => setShowAnswer((v) => !v)} aria-expanded={showAnswer}>
          {showAnswer ? 'Hide answer' : 'Reveal answer'}
        </button>
        {showAnswer && (
          <p className={styles.answer}>
            <Prose text={step.checkpointAnswer} />
          </p>
        )}

        <div className={styles.nav}>
          <button type="button" className={styles.btn} disabled={current === 0} onClick={() => setCurrent(current - 1)}>
            ← Previous lesson
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {done.length === total && (
              <button type="button" className={styles.btn} onClick={reset}>
                Reset progress
              </button>
            )}
            {isLast && isDone ? (
              <Link className={styles.btnPrimary} to={`/tests/${id}`} style={{ textDecoration: 'none' }}>
                Take the test →
              </Link>
            ) : (
              <button type="button" className={styles.btnPrimary} onClick={markDone}>
                {isDone ? 'Next lesson →' : isLast ? 'Mark complete' : 'Mark done & continue →'}
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
