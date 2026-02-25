# Next.js Concepts — Learn as We Build

> This doc explains Next.js concepts in the order we encounter them.
> Each concept is tied to the actual page or feature where it first appears.
> Read the relevant section when you reach that part of the build.

---

## 1. Pages and File-Based Routing
*First used in: every page*

In Next.js, **every file inside `src/pages/` automatically becomes a URL route**.
You don't configure routes manually like in plain React with React Router.

```
src/pages/index.tsx          →  /
src/pages/listings/index.tsx →  /listings
src/pages/listings/[id].tsx  →  /listings/1, /listings/42, /listings/999
src/pages/auth/login.tsx     →  /auth/login
```

### Dynamic routes
Square brackets mean that part of the URL is a variable:
```
src/pages/listings/[id].tsx
```
Inside that file, you access the variable with:
```ts
import { useRouter } from 'next/router'

const router = useRouter()
const { id } = router.query  // e.g. "42"
```

### Navigation between pages
Use Next.js `<Link>` — never plain `<a>` tags for internal links:
```tsx
import Link from 'next/link'

<Link href="/listings/42">View Listing</Link>
<Link href={{ pathname: '/listings/[id]', query: { id: 42 } }}>View</Link>
```
`<Link>` prefetches pages in the background → instant navigation.

### Programmatic navigation
```ts
import { useRouter } from 'next/router'
const router = useRouter()
router.push('/dashboard')
router.push(`/listings/${id}`)
```

---

## 2. `_app.tsx` — The Global Wrapper
*First used in: Foundation*

`_app.tsx` wraps every page. This is where you put things that every page needs:
- Global CSS import
- Providers (React Query, Zustand, etc.)
- Persistent layout (Navbar, Footer)

```tsx
// src/pages/_app.tsx
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from '@/components/layout/Navbar'
import '@/styles/globals.css'

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
```

`Component` is whatever page is currently being shown.
`pageProps` are the props that page needs (see SSR/SSG below).

---

## 3. `_document.tsx` — The HTML Shell
*First used in: Foundation (font loading)*

`_document.tsx` customises the HTML `<head>` and `<body>`.
You use it to add fonts, meta tags, and other `<head>` content that
applies to every page. You only need to touch this rarely.

```tsx
// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />       {/* your app renders here */}
        <NextScript /> {/* Next.js scripts */}
      </body>
    </Html>
  )
}
```

---

## 4. Two Ways to Fetch Data: CSR vs SSR
*First used in: Listing Detail page (SSR) and Discovery page (CSR)*

This is the most important concept in Next.js.

### CSR — Client-Side Rendering
The page loads first (empty or with skeleton), then JavaScript runs and fetches data.
Use this for: dashboards, protected pages, data that changes often.

```tsx
// Standard React pattern — you already know this
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings/my').then(r => r.data.data)
  })

  if (isLoading) return <div>Loading...</div>
  return <div>{data.map(b => <div key={b.id}>{b.status}</div>)}</div>
}
```

### SSR — Server-Side Rendering
The server fetches data and renders the full HTML before sending it to the browser.
The user sees a complete page immediately. Google can read the content.
Use this for: public pages that need SEO (listing detail, planner profile).

```tsx
// Export a special function called getServerSideProps
import type { GetServerSideProps } from 'next'

type Props = {
  listing: EventListingDetailResponse
}

export default function ListingDetailPage({ listing }: Props) {
  // listing is already populated — no loading state needed
  return <div>{listing.title}</div>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`)
  const json = await res.json()

  if (!json.success) {
    return { notFound: true }  // shows Next.js 404 page
  }

  return {
    props: {
      listing: json.data
    }
  }
}
```

**Key rule:** `getServerSideProps` runs on the server on every request.
The function is NEVER sent to the browser. You can put secrets here safely.

### SSG — Static Site Generation
Pre-renders pages at build time. Use for content that rarely changes.
We won't use this much — our listings change dynamically.

---

## 5. Environment Variables
*First used in: Foundation (API URL)*

Next.js has a specific rule:
- Variables starting with `NEXT_PUBLIC_` are available in the browser AND server
- Variables WITHOUT that prefix are server-only (hidden from browser)

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1  # visible everywhere
SECRET_KEY=abc123                                  # server only
```

