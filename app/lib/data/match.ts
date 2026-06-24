// Server-side: a full match scorecard for the Match Centre. Pulls the live scorecard
// from CricClubs and pairs it with the DB match row (teams, result, date, series).

import { unstable_cache } from "next/cache";
import { prisma } from "../db/prisma";
import { getScoreCard } from "../cricclubs/endpoints";

const IMG = "https://media.cricclubs.com";
const img = (p?: string | null) =>
  p ? `${IMG}${p.startsWith("/") ? p : `/${p}`}` : "";
const fullName = (f?: unknown, l?: unknown) =>
  [f, l].filter((x) => typeof x === "string" && x).join(" ");
const num = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
};
const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const oversFromBalls = (b: number) => `${Math.floor(b / 6)}.${b % 6}`;

type Row = Record<string, unknown>;

function shapeInnings(inn: Row | undefined) {
  if (!inn) return null;
  const batting = Array.isArray(inn.batting) ? (inn.batting as Row[]) : [];
  const bowling = Array.isArray(inn.bowling) ? (inn.bowling as Row[]) : [];
  if (batting.length === 0 && num(inn.total) === 0) return null;

  return {
    teamName: str(inn.teamName) || "Team",
    total: num(inn.total),
    wickets: num(inn.wickets),
    overs: str(inn.overs),
    extras: num(inn.extras),
    runRate: str(inn.runRate),
    batting: batting.map((b) => {
      const runs = num(b.runsScored);
      const balls = num(b.ballsFaced);
      return {
        name: fullName(b.firstName, b.lastName),
        dismissal:
          str(b.outStringNoLink) || (str(b.isOut) === "1" ? "out" : "not out"),
        notOut: str(b.isOut) !== "1",
        runs,
        balls,
        fours: num(b.fours),
        sixes: num(b.sixers),
        sr: balls > 0 ? ((runs / balls) * 100).toFixed(1) : "0.0",
      };
    }),
    bowling: bowling.map((b) => {
      const balls = num(b.balls);
      const runs = num(b.runs);
      return {
        name: fullName(b.firstName, b.lastName),
        overs: str(b.overs) || oversFromBalls(balls),
        maidens: num(b.maidens),
        runs,
        wickets: num(b.wickets),
        econ: balls > 0 ? (runs / (balls / 6)).toFixed(1) : "0.0",
      };
    }),
  };
}

async function buildMatchCard(matchId: number) {
  const [sc, dbMatch] = await Promise.all([
    getScoreCard(matchId).catch(() => null),
    prisma.match.findUnique({ where: { id: matchId } }),
  ]);

  const innings = [sc?.innings1, sc?.innings2, sc?.innings3, sc?.innings4]
    .map((i) => shapeInnings(i as Row | undefined))
    .filter((i): i is NonNullable<typeof i> => i !== null);

  const teamOne =
    dbMatch?.teamOneName || innings[0]?.teamName || "Team 1";
  const teamTwo =
    dbMatch?.teamTwoName || innings[1]?.teamName || "Team 2";

  return {
    matchId,
    found: innings.length > 0 || !!dbMatch,
    teamOne,
    teamTwo,
    teamOneLogo: img(dbMatch?.teamOneLogo),
    teamTwoLogo: img(dbMatch?.teamTwoLogo),
    result: dbMatch?.result ?? "",
    date: dbMatch?.matchDate ?? "",
    seriesName: dbMatch?.seriesName ?? "",
    location: dbMatch?.location ?? "",
    innings,
  };
}

// Completed scorecards don't change, so cache aggressively (revalidated by sync tag).
export const getMatchCard = unstable_cache(buildMatchCard, ["match-card"], {
  revalidate: 600,
  tags: ["cricclubs"],
});
