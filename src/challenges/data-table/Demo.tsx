import { useMemo, useState } from 'react'
import { InfoDot } from '../../components/InfoDot'

interface Employee {
  id: number
  name: string
  department: string
  salary: number
}

const EMPLOYEES: Employee[] = [
  { id: 1, name: 'Alex Chen', department: 'Engineering', salary: 118000 },
  { id: 2, name: 'Priya Patel', department: 'Design', salary: 96000 },
  { id: 3, name: 'Jordan Smith', department: 'Engineering', salary: 132000 },
  { id: 4, name: 'Morgan Lee', department: 'Sales', salary: 88000 },
  { id: 5, name: 'Sam Nguyen', department: 'Engineering', salary: 104000 },
  { id: 6, name: 'Taylor Brooks', department: 'Marketing', salary: 91000 },
  { id: 7, name: 'Casey Kim', department: 'Design', salary: 99500 },
  { id: 8, name: 'Riley Johnson', department: 'Sales', salary: 79000 },
]

type SortKey = keyof Employee
type SortDir = 'asc' | 'desc'

export default function DataTableDemo() {
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // useMemo avoids re-filtering and re-sorting the entire dataset on every
  // render (e.g. when unrelated state changes) — it only recomputes when
  // the filter text, sort key, or sort direction actually change.
  const rows = useMemo(() => {
    const filtered = EMPLOYEES.filter(
      (e) => e.name.toLowerCase().includes(filter.toLowerCase()) || e.department.toLowerCase().includes(filter.toLowerCase()),
    )
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [filter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'salary', label: 'Salary' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name or department…"
          style={{ flex: 1, padding: '7px 10px', border: '1px solid #d8d8e4', borderRadius: 6, fontSize: 13 }}
        />
        <InfoDot label="Why useMemo">
          <strong>Why memoize?</strong> Filtering + sorting on every render
          (including renders caused by unrelated state elsewhere in the app)
          would redo O(n log n) work needlessly. <code>useMemo</code> re-runs
          only when the filter text or sort settings actually change.
        </InfoDot>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                style={{ textAlign: 'left', padding: '8px 6px', borderBottom: '2px solid #e4e4ec', cursor: 'pointer', userSelect: 'none' }}
              >
                {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td style={cellStyle}>{row.name}</td>
              <td style={cellStyle}>{row.department}</td>
              <td style={cellStyle}>${row.salary.toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} style={{ ...cellStyle, textAlign: 'center', color: '#6b6b7c' }}>
                No matching rows.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: '#6b6b7c', marginTop: 8, display: 'flex', alignItems: 'center' }}>
        Click a column header to sort
        <InfoDot label="Sort stability">
          <strong>Sort stability matters.</strong> This sort re-derives from the
          original array each time (via <code>[...filtered].sort()</code>)
          rather than mutating in place, so React always sees a new array
          reference and re-renders correctly, and repeated sorts stay
          predictable.
        </InfoDot>
      </p>
    </div>
  )
}

const cellStyle: React.CSSProperties = { padding: '8px 6px', borderBottom: '1px solid #f0f0f6' }
