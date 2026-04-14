/**
 * Production Home — Airbnb-style, Planit-branded
 *
 * AirbnbHeader  — Logo | Find Events/Planners tabs | pill search
 * Welcome strip — terracotta band with tagline + trust signals
 * Category rows — horizontal scrollable rows per event type (API-first, demo fallback)
 * Discover       — "Find events near you" tabbed city grid (mid-page)
 * AirbnbFooter  — Charcoal footer with link columns + bottom bar
 */

import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import AirbnbHeader from '@/components/home/AirbnbHeader'
import AirbnbFooter from '@/components/home/AirbnbFooter'
import CategoryRow from '@/components/home/CategoryRow'
import { demoCategories } from '@/lib/demoData'
import { api } from '@/lib/api'
import { EventListingResponse } from '@/lib/types'
import { cn } from '@/lib/utils'

// ─── Category icons ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  WEDDING:     '💒',
  BIRTHDAY:    '🎂',
  CORPORATE:   '🏢',
  ANNIVERSARY: '💑',
  GRADUATION:  '🎓',
  BABY_SHOWER: '👶',
  ENGAGEMENT:  '💍',
}

// ─── "Find events near you" data ──────────────────────────────────────────

type DiscoverTab = { key: string; label: string }

const DISCOVER_TABS: DiscoverTab[] = [
  { key: 'WEDDING',     label: 'Weddings'      },
  { key: 'BIRTHDAY',    label: 'Birthdays'     },
  { key: 'CORPORATE',   label: 'Corporate'     },
  { key: 'ANNIVERSARY', label: 'Anniversaries' },
  { key: 'GRADUATION',  label: 'Graduations'   },
  { key: 'BABY_SHOWER', label: 'Baby Showers'  },
  { key: 'ENGAGEMENT',  label: 'Engagements'   },
]

type DiscoverItem = { city: string; label: string }

