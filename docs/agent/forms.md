# Forms Guide

## Stack

All forms use **React Hook Form** (control, validation, submit state) + **Zod** (schema validation). Never use uncontrolled HTML forms or manual `useState` per field.

```bash
# Already installed
react-hook-form
@hookform/resolvers
zod
```

---

## Basic Form Pattern

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Define schema
const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

export default function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // 2. Submit handler
  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/my-endpoint', data)
      reset()
    } catch (err) {
      const message = (err as AxiosError<ApiResponse<null>>).response?.data?.message
        ?? 'Something went wrong'
      setError('root', { message })  // or setError('fieldName', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Field */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
        <input
          type="email"
          {...register('email')}
          className={`input-base py-2 text-sm w-full ${errors.email ? 'border-red-400' : ''}`}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Root / server error */}
      {errors.root && (
        <p className="text-red-500 text-sm text-center">{errors.root.message}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
```

---

## Common Zod Validators

```typescript
// Required string
z.string().min(1, 'Required')

// Email
z.string().email('Invalid email address')

// Password (matches backend requirements: uppercase + lowercase + number + special char)
z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character')

// Phone (optional)
z.string().optional().or(z.literal(''))

// Positive number
z.number({ invalid_type_error: 'Must be a number' }).positive('Must be positive')

// Number from string input (HTML inputs always return strings)
z.coerce.number().min(1, 'Must be at least 1')

// Enum
z.enum(['CLIENT', 'PLANNER'])

// Date (ISO string)
z.string().min(1, 'Date is required')

// Confirm password
const schema = z.object({
  password:        z.string().min(8),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
```

---

## Form + React Query Mutation

The typical pattern for forms that submit to the API:

```tsx
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: (data: FormData) =>
    api.post('/endpoint', data).then(r => r.data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['relevant-resource'] })
    reset()
    // optionally: router.push('/success-page')
  },
  onError: (err: AxiosError<ApiResponse<null>>) => {
    setError('root', {
      message: err.response?.data?.message ?? 'Something went wrong',
    })
  },
})

const onSubmit = (data: FormData) => mutation.mutate(data)
```

Use `mutation.isPending` (not `isSubmitting`) for the loading state when using mutations:
```tsx
disabled={mutation.isPending}
{mutation.isPending ? 'Saving…' : 'Save'}
```

---

## Select Fields

```tsx
<select
  {...register('eventTypeId', { valueAsNumber: true })}  // coerce to number
  className={`input-base py-2 pr-8 text-sm ${errors.eventTypeId ? 'border-red-400' : ''}`}
>
  <option value="">Select event type</option>
  {eventTypes.map(et => (
    <option key={et.id} value={et.id}>{et.displayName}</option>
  ))}
</select>
{errors.eventTypeId && (
  <p className="text-red-500 text-xs mt-1">{errors.eventTypeId.message}</p>
)}
```

---

## Textarea Fields

```tsx
<textarea
  {...register('description')}
  rows={4}
  className={`input-base py-2 text-sm resize-none ${errors.description ? 'border-red-400' : ''}`}
  placeholder="Describe your event…"
/>
```

---

## Checkbox / Toggle

```tsx
const { watch, setValue } = useForm(...)
const isAccepting = watch('isAcceptingInquiries')

<button
  type="button"
  role="switch"
  aria-checked={isAccepting}
  onClick={() => setValue('isAcceptingInquiries', !isAccepting)}
  className={`relative w-11 h-6 rounded-full transition-colors ${
    isAccepting ? 'bg-primary' : 'bg-stone-300'
  }`}
>
  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
    isAccepting ? 'translate-x-5' : 'translate-x-0'
  }`} />
</button>
```

---

## File Upload Fields

File inputs are uncontrolled — use `ref` and extract the file on submit:

```tsx
const fileRef = useRef<HTMLInputElement>(null)

// On submit:
const file = fileRef.current?.files?.[0]
if (file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  const { url } = res.data.data  // UploadResponse
}

// JSX:
<input
  ref={fileRef}
  type="file"
  accept="image/jpeg,image/png,image/webp"
  className="hidden"
  id="file-upload"
/>
<label
  htmlFor="file-upload"
  className="cursor-pointer btn-secondary px-4 py-2 text-sm inline-block"
>
  Choose image
</label>
```

---

## Pre-filling a Form (Edit Mode)

Use `reset(defaultValues)` inside a `useEffect` once data is loaded:

```tsx
const { data: listing } = useQuery(...)

useEffect(() => {
  if (listing) {
    reset({
      title:       listing.title,
      description: listing.description,
      basePrice:   listing.basePrice,
      location:    listing.location,
    })
  }
}, [listing, reset])
```

---

## Error Message Hierarchy

1. Field-level: `errors.fieldName.message` — shown below the specific input
2. Root-level: `errors.root.message` — shown at the bottom or top of the form for server errors
3. Never use `alert()` or browser native errors — always inline in the form UI
