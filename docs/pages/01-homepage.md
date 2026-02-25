# Page 01 — Homepage (`/`)

> **Goal:** Visitors land directly on a rich listing discovery page — search at top, event
> categories as scrollable pills, then horizontal listing rows per category. No hero splash.
> Think Airbnb's homepage: content-first, minimal chrome, visually rich.

**Status:** ✅ Done

---

## Wireframe

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  NAVBAR  (white, sticky, z-50)                                                 │
│  [planit]                    [Browse Events]  [Sign in]  [Get started →]       │
├────────────────────────────────────────────────────────────────────────────────┤
│  SEARCH STRIP  (white, sticky below navbar, z-40)                              │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Event type ▾    │    Location...    │    Date    │          🔍          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  (pill-shaped, full border, internal dividers, search button = terracotta)     │
│                                                                                │
│  CATEGORY PILLS  (horizontal scroll, no scrollbar)                             │
│  ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ 💒       │ │ 🎂         │ │ 🏢           │ │ 💐          │ │ 🎓       │  │
│  │ Wedding  │ │ Birthday   │ │ Corporate    │ │ Anniversary │ │Graduation│  │
│  └──────────┘ └────────────┘ └──────────────┘ └─────────────┘ └──────────┘  │
│  ← click scrolls smoothly to that category's listing row                      │
├────────────────────────────────────────────────────────────────────────────────┤
│  PAGE CONTENT  (parchment background)                                          │
│                                                                                │
│  Popular Weddings                                          →   [  ←  ] [  →  ]│
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │  IMG   │ │  IMG   │ │  IMG   │ │  IMG   │ │  IMG   │ │  IMG   │  →      │
│  │ London │ │ Surrey │ │  Kent  │ │Cotswd. │ │  MCR   │ │Cornw.  │          │
│  │ Title… │ │ Title… │ │ Title… │ │ Title… │ │ Title… │ │ Title… │          │
│  │ ★ 4.9  │ │ ★ 5.0  │ │ ★ 4.8  │ │ ★ 4.7  │ │ ★ 4.6  │ │ ★ 4.9  │          │
│  │ Fr £X  │ │ Fr £X  │ │ Fr £X  │ │ Fr £X  │ │ Fr £X  │ │ Fr £X  │          │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘          │
│                                                                                │
│  Trending Birthday Parties                                 →   [  ←  ] [  →  ]│
│  ┌────────┐ ┌────────┐ ┌────────┐  ...                                        │
│                                                                                │
│  Top Corporate Events                                      →   [  ←  ] [  →  ]│
│  ...                                                                           │
│                                                                                │
│  [more rows — one per active event type]                                       │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│  HOW IT WORKS  (3-step, bottom of page)                                        │
│  ✨ Get inspired   💬 Connect & customise   🔒 Book securely                   │
├────────────────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                                        │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Key design principles

| Airbnb does this | Planit does this |
|---|---|
| White navbar + sticky search | White navbar + sticky search strip |
| Category icons row (Beachfront, Cabins…) | Category emoji pills (Wedding, Birthday…) |
| Horizontal scroll rows per collection | Horizontal scroll rows per event type |
| Content visible without any scrolling | Content visible without any scrolling |
| Clean white/light-grey background | Warm parchment (`#FAF7F2`) background |

---

## Components

| Component | Path | Role |
|---|---|---|
| `Navbar` | `components/layout/Navbar.tsx` | White, sticky, auth-aware |
| `SearchStrip` | `components/home/SearchStrip.tsx` | Sticky search + category pills |
| `CategoryRows` | `components/home/CategoryRows.tsx` | One row per event type |
| `CategoryRow` | `components/home/CategoryRow.tsx` | Single horizontal scroll row with arrows |
| `ListingCard` | `components/listings/ListingCard.tsx` | Photo-first card, used everywhere |
| `HowItWorks` | `components/home/HowItWorks.tsx` | Static 3-step section at bottom |

