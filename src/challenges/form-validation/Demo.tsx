import { useEffect, useState } from 'react'
import { InfoDot } from '../../components/InfoDot'

const TAKEN_USERNAMES = ['admin', 'root', 'erin', 'test']

function checkUsernameAvailable(username: string, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(!TAKEN_USERNAMES.includes(username.toLowerCase())), 500)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

interface Errors {
  username?: string
  email?: string
  password?: string
}

export default function FormValidationDemo() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [submitted, setSubmitted] = useState(false)

  // Async validation: check availability, but debounced + cancellable so we
  // don't check on every keystroke or race stale checks (same pattern as the
  // debounced-search challenge).
  useEffect(() => {
    if (username.trim().length < 3) {
      setUsernameTaken(false)
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setUsernameChecking(true)
      checkUsernameAvailable(username, controller.signal)
        .then((available) => {
          setUsernameTaken(!available)
          setUsernameChecking(false)
        })
        .catch(() => {})
    }, 400)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [username])

  const errors: Errors = {}
  if (touched.username && username.trim().length < 3) errors.username = 'Username must be at least 3 characters.'
  else if (touched.username && usernameTaken) errors.username = 'That username is already taken.'
  if (touched.email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (touched.password && password.length < 8) errors.password = 'Password must be at least 8 characters.'

  const isValid = username.trim().length >= 3 && !usernameTaken && /^\S+@\S+\.\S+$/.test(email) && password.length >= 8

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ username: true, email: true, password: true })
    if (isValid) setSubmitted(true)
  }

  if (submitted) {
    return <p style={{ fontSize: 14 }}>✅ Account created for <strong>{username}</strong>. (No data was actually sent anywhere.)</p>
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field
        label="Username"
        htmlFor="fv-username"
        error={errors.username}
        hint={usernameChecking ? 'Checking availability…' : undefined}
        info={
          <>
            <strong>Why debounce this check?</strong> An async "is this taken"
            check that runs on every keystroke would spam the server and could
            resolve out of order. It's debounced 400ms and cancelled on
            unmount/change, same pattern as the search example.
          </>
        }
      >
        <input
          id="fv-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, username: true }))}
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'fv-username-error' : undefined}
          style={inputStyle}
        />
      </Field>

      <Field
        label="Email"
        htmlFor="fv-email"
        error={errors.email}
        info={
          <>
            <strong>Regex is intentionally loose.</strong> Fully RFC-5322-valid
            email regex is notoriously complex; a loose "has an @ and a dot"
            check catches typos without rejecting valid edge-case addresses.
            Real verification happens by sending a confirmation email.
          </>
        }
      >
        <input
          id="fv-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'fv-email-error' : undefined}
          style={inputStyle}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="fv-password"
        error={errors.password}
        info={
          <>
            <strong>Validate on blur, not on every keystroke.</strong>{' '}
            Showing "too short" while the user is still mid-word feels
            aggressive. Errors appear once a field has been visited
            (<code>touched</code>) and re-validate live only after that.
          </>
        }
      >
        <input
          id="fv-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'fv-password-error' : undefined}
          style={inputStyle}
        />
      </Field>

      <button type="submit" style={{ padding: '9px 16px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 14 }}>
        Create account
      </button>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  info,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  info: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={htmlFor} style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        {label}
        <InfoDot label={`Why this validation for ${label}`}>{info}</InfoDot>
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: 12, color: '#6b6b7c', margin: '4px 0 0' }}>{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" style={{ fontSize: 12, color: '#c0392b', margin: '4px 0 0' }}>
          {error}
        </p>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d8d8e4',
  borderRadius: 6,
}
