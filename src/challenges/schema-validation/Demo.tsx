import { useRef, useState } from 'react'
import { ValidationError } from 'yup'
import { InfoDot } from '../../components/InfoDot'
import { signupSchema, type FieldName, type SignupValues } from './schema'

// Raw form state is always what the inputs hold (strings and booleans).
// The schema is responsible for turning it into typed, cleaned output.
interface FormState {
  username: string
  email: string
  age: string
  password: string
  confirmPassword: string
  isBusiness: boolean
  companyName: string
  acceptTerms: boolean
}

const INITIAL: FormState = {
  username: '',
  email: '',
  age: '',
  password: '',
  confirmPassword: '',
  isBusiness: false,
  companyName: '',
  acceptTerms: false,
}

type Errors = Partial<Record<FieldName, string>>

// Fields whose validity depends on another field's value.
const DEPENDENTS: Partial<Record<FieldName, FieldName[]>> = {
  password: ['confirmPassword'],
  isBusiness: ['companyName'],
}

/** Turns Yup's aggregated error into { field: firstMessage }. */
function toErrorMap(err: ValidationError): Errors {
  const errors: Errors = {}
  for (const issue of err.inner) {
    const path = issue.path as FieldName | undefined
    if (path && !errors[path]) errors[path] = issue.message
  }
  return errors
}

