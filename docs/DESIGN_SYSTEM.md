# Planit Design System

> The visual language of the app. Follow this in every component.
> Earth tones, warm, premium, Airbnb-inspired.

---

## Colour Palette

| Name | Hex | Tailwind Class | Use |
|---|---|---|---|
| Terracotta | `#C1694F` | `primary` | CTAs, active states, badges |
| Deep Olive | `#4A5240` | `accent` | Secondary buttons, tags, icons |
| Warm Sand | `#F5ECD7` | `sand` | Page backgrounds |
| Stone | `#8C7B6B` | `stone-warm` | Muted text, borders |
| Parchment | `#FAF7F2` | `parchment` | Card backgrounds |
| Charcoal | `#2C2C2C` | `charcoal` | Primary text |
| Cream | `#EDE0CB` | `cream` | Dividers, subtle backgrounds |
| White | `#FFFFFF` | `white` | Overlays, modals |
| Error | `#DC2626` | `red-600` | Validation errors |
| Success | `#16A34A` | `green-600` | Confirmations |

### Tailwind Config — add to `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C1694F',
          hover: '#A85640',
          light: '#E8A090',
        },
        accent: {
          DEFAULT: '#4A5240',
          hover: '#3A4132',
          light: '#7A8B70',
        },
        sand: {
          DEFAULT: '#F5ECD7',
          dark: '#EDE0CB',
        },
        parchment: '#FAF7F2',
        charcoal: '#2C2C2C',
        'stone-warm': '#8C7B6B',
        cream: '#EDE0CB',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(44,44,44,0.08)',
        'card-hover': '0 8px 32px rgba(44,44,44,0.14)',
        modal: '0 20px 60px rgba(44,44,44,0.2)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Typography

**Font:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
Weights used: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

Add to `_document.tsx`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

### Type Scale

| Name | Size | Weight | Tailwind |
|---|---|---|---|
| Display | 56px | 700 | `text-5xl font-bold` |
| Heading 1 | 40px | 700 | `text-4xl font-bold` |
| Heading 2 | 32px | 700 | `text-3xl font-bold` |
| Heading 3 | 24px | 600 | `text-2xl font-semibold` |
| Heading 4 | 20px | 600 | `text-xl font-semibold` |
| Body Large | 18px | 400 | `text-lg` |
| Body | 16px | 400 | `text-base` |
| Body Small | 14px | 400 | `text-sm` |
| Caption | 12px | 400 | `text-xs` |
| Label | 12px | 600 | `text-xs font-semibold` |

---

## Spacing

Stick to Tailwind's default scale. Key values:
- Section vertical padding: `py-16` (64px)
- Card padding: `p-6` (24px)
- Form field gap: `gap-4` (16px)
- Section heading margin bottom: `mb-8` (32px)

---

## Components

### Button

```tsx
// Primary — terracotta, filled
<button className="bg-primary hover:bg-primary-hover text-white font-semibold
  px-6 py-3 rounded-btn transition-colors duration-200">
  Book Now
</button>

// Secondary — outline
<button className="border-2 border-primary text-primary hover:bg-primary
  hover:text-white font-semibold px-6 py-3 rounded-btn transition-colors duration-200">
  Learn More
</button>

// Ghost — no border
<button className="text-primary hover:underline font-medium">
  View all
</button>

// Disabled state: add opacity-50 cursor-not-allowed
```

### Card

```tsx
<div className="bg-parchment rounded-card shadow-card hover:shadow-card-hover
  transition-shadow duration-300 overflow-hidden">
  {/* image */}
  <img className="w-full h-56 object-cover" />
  {/* content */}
  <div className="p-6">...</div>
</div>
```

### Input / Form Field

```tsx
<div className="flex flex-col gap-1.5">
  <label className="text-xs font-semibold text-charcoal uppercase tracking-wide">
    Location
  </label>
  <input
    className="border border-cream bg-white rounded-btn px-4 py-3 text-charcoal
      placeholder:text-stone-warm focus:outline-none focus:ring-2
      focus:ring-primary focus:border-transparent transition"
  />
  {/* error state: border-red-600 ring-red-600 */}
  <p className="text-xs text-red-600">Required</p>
</div>
```

