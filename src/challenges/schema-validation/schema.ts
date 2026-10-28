import * as yup from 'yup'

const TAKEN_USERNAMES = ['admin', 'root', 'erin', 'test']

// Simulates a server round-trip for the async "is this username free?" rule.
function isUsernameAvailable(username: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(!TAKEN_USERNAMES.includes(username.toLowerCase())), 400)
  })
}

/**
 * Every rule for the form lives here, in one declarative object.
 * The component never re-implements a rule; it only asks the schema.
 */
export const signupSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required('Username is required.')
    .min(3, 'Username must be at least 3 characters.')
    .matches(/^[a-z0-9_]+$/i, 'Only letters, numbers and underscores.')
    .test('available', 'That username is already taken.', async (value) => {
      // Skip the network call until the cheap sync rules pass.
      if (!value || value.length < 3) return true
      return isUsernameAvailable(value)
    }),
  email: yup.string().trim().required('Email is required.').email('Enter a valid email address.'),
  age: yup
    .number()
    // An empty input gives NaN; turn that into undefined so "required" fires instead of a type error.
    .transform((value, original) => (original === '' ? undefined : value))
    .typeError('Age must be a number.')
    .required('Age is required.')
    .integer('Age must be a whole number.')
    .min(18, 'You must be at least 18.'),
  password: yup
    .string()
    .required('Password is required.')
    .min(8, 'Password must be at least 8 characters.')
    .matches(/[0-9]/, 'Include at least one number.'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password.')
    .oneOf([yup.ref('password')], 'Passwords do not match.'),
  isBusiness: yup.boolean().default(false),
  companyName: yup.string().when('isBusiness', {
    is: true,
    then: (s) => s.trim().required('Company name is required for business accounts.'),
    otherwise: (s) => s.strip(), // dropped from the output entirely
  }),
  acceptTerms: yup.boolean().oneOf([true], 'You must accept the terms.'),
})

/** The TypeScript type of valid, cast output, derived from the schema rather than written by hand. */
export type SignupValues = yup.InferType<typeof signupSchema>

export type FieldName = keyof yup.InferType<typeof signupSchema>