export default function SchemaValidationDemo() {
  const [values, setValues] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [checking, setChecking] = useState<Partial<Record<FieldName, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [output, setOutput] = useState<SignupValues | null>(null)
  // Each field gets a request counter, so a slow async check can never
  // overwrite the result of a newer one (same race as debounced search).
  const latestCheck = useRef<Partial<Record<FieldName, number>>>({})

  async function validateField(field: FieldName, nextValues: FormState) {
    const id = (latestCheck.current[field] ?? 0) + 1
    latestCheck.current[field] = id
    setChecking((c) => ({ ...c, [field]: true }))
    let message: string | undefined
    try {
      // validateAt runs only this field's rules, but against the whole
      // object, so cross-field rules like ref('password') still work.
      await signupSchema.validateAt(field, nextValues)
    } catch (err) {
      if (err instanceof ValidationError) message = err.message
    }
    if (latestCheck.current[field] !== id) return // a newer check superseded this one
    setChecking((c) => ({ ...c, [field]: false }))
    setErrors((e) => ({ ...e, [field]: message }))
  }

  function revalidate(field: FieldName, nextValues: FormState, nextTouched = touched) {
    if (nextTouched[field]) void validateField(field, nextValues)
    for (const dep of DEPENDENTS[field] ?? []) {
      if (nextTouched[dep]) void validateField(dep, nextValues)
    }
  }

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    const next = { ...values, [field]: value }
    setValues(next)
    setOutput(null)
    revalidate(field, next)
  }

  function blur(field: FieldName) {
    const nextTouched = { ...touched, [field]: true }
    setTouched(nextTouched)
    revalidate(field, values, nextTouched)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setTouched(Object.fromEntries(Object.keys(INITIAL).map((k) => [k, true])))
    try {
      // abortEarly: false collects every failing rule instead of stopping at the first.
      const result = await signupSchema.validate(values, { abortEarly: false })
      setErrors({})
      setOutput(result)
    } catch (err) {
      if (err instanceof ValidationError) setErrors(toErrorMap(err))
      setOutput(null)
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setValues(INITIAL)
    setErrors({})
    setTouched({})
    setOutput(null)
  }

  const err = (field: FieldName) => (touched[field] ? errors[field] : undefined)

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          id="sv-username"
          label="Username"
          value={values.username}
          error={err('username')}
          hint={checking.username ? 'Checking availability…' : 'Try "admin" to see the async rule fail.'}
          onChange={(v) => update('username', v)}
          onBlur={() => blur('username')}
          info={
            <>
              <strong>Sync and async rules in one chain.</strong> <code>.min()</code> and{' '}
              <code>.matches()</code> run instantly; the custom <code>.test()</code> returns a promise and
              only hits the "server" once the cheap rules pass.
            </>
          }
        />
        <TextField
          id="sv-email"
          label="Email"
          type="email"
          value={values.email}
          error={err('email')}
          onChange={(v) => update('email', v)}
          onBlur={() => blur('email')}
          info={
            <>
              <strong>Built-in rule.</strong> <code>string().email()</code> is a pragmatic format check,
              not proof the inbox exists. Real verification is a confirmation email.
            </>
          }
        />
        <TextField
          id="sv-age"
          label="Age"
          inputMode="numeric"
          value={values.age}
          error={err('age')}
          onChange={(v) => update('age', v)}
          onBlur={() => blur('age')}
          info={
            <>
              <strong>Coercion, not just checking.</strong> The input holds a string. <code>number()</code>{' '}
              casts it, <code>.transform()</code> maps "" to undefined so you get "required" rather than a
              confusing type error, and the submitted output is a real number.
            </>
          }
        />
        <TextField
          id="sv-password"
          label="Password"
          type="password"
          value={values.password}
          error={err('password')}
          onChange={(v) => update('password', v)}
          onBlur={() => blur('password')}
        />
        <TextField
          id="sv-confirm"
          label="Confirm password"
          type="password"
          value={values.confirmPassword}
          error={err('confirmPassword')}
          onChange={(v) => update('confirmPassword', v)}
          onBlur={() => blur('confirmPassword')}
          info={
            <>
              <strong>Cross-field rule.</strong> <code>oneOf([ref('password')])</code> compares against a
              sibling field. Changing the password re-checks this field too, so the error never goes stale.
            </>
          }
        />

        <Checkbox
          id="sv-business"
          label="This is a business account"
          checked={values.isBusiness}
          onChange={(v) => update('isBusiness', v)}
          info={
            <>
              <strong>Conditional rule.</strong> <code>.when('isBusiness', ...)</code> makes company name
              required only when this is ticked, and strips it from the output when it is not.
            </>
          }
        />
        {values.isBusiness && (
          <TextField
            id="sv-company"
            label="Company name"
            value={values.companyName}
            error={err('companyName')}
            onChange={(v) => update('companyName', v)}
            onBlur={() => blur('companyName')}
          />
        )}

        <Checkbox
          id="sv-terms"
          label="I accept the terms"
          checked={values.acceptTerms}
          error={err('acceptTerms')}
          onChange={(v) => {
            update('acceptTerms', v)
            blur('acceptTerms')
          }}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button type="submit" disabled={submitting} style={primaryBtn}>
            {submitting ? 'Validating…' : 'Create account'}
          </button>
          <button type="button" onClick={reset} style={secondaryBtn}>
            Reset
          </button>
        </div>
      </form>

      {output && (
        <div style={{ marginTop: 16 }}>
          <p style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>
            ✅ Valid. This is what the schema returned:
            <InfoDot label="Why show the cast output">
              <strong>Validation also parses.</strong> Notice <code>age</code> is a number, strings are
              trimmed, and <code>companyName</code> is gone if this is not a business account. You submit
              the schema's output, not the raw form state.
            </InfoDot>
          </p>
          <pre style={{ margin: 0 }}>
            <code>{JSON.stringify(output, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

function TextField(props: {
  id: string
  label: string
  value: string
  error?: string
  hint?: string
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  info?: React.ReactNode
  onChange: (value: string) => void
  onBlur: () => void
}) {
  const { id, label, value, error, hint, type = 'text', inputMode, info, onChange, onBlur } = props
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
        {info && <InfoDot label={`About the ${label} rule`}>{info}</InfoDot>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        style={{ ...inputStyle, borderColor: error ? '#c0392b' : '#d8d8e4' }}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" style={errorStyle}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} style={hintStyle}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}

function Checkbox(props: {
  id: string
  label: string
  checked: boolean
  error?: string
  info?: React.ReactNode
  onChange: (checked: boolean) => void
}) {
  const { id, label, checked, error, info, onChange } = props
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {label}
        {info && <InfoDot label={`About the ${label} rule`}>{info}</InfoDot>}
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" style={errorStyle}>
          {error}
        </p>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 4 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #d8d8e4', borderRadius: 6 }
const errorStyle: React.CSSProperties = { fontSize: 12, color: '#c0392b', margin: '4px 0 0' }
const hintStyle: React.CSSProperties = { fontSize: 12, color: '#6b6b7c', margin: '4px 0 0' }
const primaryBtn: React.CSSProperties = { padding: '9px 16px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 14 }
const secondaryBtn: React.CSSProperties = { padding: '9px 16px', borderRadius: 6, border: '1px solid #d8d8e4', background: '#fff', cursor: 'pointer', fontSize: 14 }
