import { Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { getChallenge } from '../challenges/registry'
import styles from './Layout.module.css'

export function ChallengePage() {
  const { id } = useParams<{ id: string }>()
  const challenge = id ? getChallenge(id) : undefined

  if (!challenge) {
    return (
      <div className={styles.landing}>
        <h2>Not found</h2>
        <p>No challenge matches "{id}". Pick one from the sidebar.</p>
      </div>
    )
  }

  const { Demo, Notes, title, description } = challenge

  return (
    <div>
      <div className={styles.header}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className={styles.panels}>
        <section className={styles.panel} aria-label="Live demo">
          <p className={styles.panelTitle}>Live Demo</p>
          <Suspense fallback={<p>Loading demo…</p>}>
            <Demo />
          </Suspense>
        </section>
        <section className={styles.panel} aria-label="Explanation">
          <p className={styles.panelTitle}>Approach &amp; Trade-offs</p>
          <div className={styles.notes}>
            <Suspense fallback={<p>Loading notes…</p>}>
              <Notes />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  )
}