### Removed from homepage
- `HeroSearch` — replaced by compact `SearchStrip`
- `EventCategories` — replaced by category pills inside `SearchStrip`
- `FeaturedListings` — replaced by `CategoryRows`

---

## SearchStrip behaviour

```
sticky top-16 z-40          ← sits just below the navbar (h-16 = 64px)
white background + shadow   ← clear separation from content
```

**Search bar** (pill shape with internal dividers):
```
[ Event type ▾ | Location | Date | 🔍 ]
```
- Submit → navigate to `/listings?eventTypeId=X&location=Y&date=Z`
- Dropdown only shows real event types (not demo placeholders)

**Category pills**:
- Show immediately using demo data while API loads
- Click → smooth-scroll to `#row-{WEDDING}` (or whatever the event type name is)
- Active pill highlighted in terracotta

---

## CategoryRows data strategy

```
1. React Query `placeholderData` = demo listings (renders instantly, no spinner)
2. In background, fetch real listings per event type from API
3. When API returns > 0 results → silently swap demo → real
4. When API returns 0 → keep showing demo (always looks populated)
```

Each category row gets `id={row-${eventType.name}}` so the category pills can
smooth-scroll to the right section.

---

## Demo data

`src/lib/demoData.ts` contains 4–6 listings per category with real Unsplash photo
IDs. These are used as `placeholderData` and also as the final fallback if the API
returns empty results. Negative IDs (-1, -2…) prevent clashes with real DB rows.

---

## API calls

```ts
GET /event-types                             → category pills + row titles
GET /listings?eventTypeId=X&sortBy=RATING    → per-category listings (one call per row)
```

Both public (no auth). Fetched client-side with React Query. `staleTime: Infinity`
on event types (they almost never change).

---

## URL params

```
/listings?eventTypeId={id}&location={city}&date={YYYY-MM-DD}
```

---

## Step-by-step to reproduce from scratch

1. **Foundation** — all the shared files (`api.ts`, `types.ts`, `utils.ts`, `authStore.ts`,
   `_app.tsx`, `_document.tsx`, `globals.css`) — see `FRONTEND_PLAN.md §Foundation`

2. **`ListingCard`** — photo-first card: cover image (fill, aspect-[3/2]), event type badge,
   location, title, rating, base price. Export from `components/listings/ListingCard.tsx`.

3. **`demoData.ts`** — 7 categories × 4–6 listings with Unsplash image URLs and negative IDs.

4. **`CategoryRow`** — scrollable strip with left/right arrow buttons. Props: `title`,
   `seeAllHref`, `listings`. Arrows hidden on mobile, appear on desktop row hover.

5. **`CategoryRows`** — fetches event types; for each, renders `CategoryRowWithData` which
   fetches listings (placeholderData = demoListings for that type). Adds
   `<section id="row-{NAME}">` wrapper for scroll-to support.

6. **`SearchStrip`** — sticky pill search bar + category emoji pills. Pill click → smooth
   scroll to the row. Search submit → `/listings?...`.

7. **`Navbar`** — white bg, "Browse Events" link, auth buttons.

8. **`index.tsx`** — `<SearchStrip /> <CategoryRows /> <HowItWorks />`

---

## Done checklist

- [x] Foundation files complete
- [x] `ListingCard` built — image-only rounded card, plain text below (Airbnb style)
- [x] `demoData.ts` created (7 categories, Unsplash images, negative IDs)
- [x] `CategoryRow` with scroll arrows (appear on hover, desktop only)
- [x] `CategoryRows` with demo-first data strategy (placeholderData + default value fallback)
- [x] `SearchStrip` — sticky pill search bar + horizontally scrollable category pills
- [x] `Navbar` updated (white bg, "Browse Events")
- [x] `index.tsx` updated (SearchStrip + CategoryRows + HowItWorks, no hero)
- [x] Homepage looks great on mobile and desktop
- [x] Updated status in `FRONTEND_PLAN.md`
