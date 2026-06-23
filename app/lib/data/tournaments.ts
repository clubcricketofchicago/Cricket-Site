// Server-side: read tournament data from the DB (Neon) and shape it EXACTLY like the
// CMS `tournamentPage_Entry` objects the existing tournament components consume, so the
// page renders identically while sourced from CricClubs. See REBUILD_PLAN §12.

import { prisma } from "../db/prisma";
import { TRACKED_SERIES } from "../cricclubs/config";

const TABLE_LIMIT = 25; // rows shown per Number Zone leaderboard
const IMG = "https://media.cricclubs.com";

const img = (p?: string | null) =>
  p ? `${IMG}${p.startsWith("/") ? p : `/${p}`}` : "";
const fullName = (f?: string | null, l?: string | null) =>
  [f, l].filter(Boolean).join(" ");
const oversFromBalls = (b?: number | null) => {
  const n = b ?? 0;
  return `${Math.floor(n / 6)}.${n % 6}`;
};

type Entry = Record<string, unknown>;

async function buildDetail(series: { id: number; name: string; year: string }) {
  const seriesId = series.id;

  const [
    standings,
    batting,
    bowling,
    fielding,
    matches,
    matchCount,
    battingAgg,
    rankBat,
    rankBowl,
    rankField,
  ] = await Promise.all([
    prisma.standing.findMany({
      where: { seriesId },
      orderBy: [{ points: "desc" }, { netRunRate: "desc" }],
    }),
    prisma.playerBattingStat.findMany({
      where: { seriesId },
      orderBy: { runs: "desc" },
      take: TABLE_LIMIT,
    }),
    prisma.playerBowlingStat.findMany({
      where: { seriesId },
      orderBy: { wickets: "desc" },
      take: TABLE_LIMIT,
    }),
    prisma.playerFieldingStat.findMany({
      where: { seriesId },
      orderBy: { total: "desc" },
      take: TABLE_LIMIT,
    }),
    prisma.match.findMany({
      where: { seriesId, isComplete: true },
      orderBy: [{ lastUpdated: "desc" }, { id: "desc" }],
      take: 20,
    }),
    prisma.match.count({ where: { seriesId } }),
    prisma.playerBattingStat.aggregate({
      where: { seriesId },
      _sum: { runs: true, sixes: true },
    }),
    prisma.playerBattingStat.findMany({
      where: { seriesId },
      select: { playerId: true, firstName: true, lastName: true, points: true },
    }),
    prisma.playerBowlingStat.findMany({
      where: { seriesId },
      select: { playerId: true, firstName: true, lastName: true, points: true },
    }),
    prisma.playerFieldingStat.findMany({
      where: { seriesId },
      select: { playerId: true, firstName: true, lastName: true, points: true },
    }),
  ]);

  // teamStandings -> [{ id, title, teamLogo:[{url}], wins, loses }]
  const teamStandings = standings.map((s) => ({
    id: s.teamId,
    title: s.teamName ?? "Team",
    teamLogo: [{ url: img(s.teamLogo) }],
    wins: s.won,
    loses: s.lost,
  }));

  // Player of the Week: top run-scorer + top wicket-taker
  const topBat = batting[0];
  const topBowl = [...bowling].sort((a, b) => b.wickets - a.wickets)[0];

  // leagueStats highlight cards -> [{ id, title, number }]
  const leagueStats = [
    { id: `${seriesId}-matches`, title: "Matches", number: matchCount },
    { id: `${seriesId}-teams`, title: "Teams", number: standings.length },
    { id: `${seriesId}-runs`, title: "Total Runs", number: battingAgg._sum.runs ?? 0 },
    { id: `${seriesId}-sixes`, title: "Sixes", number: battingAgg._sum.sixes ?? 0 },
  ];

  // topPlayers -> [{ id, playerName, image:[{url}], title, cardValue, playerPosition }]
  const topPlayers = batting.slice(0, 4).map((b) => ({
    id: b.playerId,
    playerName: fullName(b.firstName, b.lastName) || "Unknown Player",
    image: [{ url: img(b.profilePic) }],
    title: "Top Run Scorer",
    cardValue: b.runs,
    playerPosition: "Batsman",
  }));

  // resultCards -> ResultItem[]
  const resultCards = matches.map((m) => ({
    id: m.id,
    title: m.result ?? "",
    lightswitch: m.winner != null && m.winner === m.teamOneId,
    date: m.matchDate ?? "",
    t1Score: `${m.t1Total ?? 0}/${m.t1Wickets ?? 0}`,
    t1Overs: oversFromBalls(m.t1Balls),
    teamOneLogo: [{ url: img(m.teamOneLogo) }],
    t2Score: `${m.t2Total ?? 0}/${m.t2Wickets ?? 0}`,
    t2Overs: oversFromBalls(m.t2Balls),
    teamTwoLogo: [{ url: img(m.teamTwoLogo) }],
  }));

  // Number Zone — RAW row shape (NumberZone splits `player` and renames short codes)
  const battingNumberZone = batting.map((b) => ({
    player: fullName(b.firstName, b.lastName),
    mat: b.matches,
    ins: b.innings,
    bf: b.balls,
    runs: b.runs,
    fours: b.fours,
    sixes: b.sixes,
    fifties: b.fifties,
    hundreds: b.hundreds,
    no: b.notOuts,
    hs: b.highestScore ?? 0,
  }));
  const bowlingNumberZone = bowling.map((b) => ({
    player: fullName(b.firstName, b.lastName),
    mat: b.matches,
    ins: b.innings,
    balls: b.balls,
    runs: b.runs,
    wkts: b.wickets,
    pts: b.points ?? 0,
    cths: 0, // catches-by-bowler not stored on bowling stat; shown as 0 for now
    fourW: b.fourWickets,
    fiveW: b.fiveWickets,
    db: b.dotBalls,
  }));
  const fieldingNumberZone = fielding.map((f) => ({
    player: fullName(f.firstName, f.lastName),
    mat: f.matches,
    cths: f.catches,
    wc: f.wkCatches,
    dr: f.directRunOuts,
    idr: f.indirectRunOuts,
    stm: f.stumpings,
    to: f.total,
  }));

  // rankingZone — sum points across the three stat tables per player
  const rank = new Map<
    number,
    { name: string; batting: number; bowling: number; fielding: number }
  >();
  const bump = (
    r: { playerId: number; firstName: string | null; lastName: string | null; points: number | null },
    key: "batting" | "bowling" | "fielding"
  ) => {
    const e =
      rank.get(r.playerId) ??
      { name: fullName(r.firstName, r.lastName), batting: 0, bowling: 0, fielding: 0 };
    if (!e.name) e.name = fullName(r.firstName, r.lastName);
    e[key] += r.points ?? 0;
    rank.set(r.playerId, e);
  };
  rankBat.forEach((r) => bump(r, "batting"));
  rankBowl.forEach((r) => bump(r, "bowling"));
  rankField.forEach((r) => bump(r, "fielding"));
  const rankingZone = [...rank.values()]
    .map((e) => ({
      player: e.name,
      battingPoints: Math.round(e.batting),
      bowlingPoints: Math.round(e.bowling),
      fieldingPoints: Math.round(e.fielding),
      otherPoints: 0,
      total: Math.round(e.batting + e.bowling + e.fielding),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, TABLE_LIMIT);

  return {
    id: String(seriesId),
    typeHandle: "tournamentPage",
    title: series.name,
    slug: String(seriesId),
    parent: { id: series.year, title: series.year, slug: series.year, typeHandle: "tournamentYearPage" },
    flagImage: [],
    teamStandings,
    batsmanName: topBat ? fullName(topBat.firstName, topBat.lastName) : "-",
    batsmanImage: [{ url: img(topBat?.profilePic) }],
    batsmanLabel: "Runs",
    batsmanValue: topBat?.runs ?? 0,
    bowlerName: topBowl ? fullName(topBowl.firstName, topBowl.lastName) : "-",
    bowlerImage: [{ url: img(topBowl?.profilePic) }],
    bowlerCardLabel: "Wickets",
    bowlerValue: topBowl?.wickets ?? 0,
    leagueStats,
    topPlayers,
    teamBatting: [],
    teamBowling: [],
    resultCards,
    battingNumberZone,
    bowlingNumberZone,
    fieldingNumberZone,
    rankingZone,
  } satisfies Entry;
}

/** All tracked tournaments shaped like the CMS `entries` array (year pages + tournament pages). */
export async function getTournamentEntries(): Promise<{ entries: Entry[] }> {
  const details = await Promise.all(TRACKED_SERIES.map(buildDetail));

  const years = [...new Set(TRACKED_SERIES.map((s) => s.year))].sort().reverse();
  const yearPages: Entry[] = years.map((y) => ({
    id: y,
    typeHandle: "tournamentYearPage",
    title: y,
    slug: y,
  }));

  return { entries: [...yearPages, ...details] };
}

/** Upcoming fixtures for a series, shaped like the CMS fixture entries. */
export async function getFixtureEntries(slug: string): Promise<{ entries: Entry[] }> {
  const seriesId = Number(slug);
  if (!Number.isFinite(seriesId)) return { entries: [] };

  const fixtures = await prisma.fixture.findMany({
    where: { seriesId, matchId: 0 },
    orderBy: [{ matchDateTime: "asc" }, { id: "asc" }],
    take: 40,
  });

  const entries = fixtures.map((f) => ({
    id: String(f.id),
    title: `${f.teamOneName ?? ""} vs ${f.teamTwoName ?? ""}`.trim(),
    t1t2NativeFlag: null,
    groundsName: f.location ?? "",
    date: f.date ?? "",
    t1Name: f.teamOneName ?? "",
    t1Logo: [{ url: img(f.teamOneLogo), alt: f.teamOneName ?? "" }],
    t2Name: f.teamTwoName ?? "",
    t2Logo: [{ url: img(f.teamTwoLogo), alt: f.teamTwoName ?? "" }],
    mappedSeries: [{ id: String(seriesId), title: f.seriesName ?? "", slug }],
  }));

  return { entries };
}
