import { useEffect, useState } from 'react'
import { jsCategories, totalJsProblems, type Difficulty } from '../javascript/problems'
import { slugify } from '../javascript/slugify'
import layout from './Layout.module.css'
import styles from './JavaScriptPage.module.css'

const SOLVED_KEY = 'js-practice:solved'

function loadSolved(): string[] {
  try {
    const raw = localStorage.getItem(SOLVED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function difficultyClass(d: Difficulty) {
  if (d === 'Easy') return styles.difficultyEasy
  if (d === 'Medium') return styles.difficultyMedium
  return styles.difficultyHard
}

export function JavaScriptPage() {
  const [solved, setSolved] = useState<string[]>(() => loadSolved())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      localStorage.setItem(SOLVED_KEY, JSON.stringify(solved))
    } catch {
      /* ignore */
    }
  }, [solved])

  function toggleSolved(slug: string) {
    setSolved((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  function toggleExpanded(slug: string, revealSolutionToo: boolean) {
    setExpanded((prev) => {
      const next = prev === slug ? null : slug
      return next
    })
    if (revealSolutionToo) {
      setRevealed((prev) => ({ ...prev, [slug]: true }))
    }
  }

  const pct = Math.round((solved.length / totalJsProblems) * 100)

  return (
    <div className={styles.wrap}>
      <div className={layout.header}>
        <h2>Pure JavaScript</h2>
        <p className={styles.intro}>
          Language-level coding problems, grouped by topic, in the style of a "30 Days of JavaScript" study
          plan: closures, array methods, async control flow, and a handful of classic design patterns. Each
          one has a prompt, a starter signature, and a revealable model solution with an explanation.
        </p>
        <p className={styles.note}>Progress is tracked in your browser only.</p>
      </div>

      <div className={styles.banner}>
        <div>
          <p className={styles.bannerTitle}>Learn JS Basics</p>
          <p className={styles.bannerSub}>{jsCategories.length} topics &middot; {totalJsProblems} problems</p>
        </div>
        <div className={styles.bannerProgress}>
          <span className={styles.bannerFraction}>
            {solved.length}/{totalJsProblems}
          </span>
          <div className={styles.bannerBar} aria-hidden="true">
            <div className={styles.bannerBarFill} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {jsCategories.map((category) => {
        const solvedInCategory = category.problems.filter((p) => solved.includes(p.slug)).length
        return (
          <div key={category.name} id={`js-${slugify(category.name)}`} className={styles.category}>
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryName}>{category.name}</h3>
              <span className={styles.categoryCount}>
                {solvedInCategory}/{category.problems.length}
              </span>
            </div>
            <p className={styles.categoryDesc}>{category.description}</p>

            <div className={styles.list}>
              {category.problems.map((problem) => {
                const isSolved = solved.includes(problem.slug)
                const isExpanded = expanded === problem.slug
                const isRevealed = !!revealed[problem.slug]
                return (
                  <div key={problem.slug}>
                    <div
                      className={isExpanded ? styles.rowExpanded : styles.row}
                      onClick={() => toggleExpanded(problem.slug, false)}
                    >
                      <button
                        type="button"
                        className={isSolved ? styles.checkboxDone : styles.checkbox}
                        aria-label={isSolved ? `Mark ${problem.title} as not solved` : `Mark ${problem.title} as solved`}
                        aria-pressed={isSolved}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSolved(problem.slug)
                        }}
                      >
                        {isSolved ? '✓' : ''}
                      </button>
                      <div className={styles.rowMain}>
                        <span className={isSolved ? styles.rowSolvedTitle : styles.rowTitle}>{problem.title}</span>
                        <button
                          type="button"
                          className={styles.rowSolutionLink}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpanded(problem.slug, true)
                          }}
                        >
                          Solution
                        </button>
                      </div>
                      <span className={difficultyClass(problem.difficulty)}>{problem.difficulty}</span>
                    </div>

                    {isExpanded && (
                      <div className={styles.detail}>
                        <p className={styles.detailLabel}>Problem</p>
                        <p>{problem.prompt}</p>

                        {problem.example && (
                          <>
                            <p className={styles.detailLabel}>Example</p>
                            <pre>
                              <code>{problem.example}</code>
                            </pre>
                          </>
                        )}

                        <p className={styles.detailLabel}>Starter</p>
                        <pre>
                          <code>{problem.starterCode}</code>
                        </pre>

                        {!isRevealed ? (
                          <button
                            type="button"
                            className={styles.solutionBtn}
                            onClick={() => setRevealed((prev) => ({ ...prev, [problem.slug]: true }))}
                          >
                            Reveal solution
                          </button>
                        ) : (
                          <>
                            <p className={styles.detailLabel}>Solution</p>
                            <pre>
                              <code>{problem.solutionCode}</code>
                            </pre>
                            <div className={styles.explanation}>{problem.explanation}</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