Access them:
```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL  // works anywhere
const secret = process.env.SECRET_KEY            // works only in getServerSideProps / API routes
```

---

## 6. API Routes
*First used in: not critical for MVP, but good to know*

You can create backend endpoints inside Next.js at `src/pages/api/`.
These run on the server, not the browser. Useful for proxying requests or
keeping secrets out of the frontend.

```tsx
// src/pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Hello from the server' })
}
// Accessible at: http://localhost:3000/api/hello
```

We'll use an API route if we need to relay Stripe's client secret without
exposing it in the browser.

---

## 7. `next/image` — Optimised Images
*First used in: Listing cards, hero*

Always use Next.js `<Image>` instead of `<img>` for images you control.
It automatically resizes, compresses, and lazy-loads images.

```tsx
import Image from 'next/image'

// Known size (recommended)
<Image
  src={listing.coverImageUrl}
  alt={listing.title}
  width={400}
  height={267}
  className="rounded-t-card object-cover"
/>

// Fill parent container (use when size is unknown)
<div className="relative aspect-[3/2]">
  <Image
    src={listing.coverImageUrl}
    alt={listing.title}
    fill
    className="object-cover"
  />
</div>
```

If images come from an external domain (e.g. Cloudflare R2), add it to `next.config.ts`:
```ts
const config = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pub-xxxx.r2.dev' }
    ]
  }
}
```

---

## 8. Layouts and Shared UI
*First used in: Foundation (Navbar, Footer)*

You'll have pages that share the same layout (Navbar + Footer).
The cleanest pattern in Pages Router is a Layout component:

```tsx
// src/components/layout/PageShell.tsx
import Navbar from './Navbar'
import Footer from './Footer'

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

// Use it in any page:
export default function ListingsPage() {
  return (
    <PageShell>
      <div>Listings go here</div>
    </PageShell>
  )
}
```

---

## 9. Protected Routes — Redirecting Unauthenticated Users
*First used in: Dashboard pages*

In Pages Router, you protect routes in the page itself using `getServerSideProps`
or a client-side check in `useEffect`:

```tsx
// Client-side protection (simpler)
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const router = useRouter()
  const token = useAuthStore(s => s.token)

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login')
    }
  }, [token, router])

  if (!token) return null  // prevent flash of protected content
  return <div>Dashboard</div>
}
```

For a reusable pattern, create a `withAuth` higher-order component or
a `useRequireAuth` hook that encapsulates this logic.

---

## 10. TanStack React Query — Server State
*First used in: every data-fetching page*

React Query manages all your server data: loading states, caching, refetching.

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Fetching data
const { data, isLoading, isError } = useQuery({
  queryKey: ['listings', filters],   // cache key — changes when filters change
  queryFn: () => api.get('/listings', { params: filters }).then(r => r.data.data),
  staleTime: 1000 * 60 * 5,         // data is fresh for 5 minutes
})

// Mutating data (POST/PATCH/DELETE)
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: (bookingId: number) =>
    api.patch(`/bookings/my/${bookingId}/cancel`).then(r => r.data.data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] }) // refetch after mutation
  }
})

// Trigger a mutation
<button onClick={() => mutation.mutate(bookingId)}>Cancel Booking</button>
```

**Key rules:**
- `queryKey` must be unique and include all variables the query depends on
- Mutations call `invalidateQueries` to refresh stale data after changes
- Never store server data in `useState` — let React Query manage it

---

## 11. Zustand — Global Client State
*First used in: auth store*

Zustand is for state that multiple components need but isn't from the server.
The main use case here is auth state (token, current user).

```tsx
// src/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  token: string | null
  user: { id: number; email: string; role: string } | null
  setAuth: (token: string, user: AuthState['user']) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(                             // saves to localStorage automatically
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'planit-auth' }           // localStorage key
  )
)

// In any component:
const token = useAuthStore(s => s.token)
const user = useAuthStore(s => s.user)
const logout = useAuthStore(s => s.logout)
```

---

## 12. React Hook Form + Zod — Forms
*First used in: auth pages*

Never manage form state with `useState` for each field. Use React Hook Form.
Zod defines the shape and validation rules. They work together:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormValues) => {
    // data is fully typed and validated
    await api.post('/auth/login', data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>Login</button>
    </form>
  )
}
```