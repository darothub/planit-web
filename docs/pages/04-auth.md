# Page 04 — Auth (`/auth/login`, `/auth/register`)

> **Goal:** Login and register pages. Clean, focused, full-page layout (no Navbar distractions).
> Register has two modes: Client and Planner. JWT stored in a cookie.

**Status:** ⬜ Not started
**Depends on:** Foundation (api.ts, authStore, types)

---

## Next.js Concepts
*Read `NEXTJS_CONCEPTS.md` §12 (React Hook Form + Zod) before building*

---

## Wireframe — Login

```
┌─────────────────────────────────────────────────────────┐
│  Logo (centred)                                         │
│                                                         │
│         ┌─────────────────────────────┐                 │
│         │   Welcome back              │                 │
│         │                             │                 │
│         │  Email                      │                 │
│         │  [________________________] │                 │
│         │                             │                 │
│         │  Password                   │                 │
│         │  [________________________] │                 │
│         │                             │                 │
│         │  [      Sign In      ]      │                 │
│         │                             │                 │
│         │  Don't have an account?     │                 │
│         │  Register here              │                 │
│         └─────────────────────────────┘                 │
└─────────────────────────────────────────────────────────┘
Background: warm gradient (sand → parchment)
```

## Wireframe — Register

```
┌─────────────────────────────────────────────────────────┐
│  Logo (centred)                                         │
│                                                         │
│         ┌─────────────────────────────┐                 │
│         │   Create your account       │                 │
│         │                             │                 │
│         │  [  I'm a Client  ] [  I'm a Planner  ]       │
│         │  (toggle tabs)              │                 │
│         │                             │                 │
│         │  First Name  │  Last Name   │                 │
│         │  Email                      │                 │
│         │  Password    (show/hide)    │                 │
│         │  (If Planner) Business Name │                 │
│         │                             │                 │
│         │  [     Create Account    ]  │                 │
│         │                             │                 │
│         │  Already have an account?   │                 │
│         │  Sign in                    │                 │
│         └─────────────────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

---

## Components Needed

| Component | Path | Notes |
|---|---|---|
| `LoginForm` | `components/auth/LoginForm.tsx` | |
| `RegisterForm` | `components/auth/RegisterForm.tsx` | Tab toggle for CLIENT/PLANNER |
| `AuthShell` | `components/auth/AuthShell.tsx` | Centred layout wrapper |
| `PasswordInput` | `components/ui/PasswordInput.tsx` | With show/hide toggle |
| `FormField` | `components/ui/FormField.tsx` | Label + input + error message |

---

## API Calls

```ts
POST /auth/login        Body: { email, password }
POST /auth/register/client   Body: { email, password, firstName, lastName }
POST /auth/register/planner  Body: { email, password, firstName, lastName, businessName? }
```

All return `ApiResponse<AuthResponse>` with a `token` (JWT).

---

## Step-by-Step Build

### Step 1 — Zod schemas

```ts
// src/lib/validations.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Required').max(100),
  lastName: z.string().min(1, 'Required').max(100),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  businessName: z.string().max(255).optional(),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
```

### Step 2 — Auth helper function

After a successful login or register, store the token and navigate:

```ts
// src/lib/auth.ts
import Cookies from 'js-cookie'
import { useAuthStore } from '@/store/authStore'
import { AuthResponse } from '@/lib/types'
import { useRouter } from 'next/router'

export function useAuthActions() {
  const setAuth = useAuthStore(s => s.setAuth)
  const router = useRouter()

  const handleAuthSuccess = (data: AuthResponse) => {
    // Store token in cookie (7-day expiry)
    Cookies.set('planit_token', data.token, { expires: 7, secure: true, sameSite: 'strict' })

    // Store user in Zustand (persists to localStorage)
    setAuth(data.token, {
      id: data.userId,
      email: data.email,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
    })

    // Redirect based on role
    const redirect = router.query.redirect as string
    router.push(redirect || '/dashboard')
  }

  const logout = () => {
    Cookies.remove('planit_token')
    useAuthStore.getState().logout()
    router.push('/')
  }

  return { handleAuthSuccess, logout }
}
```

**Why both cookie and Zustand?**
- Cookie: the axios interceptor reads it to attach `Authorization` headers
- Zustand + localStorage: fast access to user info (name, role) without parsing JWT

### Step 3 — LoginForm

```tsx
// src/components/auth/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { loginSchema, LoginValues } from '@/lib/validations'
import { useAuthActions } from '@/lib/auth'
import FormField from '@/components/ui/FormField'
import PasswordInput from '@/components/ui/PasswordInput'

