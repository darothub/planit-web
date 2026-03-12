# Design System

## Tailwind v4 — How It Works Here

This project uses Tailwind v4 with CSS-based configuration. **There is no `tailwind.config.ts`.**

Custom tokens are defined in `src/styles/globals.css` using `@theme {}`:

```css
@theme {
  --color-primary:    #C1694F;   /* terracotta */
  --color-accent:     #4A5240;   /* deep olive */
  --color-charcoal:   #2C2C2C;   /* near-black text */
  --color-sand:       #F5ECD7;   /* warm sand background */
  --color-cream:      #EDE0C4;   /* borders, dividers */
  --color-parchment:  #FAF3E0;   /* subtle card backgrounds */
  --color-stone-warm: #8C7B6B;   /* muted text */

  --radius-card: 16px;
  --radius-btn:  8px;
}
```

Use these directly in className strings — they are valid Tailwind utility classes:
```
bg-primary        text-primary        border-primary
bg-charcoal       text-charcoal
bg-sand           text-sand
bg-cream          text-cream
bg-parchment
text-stone-warm
rounded-card      rounded-btn
```

---

## Colour Palette

| Token | Hex | Use |
|---|---|---|
| `primary` | `#C1694F` | CTAs, active states, terracotta accents |
| `accent` | `#4A5240` | Logo, secondary emphasis, deep olive |
| `charcoal` | `#2C2C2C` | Primary text, headings |
| `sand` | `#F5ECD7` | Page backgrounds, placeholder fills |
| `cream` | `#EDE0C4` | Borders, dividers, input outlines |
| `parchment` | `#FAF3E0` | Subtle card or section backgrounds |
| `stone-warm` | `#8C7B6B` | Secondary/muted text, labels |

---

## Custom Component Classes

Defined in `globals.css` using `@layer components`:

```
input-base      — standard input/select styling (border-cream, focus:ring-primary, rounded-btn)
btn-primary     — filled terracotta button (bg-primary, text-white, rounded-btn, hover:bg-primary/90)
btn-secondary   — outlined button (border-cream, text-charcoal, rounded-btn)
```

Usage:
```html
<input className="input-base py-2 text-sm" />
<button className="btn-primary px-6 py-2.5 text-sm font-semibold">Book Now</button>
```

---

## Card Pattern (Airbnb-style)

The `ListingCard` and `PlannerCard` follow this exact pattern — no card background around text:

```
┌─────────────────────┐
│                     │  ← Rounded image (aspect-ratio, rounded-card, overflow-hidden)
│      IMAGE          │     Image fills the box (object-cover)
│                     │     Hover: image scales (group-hover:scale-105)
└─────────────────────┘
Title                 ★ 4.8    ← Plain text, no card wrapper
Location · Event type
From £2,500
```

```tsx
<Link href={...} className="group block">
  {/* Image — the only rounded element */}
  <div className="relative aspect-[15/16] rounded-card overflow-hidden">
    <Image src={...} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
  </div>

  {/* Plain text below — no bg, no border, no padding box */}
  <div className="mt-2.5 px-0.5">
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-semibold text-charcoal text-sm line-clamp-1 flex-1">{title}</h3>
      <span className="text-xs text-charcoal font-medium">★ {rating}</span>
    </div>
    <p className="text-stone-warm text-xs mt-0.5">{location}</p>
    <p className="text-charcoal text-sm mt-0.5">From <span className="font-semibold">{price}</span></p>
  </div>
</Link>
```

---

## Layout Patterns

### PageShell
Every public page is wrapped in `<PageShell>` which renders `<Navbar /> + {children} + <Footer />`.

### Max-width containers
```
max-w-7xl mx-auto px-4    — standard full-width content (1280px)
max-w-5xl mx-auto px-4    — planner profile, narrower content
max-w-4xl mx-auto px-4    — forms, settings
max-w-2xl mx-auto px-4    — narrow / centered content
```

### Section spacing
```
mb-12     — between major page sections
mb-8      — between subsections
mb-6      — before a list/grid
gap-5     — card grid gap (listings, planners)
```

---

## Typography

Font: **Plus Jakarta Sans** (loaded via Google Fonts in `_document.tsx`)

```
text-3xl font-bold text-charcoal    — page headings (H1)
text-xl  font-semibold text-charcoal — section headings (H2)
text-sm  font-medium text-charcoal  — card titles, labels
text-xs  text-stone-warm            — secondary info (location, category)
text-sm  text-stone-warm            — body descriptions
```

---

## Form Inputs

Always use the `input-base` class as the foundation, then add size utilities:

```tsx
<input className="input-base py-2 text-sm w-full" />          /* text input */
<select className="input-base py-2 pr-8 text-sm min-w-[140px]" />  /* select */
<textarea className="input-base py-2 text-sm resize-none" />   /* textarea */
```

Error state:
```tsx
<input className="input-base py-2 text-sm border-red-400 focus:ring-red-400" />
<p className="text-red-500 text-xs mt-1">{error.message}</p>
```

---

## Buttons

```tsx
/* Primary CTA */
<button className="btn-primary px-6 py-2.5 text-sm font-semibold w-full">
  Book Now
</button>

/* Secondary / outlined */
<button className="btn-secondary px-4 py-2 text-sm font-medium">
  Cancel
</button>

/* Destructive */
<button className="bg-red-500 hover:bg-red-600 text-white rounded-btn px-4 py-2 text-sm font-medium transition-colors">
  Delete
</button>

/* Disabled state (always add) */
<button
  disabled={isPending}
  className="btn-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isPending ? 'Saving…' : 'Save'}
</button>
```

---

## Status Badges

```tsx
/* Booking / inquiry status */
const statusColour = {
  ACCEPTED:   'bg-green-100 text-green-800',
  REQUESTED:  'bg-amber-100 text-amber-800',
  COMPLETED:  'bg-blue-100 text-blue-800',
  CANCELLED:  'bg-stone-100 text-stone-600',
  DISPUTED:   'bg-red-100 text-red-800',
  REFUNDED:   'bg-purple-100 text-purple-800',
}

<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColour[status]}`}>
  {status}
</span>
```

---

## Image Placeholders

When a listing or planner has no image, use a gradient placeholder with an emoji:

```tsx
function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-sand via-cream to-parchment
      flex flex-col items-center justify-center gap-2 select-none">
      <span className="text-3xl opacity-30">🎪</span>
      <span className="text-stone-warm text-xs opacity-60 text-center px-2 leading-tight">{label}</span>
    </div>
  )
}
```

---

## Responsive Grid — Cards

```
grid-cols-2                    — mobile (2 columns)
sm:grid-cols-3                 — tablet (3 columns)
lg:grid-cols-4                 — desktop (4 columns)
xl:grid-cols-5                 — wide desktop (5 columns)
gap-5                          — consistent gap
```
