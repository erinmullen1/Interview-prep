import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChallenge } from '../challenges/registry'
import { getTest } from '../tests/content'
import layout from './Layout.module.css'
import styles from './Learn.module.css'

function bestKey(id: string) {
  return `test-best:${id}`
}

function loadBest(id: string): number | null {
  try {
    const raw = localStorage.getItem(bestKey(id))
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

export function TestPage() {
  const { id } = useParams<{ id: string }>()
  // Keying on the id remounts the quiz when navigating between tests,
  // so answers and submission state reset without an effect.
  return <TestInner key={id ?? ''} id={id} />
}

function TestInner({ id }: { id?: string }) {
  const challenge = id ? getChallenge(id) : undefined
  const module = id ? getTest(id) : undefined

  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [best, setBest] = useState<number | null>(() => (id ? loadBest(id) : null))

  if (!challenge || !module) {
    return (
      <div className={layout.landing}>
        <h2>Not found</h2>
        <p>No test matches "{id}". Pick one from the sidebar.</p>
      </div>
    )
  }

  const total = module.questions.length
  const answered = Object.keys(answers).length
  const score = module.questions.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0)
  const pct = Math.round((score / total) * 100)

  function submit() {
    setSubmitted(true)
    if (id && (best === null || pct > best)) {
      setBest(pct)
      try {
        localStorage.setItem(bestKey(id), String(pct))
      } catch {
        /* ignore */
      }
    }
  }

  function retry() {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <div className={styles.wrap}>
      <div className={layout.header}>
        <p className={styles.eyebrow}>Test</p>
        <h2>{challenge.title}</h2>
        <p>
          {total} questions on the approach, trade-offs and pitfalls of this challenge. Pick one answer per
          question, then submit to see explanations.
        </p>
        {best !== null && <p className={styles.best}>Best score so far: {best}%</p>}
      </div>

      {submitted && (
        <p className={`${styles.score} ${pct >= 80 ? styles.scoreGood : styles.scoreBad}`} role="status">
          You scored {score}/{total} ({pct}%).{' '}
          {pct === 100
            ? 'Perfect.'
            : pct >= 80
              ? 'Solid. Review the ones you missed below.'
              : 'Worth another pass through the training module before retrying.'}
        </p>
      )}

      <section className={styles.card}>
        {module.questions.map((q, qi) => {
          const chosen = answers[qi]
          return (
            <fieldset key={q.prompt} className={styles.question} style={{ border: 'none', padding: 0, margin: '0 0 22px' }}>
              <legend style={{ padding: 0 }}>
                <p>
                  {qi + 1}. {q.prompt}
                </p>
              </legend>
              {q.code && (
                <pre>
                  <code>{q.code}</code>
                </pre>
              )}
              {q.options.map((opt, oi) => {
                let cls = styles.option
                if (submitted) {
                  if (oi === q.answer) cls = styles.optionCorrect
                  else if (chosen === oi) cls = styles.optionWrong
                }
                return (
                  <label key={opt} className={cls}>
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      checked={chosen === oi}
                      disabled={submitted}
                      onChange={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    />
                    <span>{opt}</span>
                  </label>
                )
              })}
              {submitted && (
                <p className={styles.explanation}>
                  {chosen === q.answer ? '✓ Correct. ' : '✗ '}
                  {q.explanation}
                </p>
              )}
            </fieldset>
          )
        })}

        <div className={styles.nav}>
          <Link className={styles.btnLink} to={`/training/${challenge.id}`}>
            ← Back to training
          </Link>
          {submitted ? (
            <button type="button" className={styles.btnPrimary} onClick={retry}>
              Retry
            </button>
          ) : (
            <button type="button" className={styles.btnPrimary} disabled={answered < total} onClick={submit}>
              {answered < total ? `Answer all (${answered}/${total})` : 'Submit answers'}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