const DISCOVER_DATA: Record<string, DiscoverItem[]> = {
  WEDDING: [
    { city: 'London',       label: 'Wedding venue specialists'  },
    { city: 'Surrey',       label: 'Garden ceremony planners'   },
    { city: 'Cotswolds',    label: 'Rustic barn weddings'       },
    { city: 'Edinburgh',    label: 'Scottish castle weddings'   },
    { city: 'Bath',         label: 'Heritage venue planners'    },
    { city: 'Cornwall',     label: 'Seaside ceremony planners'  },
    { city: 'Manchester',   label: 'City wedding planners'      },
    { city: 'Kent',         label: 'Vineyard wedding planners'  },
    { city: 'Birmingham',   label: 'Luxury wedding specialists' },
    { city: 'Bristol',      label: 'Destination weddings'       },
    { city: 'Lake District', label: 'Countryside ceremonies'    },
    { city: 'Oxford',       label: 'Intimate wedding planners'  },
  ],
  BIRTHDAY: [
    { city: 'London',       label: 'Rooftop birthday planners'   },
    { city: 'Birmingham',   label: 'VIP party specialists'        },
    { city: 'Manchester',   label: 'Garden party planners'        },
    { city: 'Edinburgh',    label: 'Milestone birthday events'    },
    { city: 'Bristol',      label: 'Themed party planners'        },
    { city: 'Leeds',        label: 'Pool party specialists'       },
    { city: 'Liverpool',    label: 'Surprise party planners'      },
    { city: 'Brighton',     label: 'Coastal birthday events'      },
    { city: 'Oxford',       label: 'Dinner party planners'        },
    { city: 'Glasgow',      label: 'Luxury birthday events'       },
    { city: 'Cardiff',      label: 'Birthday event planners'      },
    { city: 'Sheffield',    label: 'Party specialists'            },
  ],
  CORPORATE: [
    { city: 'London',       label: 'Gala dinner planners'         },
    { city: 'Manchester',   label: 'Corporate event specialists'  },
    { city: 'Birmingham',   label: 'Product launch planners'      },
    { city: 'Edinburgh',    label: 'Awards ceremony planners'     },
    { city: 'Bristol',      label: 'Team building specialists'    },
    { city: 'Leeds',        label: 'Conference planners'          },
    { city: 'Glasgow',      label: 'Client entertainment experts' },
    { city: 'Cambridge',    label: 'Corporate dinner planners'    },
    { city: 'Oxford',       label: 'Executive retreat planners'   },
    { city: 'Lake District', label: 'Offsite retreat specialists' },
    { city: 'Bath',         label: 'Luxury corporate events'      },
    { city: 'Liverpool',    label: 'Networking event planners'    },
  ],
  ANNIVERSARY: [
    { city: 'London',       label: 'Anniversary dinner planners'    },
    { city: 'Bath',         label: 'Romantic celebration planners'  },
    { city: 'Cornwall',     label: 'Coastal anniversary events'     },
    { city: 'Surrey',       label: 'Garden anniversary parties'     },
    { city: 'Edinburgh',    label: 'Scottish anniversary events'    },
    { city: 'Cotswolds',    label: 'Country anniversary specialists'},
    { city: 'Brighton',     label: 'Seaside anniversary planners'   },
    { city: 'Oxford',       label: 'Intimate celebration planners'  },
    { city: 'Manchester',   label: 'Luxury anniversary events'      },
    { city: 'Bristol',      label: 'Private dining specialists'     },
    { city: 'Yorkshire',    label: 'Anniversary weekend planners'   },
    { city: 'Cambridge',    label: 'Silver & golden jubilees'       },
  ],
  GRADUATION: [
    { city: 'Oxford',       label: 'Graduation party specialists'     },
    { city: 'Cambridge',    label: 'Class celebration planners'       },
    { city: 'London',       label: 'Rooftop graduation events'        },
    { city: 'Edinburgh',    label: 'Graduate celebration specialists' },
    { city: 'Bristol',      label: 'Family brunch event planners'     },
    { city: 'Manchester',   label: 'Graduation dinner planners'       },
    { city: 'Leeds',        label: 'University celebration events'    },
    { city: 'Birmingham',   label: 'Graduation party planners'        },
    { city: 'Glasgow',      label: 'Scottish grad party specialists'  },
    { city: 'Cardiff',      label: 'Graduation event planners'        },
    { city: 'Nottingham',   label: 'Campus celebration planners'      },
    { city: 'Sheffield',    label: 'Milestone celebration events'     },
  ],
  BABY_SHOWER: [
    { city: 'London',       label: 'Afternoon tea shower planners'  },
    { city: 'Surrey',       label: 'Garden baby shower specialists' },
    { city: 'Manchester',   label: 'Baby shower event planners'     },
    { city: 'Edinburgh',    label: 'Themed shower specialists'      },
    { city: 'Cotswolds',    label: 'Country house shower planners'  },
    { city: 'Birmingham',   label: 'Luxury baby shower events'      },
    { city: 'Bristol',      label: 'Pastel theme party planners'    },
    { city: 'Leeds',        label: 'Gender reveal specialists'      },
    { city: 'Oxford',       label: 'Intimate shower planners'       },
    { city: 'Brighton',     label: 'Coastal baby shower events'     },
    { city: 'Bath',         label: 'Heritage venue shower planners' },
    { city: 'Liverpool',    label: 'Baby shower specialists'        },
  ],
  ENGAGEMENT: [
    { city: 'London',       label: 'Rooftop proposal dinner planners' },
    { city: 'Bath',         label: 'Engagement party specialists'     },
    { city: 'Brighton',     label: 'Private yacht celebration experts'},
    { city: 'Cotswolds',    label: 'Country engagement planners'      },
    { city: 'Edinburgh',    label: 'Surprise engagement specialists'  },
    { city: 'Cornwall',     label: 'Seaside engagement planners'      },
    { city: 'Surrey',       label: 'Garden engagement party planners' },
    { city: 'Manchester',   label: 'City engagement event planners'   },
    { city: 'Oxford',       label: 'Intimate engagement specialists'  },
    { city: 'Yorkshire',    label: 'Rural engagement event planners'  },
    { city: 'Glasgow',      label: 'Scottish engagement specialists'  },
    { city: 'Cambridge',    label: 'Proposal event planners'          },
  ],
}

const INITIAL_SHOW = 8

// Demo fallback — all listings flattened
const ALL_DEMO_LISTINGS = demoCategories.flatMap(d => d.listings)

