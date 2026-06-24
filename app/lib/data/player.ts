// Server-side: a full player profile for Club Cricket of Chicago — bio + career stats
// pulled live from CricClubs, plus this season's stats from the DB.

import { unstable_cache } from "next/cache";
import { prisma } from "../db/prisma";
import { TRACKED_SERIES } from "../cricclubs/config";
import { getCareerStats, getUserDetails } from "../cricclubs/endpoints";

const IMG = "https://media.cricclubs.com";
const img = (p?: unknown) =>
  typeof p === "string" && p
    ? `${IMG}${p.startsWith("/") ? p : `/${p}`}`
    : "";
const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const num = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
};
const oversFromBalls = (b: number) => `${Math.floor(b / 6)}.${b % 6}`;
const SEASON_IDS = TRACKED_SERIES.filter((s) => s.year === "2026").map((s) => s.id);

async function buildPlayerProfile(playerId: number) {
  const [bioRaw, career, batting, bowling] = await Promise.all([
    getUserDetails(playerId).catch(() => null),
    getCareerStats(playerId).catch(() => null),
    prisma.playerBattingStat.findMany({
      where: { playerId, seriesId: { in: SEASON_IDS } },
    }),
    prisma.playerBowlingStat.findMany({
      where: { playerId, seriesId: { in: SEASON_IDS } },
    }),
  ]);

  // Season totals (count matches once per division)
  const matchesBySeries = new Map<number, number>();
  for (const b of batting)
    matchesBySeries.set(b.seriesId, Math.max(matchesBySeries.get(b.seriesId) ?? 0, b.matches));
  for (const b of bowling)
    matchesBySeries.set(b.seriesId, Math.max(matchesBySeries.get(b.seriesId) ?? 0, b.matches));

  const season = {
    matches: [...matchesBySeries.values()].reduce((s, n) => s + n, 0),
    runs: batting.reduce((s, b) => s + b.runs, 0),
    highestScore: batting.reduce((m, b) => Math.max(m, b.highestScore ?? 0), 0),
    sixes: batting.reduce((s, b) => s + b.sixes, 0),
    wickets: bowling.reduce((s, b) => s + b.wickets, 0),
  };

  const bio = bioRaw
    ? {
        firstName: str(bioRaw.firstName),
        lastName: str(bioRaw.lastName),
        playingRole: str(bioRaw.playingRole),
        battingStyle: str(bioRaw.battingStyle),
        bowlingStyle: str(bioRaw.bowlingStyle),
        age: typeof bioRaw.age === "number" ? bioRaw.age : null,
        photo:
          img(bioRaw.profileImagePath) ||
          img((bioRaw as Record<string, unknown>).profilepic_file_path),
      }
    : null;

  // Fallback name/photo from the DB roster if bio is unavailable
  const dbPlayer =
    !bio || (!bio.firstName && !bio.lastName)
      ? await prisma.player.findUnique({ where: { id: playerId } })
      : null;

  const careerBatting = (
    Array.isArray(career?.battingStats) ? career!.battingStats : []
  ).map((b) => {
    const innings = num(b.innings);
    const notOuts = num(b.notOuts);
    const runs = num(b.runsScored);
    const balls = num(b.ballsFaced);
    const outs = innings - notOuts;
    return {
      format: str(b.seriesType) || "Overall",
      matches: num(b.matches),
      innings,
      runs,
      highestScore: num(b.highestScore),
      average: outs > 0 ? (runs / outs).toFixed(1) : runs > 0 ? "—" : "0.0",
      strikeRate: balls > 0 ? ((runs / balls) * 100).toFixed(1) : "0.0",
      fours: num(b.fours),
      sixes: num(b.sixers),
      fifties: num(b.fifties),
      hundreds: num(b.hundreds),
    };
  });

  const careerBowling = (
    Array.isArray(career?.bowlingStats) ? career!.bowlingStats : []
  ).map((b) => {
    const balls = num(b.balls);
    const runs = num(b.runs);
    const wickets = num(b.wickets);
    return {
      format: str(b.seriesType) || "Overall",
      matches: num(b.matches),
      innings: num(b.innings),
      overs: oversFromBalls(balls),
      runs,
      wickets,
      maidens: num(b.maidens),
      average: wickets > 0 ? (runs / wickets).toFixed(1) : "—",
      economy: balls > 0 ? (runs / (balls / 6)).toFixed(1) : "0.0",
      fourWickets: num(b.fourWickets),
      fiveWickets: num(b.fiveWickets),
    };
  });

  return {
    playerId,
    bio,
    name:
      [bio?.firstName, bio?.lastName].filter(Boolean).join(" ") ||
      [dbPlayer?.firstName, dbPlayer?.lastName].filter(Boolean).join(" ") ||
      "Player",
    photo: bio?.photo || img(dbPlayer?.profilePic) || "",
    role: bio?.playingRole || dbPlayer?.playingRole || "",
    season,
    careerBatting,
    careerBowling,
  };
}

export const getPlayerProfile = unstable_cache(
  buildPlayerProfile,
  ["player-profile"],
  { revalidate: 600, tags: ["cricclubs"] }
);
