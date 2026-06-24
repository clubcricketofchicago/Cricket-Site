// Server-side: rich home-page data for Club Cricket of Chicago's current season
// (Summer 2026 divisions), aggregated from the DB. Powers the home "season hub":
// stat highlights, top performers, and a division standings snapshot.

import { unstable_cache } from "next/cache";
import { prisma } from "../db/prisma";
import { TRACKED_SERIES } from "../cricclubs/config";

const IMG = "https://media.cricclubs.com";
const img = (p?: string | null) =>
  p ? `${IMG}${p.startsWith("/") ? p : `/${p}`}` : "";
const fullName = (f?: string | null, l?: string | null) =>
  [f, l].filter(Boolean).join(" ");
const CCC_NAME = "Club Cricket of Chicago";

const SEASON = "Summer 2026";
const SEASON_SERIES = TRACKED_SERIES.filter((s) => s.year === "2026");
const SEASON_IDS = SEASON_SERIES.map((s) => s.id);

export interface Performer {
  name: string;
  pic: string;
  value: number;
  team: string;
}
export interface DivisionSnapshot {
  name: string;
  slug: string;
  year: string;
  teams: number;
  position: number | null;
  played: number;
  won: number;
  lost: number;
  points: number;
}
export interface HomeData {
  season: string;
  stats: { matches: number; runs: number; wickets: number; sixes: number };
  topBatsmen: Performer[];
  topBowlers: Performer[];
  divisions: DivisionSnapshot[];
}

async function buildHomeData(): Promise<HomeData> {
  const [battingRows, bowlingRows, standings] = await Promise.all([
    prisma.playerBattingStat.findMany({
      where: { seriesId: { in: SEASON_IDS }, teamName: CCC_NAME },
    }),
    prisma.playerBowlingStat.findMany({
      where: { seriesId: { in: SEASON_IDS }, teamName: CCC_NAME },
    }),
    prisma.standing.findMany({
      where: { seriesId: { in: SEASON_IDS } },
      orderBy: [{ points: "desc" }, { netRunRate: "desc" }],
    }),
  ]);

  // Aggregate per player across the season's divisions.
  const batAgg = new Map<number, Performer & { sixes: number }>();
  for (const b of battingRows) {
    const e =
      batAgg.get(b.playerId) ??
      { name: fullName(b.firstName, b.lastName), pic: img(b.profilePic), value: 0, sixes: 0, team: CCC_NAME };
    e.value += b.runs;
    e.sixes += b.sixes;
    if (!e.pic) e.pic = img(b.profilePic);
    batAgg.set(b.playerId, e);
  }
  const bowlAgg = new Map<number, Performer>();
  for (const b of bowlingRows) {
    const e =
      bowlAgg.get(b.playerId) ??
      { name: fullName(b.firstName, b.lastName), pic: img(b.profilePic), value: 0, team: CCC_NAME };
    e.value += b.wickets;
    if (!e.pic) e.pic = img(b.profilePic);
    bowlAgg.set(b.playerId, e);
  }

  const topBatsmen = [...batAgg.values()]
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(({ name, pic, value, team }) => ({ name, pic, value, team }));
  const topBowlers = [...bowlAgg.values()]
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const runs = [...batAgg.values()].reduce((s, e) => s + e.value, 0);
  const sixes = [...batAgg.values()].reduce((s, e) => s + e.sixes, 0);
  const wickets = [...bowlAgg.values()].reduce((s, e) => s + e.value, 0);
  const matches = standings
    .filter((s) => s.teamName === CCC_NAME)
    .reduce((s, r) => s + r.matches, 0);

  const divisions: DivisionSnapshot[] = SEASON_SERIES.map((s) => {
    const table = standings.filter((r) => r.seriesId === s.id); // points-desc order preserved
    const idx = table.findIndex((r) => r.teamName === CCC_NAME);
    const row = idx >= 0 ? table[idx] : null;
    return {
      name: s.name,
      slug: String(s.id),
      year: s.year,
      teams: table.length,
      position: idx >= 0 ? idx + 1 : null,
      played: row?.matches ?? 0,
      won: row?.won ?? 0,
      lost: row?.lost ?? 0,
      points: row?.points ?? 0,
    };
  });

  return {
    season: SEASON,
    stats: { matches, runs, wickets, sixes },
    topBatsmen,
    topBowlers,
    divisions,
  };
}

export const getHomeData = unstable_cache(buildHomeData, ["home-data"], {
  revalidate: 120,
  tags: ["cricclubs"],
});