// ─── Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [discoverTab, setDiscoverTab] = useState('WEDDING')
  const [expanded,    setExpanded]    = useState(false)

  // Fetch all published listings — demo-first pattern (public page)
  const { data: apiListings = ALL_DEMO_LISTINGS } = useQuery<EventListingResponse[]>({
    queryKey: ['listings-home'],
    queryFn: () =>
      api.get<{ data: { content: EventListingResponse[] } }>('/listings', { params: { page: 0, size: 60 } })
         .then(r => r.data.data?.content ?? []),
    placeholderData: ALL_DEMO_LISTINGS,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  // Per-category merge: use API listings if any exist for that type, otherwise demo
  const categories = demoCategories.map(cat => {
    const real = apiListings.filter(l => l.eventType.name === cat.eventTypeName)
    return { ...cat, listings: real.length > 0 ? real : cat.listings }
  })

  const discoverItems = DISCOVER_DATA[discoverTab] ?? []
  const visibleItems  = expanded ? discoverItems : discoverItems.slice(0, INITIAL_SHOW)

  return (
    <>
      <Head>
        <title>Planit — Find Your Perfect Event Planner</title>
        <meta
          name="description"
          content="Browse curated events from verified planners — weddings, birthdays, corporate gatherings and more. Book with confidence."
        />
      </Head>

      {/* ── AirbnbHeader ────────────────────────────────────────────────── */}
      <AirbnbHeader />

      {/* ── Welcome strip — Planit-exclusive warm band ───────────────────
          Compact terracotta strip with brand promise + trust signals.
      ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white font-semibold text-sm text-center sm:text-left">
            The marketplace for verified event planners
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {[
              { icon: '✅', text: 'Verified planners' },
              { icon: '🔒', text: 'Payments in escrow' },
              { icon: '💬', text: 'Free to message' },
              { icon: '🛡️', text: 'Dispute protection' },
            ].map(t => (
              <span key={t.text} className="flex items-center gap-1 text-white/85 text-xs font-medium">
                {t.icon} {t.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category rows ────────────────────────────────────────────────── */}
      <main className="bg-sand">
        {categories.map((category, idx) => (
          <div
            key={category.eventTypeName}
            className={idx % 2 === 0 ? 'bg-sand' : 'bg-parchment'}
          >
            <div className="max-w-7xl mx-auto px-6 py-10">
              {/* Primary accent bar + emoji — Planit's visual signature */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full bg-primary flex-shrink-0" aria-hidden />
                <span className="text-base">{CATEGORY_ICONS[category.eventTypeName]}</span>
              </div>
              <CategoryRow
                title={`Popular ${category.displayName} events`}
                seeAllHref={`/listings?eventTypeId=${category.eventTypeName}`}
                listings={category.listings}
              />
            </div>
          </div>
        ))}
      </main>

      {/* ── Discover: "Find events near you" ─────────────────────────────
          Future: auto-filter by user geolocation.
      ─────────────────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-cream border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Heading */}
          <div className="mb-6">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
              Explore by location
            </p>
            <h2 className="text-2xl font-bold text-charcoal">
              Find events near you
            </h2>
            <p className="text-stone-warm text-sm mt-1">
              Discover verified planners in your city, ready to make your occasion unforgettable.
            </p>
          </div>

          {/* Tab strip */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-cream mb-6">
            {DISCOVER_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => { setDiscoverTab(t.key); setExpanded(false) }}
                className={cn(
                  'pb-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 flex-shrink-0 transition-colors',
                  discoverTab === t.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-stone-warm hover:text-charcoal',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* City grid — 4 cols */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
            {visibleItems.map((item, i) => (
              <Link
                key={i}
                href={`/listings?location=${encodeURIComponent(item.city)}&eventTypeId=${discoverTab}`}
                className="group"
              >
                <p className="text-sm font-semibold text-charcoal group-hover:text-primary transition-colors leading-snug">
                  {item.city}
                </p>
                <p className="text-xs text-stone-warm mt-0.5 leading-snug">{item.label}</p>
              </Link>
            ))}
          </div>

          {/* Show more / less */}
          {discoverItems.length > INITIAL_SHOW && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-6 text-sm font-semibold text-charcoal underline underline-offset-2 hover:text-primary transition-colors"
            >
              {expanded ? 'Show less ∧' : 'Show more ∨'}
            </button>
          )}
        </div>
      </section>

      {/* ── AirbnbFooter ────────────────────────────────────────────────── */}
      <AirbnbFooter />
    </>
  )
}
