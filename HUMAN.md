# HUMAN.md — Cricket-Site (plain-English guide)

A friendly explanation of what this project is, how it works, and where its
information comes from. No deep coding knowledge required.

## In one sentence

This is the **public website for Club Cricket of Chicago (CCC)** — the kind of site
a fan or a would-be player visits to learn about the club, see upcoming matches,
browse tournaments and standings, look up players, and sign up to join.

## What's on the site

- **Home page** — hero banners, a season countdown, featured fixtures, sponsors,
  and "meet the management."
- **Schedule** — an interactive calendar showing upcoming matches.
- **Tournaments** — organized by year; each tournament has standings, "player of
  the week," highlights, fixtures & results, and detailed stat tables (batting,
  bowling, fielding, rankings).
- **Players** — a roster of player cards (with a gold/silver/bronze tier look). Click
  a player to open a pop-up with their full batting and bowling statistics.
- **Grounds** — a gallery of the club's playing grounds with details and maps.
- **CCC Academy** — a page about the club's coaching/academy program.
- **Join Us** — a recruitment form for people who want to play for the club (it even
  asks for a "CricClub Player ID").

## Where does the data come from?

This is the key question, and the answer has **two parts**:

1. **Most of the website's content comes from a Content Management System (CMS).**
   The club's staff edit text, images, fixtures, tournament results, player
   profiles, sponsors, and navigation in a **Craft CMS** behind the scenes. The
   website then pulls that content in (via a technology called GraphQL) and displays
   it. So when you see the home page, the players list, tournament standings, the
   schedule — almost all of that is coming from the CMS, **not** from CricClubs.

2. **CricClubs is used only for one thing: detailed player stats.** CricClubs is a
   real cricket league platform that tracks scoring. On this site, the **only** time
   it's used is when you open a player's profile and click "Show Full Stats" — at
   that moment the site quietly asks CricClubs for that player's batting and bowling
   numbers and shows them in the pop-up. That's it. The schedule, the standings, the
   match results you see elsewhere on the site are **not** pulled live from
   CricClubs — they're entered in the CMS.

There is also a little bit of **static information baked into the site** (a couple
of JSON files): the management team bios and a grounds list. These look like older
fallback data — the live pages now get the equivalent from the CMS.

And there is **no database** of its own. The site doesn't store data; it fetches it
fresh from the CMS (and, for player stats, from CricClubs) each time a visitor loads
a page.

**So, to be precise:**
> The website's data is **mostly from the club's own Craft CMS**. **CricClubs is
> involved only for on-demand player batting/bowling stats** — it is not the source
> of the fixtures, standings, or general content.

## How the two compare to the sibling project

There's a separate project next door, **`../cricketoverlays`** (a Laravel app). That
one is the **live broadcast-graphics tool** — it draws scoreboards on top of match
video streams, and it gets *all* its data from CricClubs. This project (the website)
is different: it's mostly CMS-driven and only touches CricClubs for player stats.

The two projects belong to the same club and use the same CricClubs account, but
they **don't talk to each other** — they just happen to share that one upstream
service.

## What's solid vs. rough

This is an **active work-in-progress**, with a real, functioning site but a number
of rough edges worth knowing about:

- **The pages work** and pull live content from the CMS as described.
- **A footer "Schedule" link is broken** — it points to `/calendar`, but the real
  page is `/schedule`, so that particular link leads to a "not found" page.
- **There are two competing configuration files** (`next.config.js` and
  `next.config.ts`) with slightly different settings — the project should keep one.
- **A whole `src/` folder is unused leftover scaffolding** — it looks like part of
  the app but nothing actually loads it. The real code lives in the `app/` folder.
- **The contact-form email credentials are written directly into the code** (the
  Join Us form), which is a tidiness/security item to revisit.
- Some technical niceties (SEO/social-preview metadata, faster server-side data
  loading) aren't fully wired up yet, and there are a few stray leftover files and
  debug log lines.

None of these stop the site from working; they're the kind of cleanup items a
developer would tackle as the project matures.

## Tech, briefly

- Built with **Next.js** and **React** (modern web framework).
- Content comes from a **Craft CMS** over the internet; player stats come from
  **CricClubs** on demand. No database of its own.
- Styling uses **Tailwind CSS** plus a large custom stylesheet; carousels,
  animations, and a calendar are powered by common web libraries.

## Related project

See **`../cricketoverlays`** for the live broadcast-overlay tool described above —
the same club, a different job.
