import { useRef, useState } from 'react'
import { InfoDot } from '../../components/InfoDot'

interface Task {
  id: string
  text: string
}

const INITIAL: Task[] = [
  { id: 't1', text: 'Design the onboarding flow' },
  { id: 't2', text: 'Write API documentation' },
  { id: 't3', text: 'Fix Safari flexbox bug' },
  { id: 't4', text: 'Ship v2.4 release' },
]

export default function DragDropListDemo() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const liveRegionRef = useRef<HTMLDivElement | null>(null)

  function handleDragStart(id: string) {
    setDragId(id)
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault() // required: without this, onDrop never fires
    if (id !== overId) setOverId(id)
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null)
      setOverId(null)
      return
    }
    setTasks((prev) => {
      const next = [...prev]
      const fromIndex = next.findIndex((t) => t.id === dragId)
      const toIndex = next.findIndex((t) => t.id === targetId)
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `${moved.text} moved to position ${toIndex + 1} of ${next.length}.`
      }
      return next
    })
    setDragId(null)
    setOverId(null)
  }

  function moveByKeyboard(id: string, direction: -1 | 1) {
    setTasks((prev) => {
      const index = prev.findIndex((t) => t.id === id)
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `${next[target].text} moved to position ${target + 1} of ${next.length}.`
      }
      return next
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        Task priority order
        <InfoDot label="Drag and drop is mouse-only">
          <strong>Native drag-and-drop is mouse/touch-only</strong> — it has no
          built-in keyboard equivalent. That's why each row also has ⬆/⬇
          buttons: a real accessible implementation needs a non-drag way to
          reorder, not just a fallback screen reader users are told to accept.
        </InfoDot>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map((task, i) => (
          <li
            key={task.id}
            draggable
            onDragStart={() => handleDragStart(task.id)}
            onDragOver={(e) => handleDragOver(e, task.id)}
            onDrop={() => handleDrop(task.id)}
            onDragEnd={() => {
              setDragId(null)
              setOverId(null)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              marginBottom: 6,
              borderRadius: 8,
              border: overId === task.id && dragId !== task.id ? '2px dashed #6366f1' : '1px solid #e4e4ec',
              background: dragId === task.id ? '#f0f0f8' : '#fff',
              opacity: dragId === task.id ? 0.5 : 1,
              cursor: 'grab',
            }}
          >
            <span aria-hidden="true" style={{ color: '#bbb', fontSize: 14 }}>
              ⠿
            </span>
            <span style={{ flex: 1, fontSize: 14 }}>{task.text}</span>
            <button
              aria-label={`Move ${task.text} up`}
              onClick={() => moveByKeyboard(task.id, -1)}
              disabled={i === 0}
              style={moveBtnStyle}
            >
              ↑
            </button>
            <button
              aria-label={`Move ${task.text} down`}
              onClick={() => moveByKeyboard(task.id, 1)}
              disabled={i === tasks.length - 1}
              style={moveBtnStyle}
            >
              ↓
            </button>
          </li>
        ))}
      </ul>
      {/* aria-live region: announces reorder results to screen readers,
          since visual re-ordering alone communicates nothing to them. */}
      <div ref={liveRegionRef} aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }} />
      <p style={{ fontSize: 12, color: '#6b6b7c', marginTop: 8, display: 'flex', alignItems: 'center' }}>
        Drag a row, or use the arrow buttons
        <InfoDot label="Why preventDefault in dragover">
          <strong>Why call preventDefault() in onDragOver?</strong> By default
          the browser doesn't allow dropping on most elements at all — calling
          <code>preventDefault()</code> in the dragover handler is what tells
          the browser "this is a valid drop target," and without it{' '}
          <code>onDrop</code> simply never fires.
        </InfoDot>
      </p>
    </div>
  )
}

const moveBtnStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 6,
  border: '1px solid #d8d8e4',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 12,
}
