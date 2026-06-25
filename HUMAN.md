# HUMAN.md — Cricket-Site (plain-English guide)

A friendly explanation of what this project is, how it works, and where its
information comes from. No deep coding knowledge required.

## In one sentence

This is the **public website for Club Cricket of Chicago (CCC)** — the site a fan or a
would-be player visits to see upcoming matches, browse tournaments and standings, look up
players, and sign up to join. It's live at **www.clubcricketofchicago.com**.

## What's on the site

- **Home page** — hero, a season "hub" (top performers, division standings, recent
  results), a countdown, featured fixtures, sponsors, and "meet the management."
- **Schedule** — an interactive calendar of upcoming matches.
- **Tournaments** — organized by year; each has standings, a "top player" highlight,
  league stats, fixtures & results, and detailed stat tables (batting/bowling/fielding/
  rankings).
- **Players** — a roster of player cards; click "View Profile" for a player's full
  career stats.
- **Match pages, Grounds, CCC Academy, Join Us** — scorecards, a grounds gallery, the
  academy page, and a recruitment form.

The whole site has a **"Blue Hour / Chicago Dusk"** look with a **light and dark mode**
(toggle the sun/moon) and a Chicago-skyline signature.

## Where does the data come from?

There are **two sources**, and the split changed recently — this is the important part:

1. **Competitive cricket data comes from CricClubs, stored in the club's own database.**
   CricClubs is the league platform that tracks scores, fixtures, standings, and player
   stats. The site **syncs** that information into its own database (Neon Postgres) on a
   schedule, and the pages read from there. So the schedule, results, standings, player
   numbers, and tournament tables you see are **real CricClubs data**, kept fresh
   automatically. (This used to be typed into the CMS by hand — now it's pulled
   automatically from CricClubs.)

2. **Editorial content comes from a Content Management System (CMS).** The club's staff
   edit the marketing-style content — home-page banners, sponsors, "meet the management,"
   navigation, the grounds, and the academy page — in a **Craft CMS**, and the site
   displays it.

So, to be precise:
> **Cricket data (fixtures, results, standings, stats) = CricClubs → the club's database.
> Editorial content (banners, sponsors, nav, grounds, academy) = Craft CMS.**

There's also a tiny bit of static fallback data baked in (a management list, a grounds
list) that the live pages mostly get from the CMS instead.

## How the two compare to the sibling project

There's a separate project next door, **`../cricketoverlays`** (a Laravel app) — the
**live broadcast-graphics tool** that draws scoreboards on top of match video. Both belong
to the same club and use the same CricClubs account, but they **don't talk to each other**.

## Where it lives (hosting)

The website runs on **Vercel**, under the club's own account, connected to the club's
GitHub. Whenever a change is pushed, it redeploys automatically. The domain
`clubcricketofchicago.com` points at it. Everything — the code, the hosting, and the
domain — is under the club's control.

## What's solid vs. rough

This started as a work-in-progress and went through a big rebuild; it's now a real,
running production site:

- **It works** and serves live CricClubs data + CMS content.
- **The site is fully deployed** on the club's own accounts with the real domain.
- A handful of earlier rough edges were cleaned up (the broken footer link, duplicate
  config files, a stale lint setup, dead "show full stats" pop-up).
- **Still on the tidy-up list:** the contact-form email keys are written into the code,
  and the data sync needs a scheduled job set up to keep refreshing automatically (the
  data is correct now; this just keeps it current over the season).

## Tech, briefly

- Built with **Next.js** and **React**.
- **Cricket data** is synced from **CricClubs** into a **Postgres database** (Neon);
  **editorial content** comes from a **Craft CMS**.
- Styling uses **Tailwind CSS** plus a large custom stylesheet (the dusk/light theme);
  carousels, animations, and the calendar use common web libraries.

## Related project

See **`../cricketoverlays`** for the live broadcast-overlay tool — same club, different job.