export default function LoginForm() {
  const { handleAuthSuccess } = useAuthActions()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema)
  })

  const mutation = useMutation({
    mutationFn: (data: LoginValues) =>
      api.post('/auth/login', data).then(r => r.data.data),
    onSuccess: handleAuthSuccess,
  })

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-4">
      <FormField label="Email" error={errors.email?.message}>
        <input
          type="email"
          {...register('email')}
          className="input-base"
          placeholder="you@example.com"
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message}>
        <PasswordInput {...register('password')} />
      </FormField>

      {mutation.isError && (
        <p className="text-red-600 text-sm text-center">
          Invalid email or password
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="bg-primary hover:bg-primary-hover text-white font-semibold
          py-3 rounded-btn transition-colors disabled:opacity-60"
      >
        {mutation.isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

### Step 4 — RegisterForm with role toggle

```tsx
// State for selected role
const [role, setRole] = useState<'CLIENT' | 'PLANNER'>('CLIENT')

// In JSX — role toggle tabs:
<div className="flex rounded-btn overflow-hidden border border-cream mb-6">
  {(['CLIENT', 'PLANNER'] as const).map(r => (
    <button
      key={r}
      type="button"
      onClick={() => setRole(r)}
      className={cn(
        'flex-1 py-2.5 text-sm font-semibold transition-colors',
        role === r ? 'bg-primary text-white' : 'bg-white text-stone-warm hover:bg-sand'
      )}
    >
      {r === 'CLIENT' ? "I'm a Client" : "I'm a Planner"}
    </button>
  ))}
</div>

// Submit to different endpoints based on role:
const endpoint = role === 'CLIENT' ? '/auth/register/client' : '/auth/register/planner'
```

### Step 5 — Page files

```tsx
// src/pages/auth/login.tsx
import AuthShell from '@/components/auth/AuthShell'
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back">
      <LoginForm />
      <p className="text-center text-sm text-stone-warm mt-6">
        Don't have an account?{' '}
        <Link href="/auth/register" className="text-primary font-medium hover:underline">
          Register here
        </Link>
      </p>
    </AuthShell>
  )
}

// src/pages/auth/register.tsx — similar, uses RegisterForm
```

### Step 6 — Redirect if already logged in

```tsx
// At the top of login/register pages:
const router = useRouter()
const token = useAuthStore(s => s.token)

useEffect(() => {
  if (token) router.replace('/dashboard')
}, [token, router])
```

### Step 7 — Email verification notice

After register, the API sends a verification email.
Show a success state: "Check your email to verify your account."

```tsx
const [registered, setRegistered] = useState(false)

// In mutation onSuccess:
onSuccess: () => setRegistered(true)

// In JSX:
if (registered) return (
  <div className="text-center">
    <div className="text-4xl mb-4">📬</div>
    <h2 className="text-xl font-semibold">Check your inbox</h2>
    <p className="text-stone-warm mt-2">
      We sent a verification link to your email. Click it to activate your account.
    </p>
  </div>
)
```

---

## Done Checklist

- [ ] `src/lib/validations.ts` with loginSchema and registerSchema
- [ ] `src/lib/auth.ts` with useAuthActions hook
- [ ] `src/store/authStore.ts` with token + user state
- [ ] `LoginForm` with React Hook Form + Zod + mutation
- [ ] `RegisterForm` with CLIENT/PLANNER role toggle
- [ ] `PasswordInput` with show/hide toggle button
- [ ] `FormField` with label and inline error message
- [ ] `AuthShell` layout wrapper (centred, no navbar)
- [ ] `src/pages/auth/login.tsx` page
- [ ] `src/pages/auth/register.tsx` page
- [ ] Successful auth stores token in cookie + Zustand
- [ ] Redirect to dashboard on success
- [ ] Already-logged-in users redirected away from auth pages
- [ ] Email verification success state shown after register
- [ ] Error message displayed on wrong credentials
- [ ] Update status in `FRONTEND_PLAN.md`