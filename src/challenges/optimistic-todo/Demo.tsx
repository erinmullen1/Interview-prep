import { useState } from 'react'
import { InfoDot } from '../../components/InfoDot'

interface Todo {
  id: string
  text: string
  done: boolean
  status: 'saved' | 'saving' | 'error'
}

// Simulates a flaky backend: fails ~30% of the time.
function fakeSaveApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (Math.random() < 0.3 ? reject(new Error('Network error')) : resolve()), 700)
  })
}

let nextId = 1

export default function OptimisticTodoDemo() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 'a', text: 'Review pull request', done: false, status: 'saved' },
    { id: 'b', text: 'Write unit tests', done: true, status: 'saved' },
  ])
  const [text, setText] = useState('')

  function addTodo() {
    if (!text.trim()) return
    const id = `t${nextId++}`
    const optimisticTodo: Todo = { id, text, done: false, status: 'saving' }
    // 1) Update UI immediately, before the server confirms anything.
    setTodos((prev) => [...prev, optimisticTodo])
    setText('')

    fakeSaveApi()
      .then(() => {
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'saved' } : t)))
      })
      .catch(() => {
        // 2) Roll back: mark as error rather than silently removing it, so
        // the user can see what failed and retry.
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'error' } : t)))
      })
  }

  function toggleDone(id: string) {
    const previous = todos
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done, status: 'saving' } : t)))
    fakeSaveApi()
      .then(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'saved' } : t))))
      .catch(() => setTodos(previous)) // full rollback to the pre-toggle state
  }

  function retry(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'saving' } : t)))
    fakeSaveApi()
      .then(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'saved' } : t))))
      .catch(() => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'error' } : t))))
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a task…"
          style={{ flex: 1, padding: '8px 10px', border: '1px solid #d8d8e4', borderRadius: 6 }}
        />
        <button onClick={addTodo} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer' }}>
          Add
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: '#6b6b7c', marginBottom: 8 }}>
        ~30% of saves randomly fail, so you can see rollback in action
        <InfoDot label="Why simulate failure">
          <strong>Why does this fail sometimes?</strong> Real networks are
          unreliable. An optimistic UI is only correctly implemented if it
          also handles the failure path &mdash; this demo deliberately fails
          ~30% of saves so you can see the rollback and retry behavior.
        </InfoDot>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {todos.map((t) => (
          <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px', borderBottom: '1px solid #f0f0f6' }}>
            <input type="checkbox" checked={t.done} onChange={() => toggleDone(t.id)} disabled={t.status === 'saving'} />
            <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none', color: t.status === 'error' ? '#c0392b' : undefined, fontSize: 14 }}>
              {t.text}
            </span>
            {t.status === 'saving' && (
              <span style={{ fontSize: 11, color: '#6b6b7c', display: 'flex', alignItems: 'center' }}>
                Saving…
                <InfoDot label="What optimistic means">
                  <strong>This is the optimistic state.</strong> The checkbox/text
                  already reflects the change, even though the server hasn't
                  confirmed it yet.
                </InfoDot>
              </span>
            )}
            {t.status === 'error' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#c0392b' }}>Failed to save</span>
                <button onClick={() => retry(t.id)} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, border: '1px solid #c0392b', background: '#fff', color: '#c0392b', cursor: 'pointer' }}>
                  Retry
                </button>
              </span>
            )}
            <button onClick={() => removeTodo(t.id)} aria-label={`Delete ${t.text}`} style={{ border: 'none', background: 'none', color: '#6b6b7c', cursor: 'pointer', fontSize: 14 }}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
