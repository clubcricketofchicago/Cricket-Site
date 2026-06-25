'use client'

import Link from 'next/link'
import ChicagoSkyline from './ChicagoSkyline'
import ChicagoStar from './ChicagoStar'

// Revamp 2026 hero — "Blue Hour / Chicago Dusk".
// A designed dusk hero (not the old CMS photo panels): headline + a live
// "Next Match" scoreboard sourced from /api/schedule, over the Chicago skyline.

const CCC_FALLBACK_LOGO = '/images/logo.png'

function pickNextMatch(fixtures) {
  if (!Array.isArray(fixtures) || fixtures.length === 0) return null
  // /api/schedule already returns CCC upcoming fixtures ordered by date asc.
  const now = Date.now()
  const upcoming = fixtures
    .filter((f) => f && f.date)
    .filter((f) => {
      const t = new Date(f.date).getTime()
      return !isNaN(t) && t >= now - 1000 * 60 * 60 * 6 // keep a match in-progress today
    })
  // Only a genuine upcoming fixture — never fall back to fixtures[0], or a stale past
  // fixture would masquerade as "Next match". The card shows its own "fixtures are
  // coming" empty state when this is null.
  return upcoming[0] ?? null
}

// Format the stored calendar date in UTC to avoid the known off-by-one shift.
function formatMatch(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const h = d.getUTCHours()
  const m = d.getUTCMinutes()
  const hasTime = !(h === 0 && m === 0)
  const time = hasTime
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
    : null
  return { weekday, date, time }
}

function Crest({ src, alt }) {
  return (
    <span className="ccc-crest">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || CCC_FALLBACK_LOGO}
        alt={alt || 'Team crest'}
        loading="eager"
        onError={(e) => { e.currentTarget.src = CCC_FALLBACK_LOGO }}
      />
    </span>
  )
}

function NextMatchCard({ match }) {
  const fmt = match ? formatMatch(match.date) : null
  const cccIsT2 = !!match?.t1t2NativeFlag
  const cccLogo = match ? (cccIsT2 ? match.t2Logo?.[0]?.url : match.t1Logo?.[0]?.url) : null
  const oppLogo = match ? (cccIsT2 ? match.t1Logo?.[0]?.url : match.t2Logo?.[0]?.url) : null
  const oppName = match ? (cccIsT2 ? match.t1Name : match.t2Name) : null
  const ground = match?.groundsName

  if (!match) {
    // No upcoming fixture yet — keep the slot useful, not empty.
    return (
      <div className="ccc-scorecard p-[6vw] lg:p-[1.9vw]">
        <p className="ds-eyebrow ds-eyebrow--orange">This season</p>
        <p className="ds-display text-[8vw] lg:text-[2.1vw] mt-[3vw] lg:mt-[0.8vw] leading-none">
          The fixtures are coming
        </p>
        <p className="text-muted p5 mt-[3vw] lg:mt-[0.7vw]">
          Schedule, results and standings update here through the season.
        </p>
        <Link href="/schedule" className="ccc-btn ccc-btn-ghost mt-[5vw] lg:mt-[1.4vw]">
          View schedule <span className="ccc-btn-arrow">→</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="ccc-scorecard p-[6vw] lg:p-[1.9vw]">
      <div className="flex items-center justify-between">
        <p className="ds-eyebrow ds-eyebrow--orange flex items-center gap-[1.5vw] lg:gap-[0.4vw]">
          <ChicagoStar size="0.8em" /> Next match
        </p>
        {fmt?.time && (
          <p className="ds-eyebrow text-dim">{fmt.time}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-[3vw] lg:gap-[1vw] mt-[5vw] lg:mt-[1.4vw]">
        <div className="flex flex-col items-center gap-[2vw] lg:gap-[0.55vw] w-[34%]">
          <div className="w-[17vw] h-[17vw] lg:w-[4.8vw] lg:h-[4.8vw]"><Crest src={cccLogo} alt="Club Cricket of Chicago" /></div>
          <p className="roboto-condensed-bold p6 text-center leading-tight">CCC</p>
        </div>

        <div className="flex flex-col items-center">
          <span className="ds-display accent text-[6vw] lg:text-[1.7vw] leading-none">VS</span>
        </div>

        <div className="flex flex-col items-center gap-[2vw] lg:gap-[0.55vw] w-[34%]">
          <div className="w-[17vw] h-[17vw] lg:w-[4.8vw] lg:h-[4.8vw]"><Crest src={oppLogo} alt={oppName} /></div>
          <p className="roboto-condensed-bold p6 text-center leading-tight line-clamp-2">{oppName || 'Opponent'}</p>
        </div>
      </div>

      <hr className="ccc-rule my-[4vw] lg:my-[1.2vw]" />

      <div className="flex items-center justify-between gap-2">
        <div>
          {fmt && (
            <p className="ds-num text-[5vw] lg:text-[1.45vw] leading-none">
              {fmt.weekday}, {fmt.date}
            </p>
          )}
          {ground && (
            <p className="text-muted p6 mt-[1.5vw] lg:mt-[0.4vw] truncate max-w-[42vw] lg:max-w-[14vw]">{ground}</p>
          )}
        </div>
        <Link href="/schedule" className="ccc-btn ccc-btn-ghost !px-[4vw] lg:!px-[1.1vw] !py-[2.4vw] lg:!py-[0.6vw] shrink-0">
          Schedule <span className="ccc-btn-arrow">→</span>
        </Link>
      </div>
    </div>
  )
}

export default function HeroBanner({ fixtures }) {
  const nextMatch = pickNextMatch(fixtures)

  return (
    <section className="ccc-hero">
      <div className="ccc-hero-glow" />

      <div className="ccc-hero-inner base_paddings max_content center_aligned w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-[10vw] lg:gap-[3.4vw] items-center min-h-[84vh] lg:min-h-[92vh] pt-[120px] pb-[46vw] lg:pt-[150px] lg:pb-[28vw]">
          {/* LEFT — the thesis */}
          <div>
            <p className="ds-eyebrow flex items-center gap-[2vw] lg:gap-[0.5vw]">
              <ChicagoStar size="0.85em" /> Midwest Cricket Conference · Chicago
            </p>

            <h1 className="ds-display mt-[4vw] lg:mt-[1.1vw] text-[15vw] lg:text-[5.6vw]">
              Cricket runs<br />through <span className="accent">Chicago</span>
            </h1>

            <p className="text-muted p3 mt-[4vw] lg:mt-[1.3vw] max-w-[50ch]">
              Club Cricket of Chicago competes across the Midwest Cricket Conference.
              Every match, every season — followed here.
            </p>

            <div className="flex flex-wrap gap-[3vw] lg:gap-[1vw] mt-[6vw] lg:mt-[1.8vw]">
              <Link href="/schedule" className="ccc-btn ccc-btn-primary">
                View fixtures <span className="ccc-btn-arrow">→</span>
              </Link>
              <Link href="/join-us" className="ccc-btn ccc-btn-ghost">
                Join the club
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-[3vw] lg:gap-[1vw] mt-[7vw] lg:mt-[2.2vw] ds-eyebrow text-dim">
              <span>Fixtures</span> <ChicagoStar size="0.6em" className="opacity-70" />
              <span>Results</span> <ChicagoStar size="0.6em" className="opacity-70" />
              <span>Standings</span> <ChicagoStar size="0.6em" className="opacity-70" />
              <span>Stats</span>
            </div>
          </div>

          {/* RIGHT — the live moment */}
          <div className="w-full">
            <NextMatchCard match={nextMatch} />
          </div>
        </div>
      </div>

      <ChicagoSkyline />
    </section>
  )
}