### Badge / Tag

```tsx
// Event type tag
<span className="bg-accent/10 text-accent text-xs font-semibold
  px-3 py-1 rounded-full">
  Wedding
</span>

// Status badge
<span className="bg-primary/10 text-primary text-xs font-semibold
  px-3 py-1 rounded-full">
  ACCEPTED
</span>
```

### Star Rating

```tsx
// Display-only rating — render 5 stars, fill based on rating
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={i <= rating ? 'text-primary' : 'text-cream'}>
        ★
      </span>
    ))}
  </div>
)
```

### Skeleton Loader

```tsx
// Use while data is loading
<div className="animate-pulse bg-cream rounded-card h-64 w-full" />
```

### Modal / Overlay

```tsx
// Backdrop
<div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center">
  <div className="bg-white rounded-card shadow-modal p-8 w-full max-w-md mx-4">
    {/* content */}
  </div>
</div>
```

---

## Listing Card

The most-used component. Closely modelled on Airbnb's card.

```
┌──────────────────────────────┐
│  [Photo 3:2 ratio, hover zoom]│
│                              │
├──────────────────────────────┤
│ Wedding · Lisbon             │  ← event type tag · location
│ **Elegant Garden Ceremonies**│  ← title (2 lines max, truncate)
│ ★ 4.9 (124 reviews)          │  ← rating
│ From £1,500                  │  ← basePrice
└──────────────────────────────┘
```

Key CSS details:
- Image: `aspect-[3/2] overflow-hidden rounded-t-card`
- Image hover: `group-hover:scale-105 transition-transform duration-500`
- Title: `line-clamp-2`
- Wrap card in `<Link>` for full-card click

---

## Navbar

```
┌─────────────────────────────────────────────────────────┐
│  🌿 planit          [Search bar - desktop]    [Login] [Register] │
└─────────────────────────────────────────────────────────┘
```

- Sticky top, `bg-parchment/95 backdrop-blur-md border-b border-cream`
- Logo: wordmark "planit" in Deep Olive, bold
- Auth state: show user avatar + dropdown when logged in
- Mobile: hamburger menu

---

## Hero (Homepage)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Find the perfect planner                              │
│   for your perfect day.                                 │
│                                                         │
│  ┌──────────┬──────────┬──────────┬──────────────────┐  │
│  │ What?    │ Where?   │ When?    │  [Search]        │  │
│  └──────────┴──────────┴──────────┴──────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
  (full-bleed background: warm earthy photo or gradient)
```

---

## Page Background

- Default page bg: `bg-sand`
- Cards / form sections: `bg-parchment`
- Navbar: `bg-parchment/95`
- Hero: full bleed image or `bg-gradient-to-br from-accent to-primary`

---

## Responsive Breakpoints

Use Tailwind defaults:
- `sm`: 640px — tablet portrait
- `md`: 768px — tablet landscape
- `lg`: 1024px — small desktop
- `xl`: 1280px — standard desktop

Grid for listing cards:
- Mobile: 1 column
- sm: 2 columns
- lg: 3 columns
- xl: 4 columns

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

---

## Animation

Keep animations subtle and fast:
- Hover transitions: `duration-200` or `duration-300`
- Card image zoom on hover: `duration-500`
- Page transitions: none (keep it fast)
- Loading: `animate-pulse` for skeletons, `animate-spin` for spinners

---

## Icons

Use [Heroicons](https://heroicons.com/) — already compatible with Tailwind.

```bash
npm install @heroicons/react
```

```tsx
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
<MagnifyingGlassIcon className="w-5 h-5 text-stone-warm" />
```

---

## Accessibility

- All interactive elements must have `focus:ring-2 focus:ring-primary`
- Images must have `alt` text
- Forms must have `<label>` elements linked to inputs
- Colour contrast: all text on sand/parchment must pass AA (charcoal on sand: ratio 12:1 ✓)