// CricClubs -> Postgres sync. Each function maps a CricClubs endpoint into idempotent
// Prisma upserts keyed by the source's natural IDs. `syncAll` orchestrates them and
// records per-entity status in `sync_state` (one failing step never aborts the rest).

import { prisma } from "../db/prisma";
import { CCC_TEAM_IDS, TRACKED_SERIES } from "../cricclubs/config";
import {
  getBattingStats,
  getBowlingStats,
  getFieldingStats,
  getMatches,
  getPointsTable,
  getSchedule,
  getSeriesList,
  getTeamPlayers,
  getTeamsList,
} from "../cricclubs/endpoints";

// ---- coercion helpers (API mixes number | string) -------------------------

function num(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
}
function numOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : null;
}
function dateFromUnix(v: unknown): Date | null {
  const n = numOrNull(v);
  if (n === null || n === 0) return null;
  return new Date(n * 1000);
}
function dateFromIso(v: unknown): Date | null {
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---- per-entity syncs ------------------------------------------------------

/** All series/tournaments for the club. */
export async function syncSeries(): Promise<number> {
  const data = await getSeriesList();
  const list = data?.seriesList ?? [];
  for (const s of list) {
    const payload = {
      name: s.seriesName,
      type: s.seriesType ?? null,
      year: s.year ?? null,
      level: s.level ?? null,
      parentSeriesId: numOrNull(s.parentSeriesId),
      startDate: dateFromUnix(s.startDate),
    };
    await prisma.series.upsert({
      where: { id: s.seriesID },
      create: { id: s.seriesID, ...payload },
      update: payload,
    });
  }
  return list.length;
}

/** All upcoming fixtures for the club (across series). */
export async function syncFixtures(): Promise<number> {
  const data = await getSchedule();
  const list = data?.fixtureList ?? [];
  const seenIds: number[] = [];
  for (const f of list) {
    const payload = {
      seriesId: num(f.seriesId),
      seriesName: f.seriesName ?? null,
      teamOneId: numOrNull(f.teamOne),
      teamTwoId: numOrNull(f.teamTwo),
      teamOneName: f.teamOneName ?? null,
      teamTwoName: f.teamTwoName ?? null,
      teamOneLogo: f.t1_logo_file_path ?? null,
      teamTwoLogo: f.t2_logo_file_path ?? null,
      matchId: num(f.matchId),
      matchType: f.matchType ?? null,
      date: f.fixedFormatDate ?? null,
      time: f.time ?? null,
      day: f.day ?? null,
      groundId: numOrNull(f.groundId),
      location: f.location ?? f.ground ?? null,
      googleMapsLink: f.googleMapsLink ?? null,
      statusDesc: f.statusDesc ?? null,
      matchDateTime: dateFromUnix(f.matchDateTime),
    };
    await prisma.fixture.upsert({
      where: { id: f.fixtureId },
      create: { id: f.fixtureId, ...payload },
      update: payload,
    });
    seenIds.push(f.fixtureId);
  }

  // Reconcile against the feed. getSchedule() returns CCC's COMPLETE set of currently
  // scheduled (unplayed) fixtures, so any stored fixture no longer in it has been played
  // (it moves to the match/results table) or cancelled. Drop those stale rows — without
  // this a fixture keeps matchId=0 forever and shows as "upcoming" indefinitely. A failed
  // feed call throws above; we still guard the empty case so a fluke empty payload can't
  // wipe the whole table (it would self-heal on the next sync anyway).
  if (seenIds.length > 0) {
    await prisma.fixture.deleteMany({ where: { id: { notIn: seenIds } } });
  }
  return list.length;
}

/** Teams participating in a series. */
export async function syncTeams(seriesId: number): Promise<number> {
  const data = await getTeamsList(seriesId);
  const groups = data?.teamsList ?? [];
  let count = 0;
  for (const g of groups) {
    for (const t of g.teams ?? []) {
      if (!t.teamID) continue;
      const payload = {
        name: t.teamName,
        code: t.teamCode ?? null,
        logoPath: t.logo_file_path ?? null,
        captainId: numOrNull(t.captain),
        captainName: t.captainName ?? null,
        viceCaptainId: numOrNull(t.viceCaptain),
        viceCaptainName: t.viceCaptainName ?? null,
        groupNo: numOrNull(t.group),
      };
      await prisma.team.upsert({
        where: { id: t.teamID },
        create: { id: t.teamID, ...payload },
        update: payload,
      });
      count++;
    }
  }
  return count;
}

/** Completed/in-progress results for a series. */
export async function syncMatches(seriesId: number): Promise<number> {
  const list = (await getMatches(seriesId)) ?? [];
  let count = 0;
  for (const m of list) {
    if (!m.matchId) continue; // skip unscored placeholders
    const payload = {
      seriesId,
      seriesName: m.seriesName ?? null,
      clubId: numOrNull(m.clubId),
      teamOneId: numOrNull(m.teamOne),
      teamTwoId: numOrNull(m.teamTwo),
      teamOneName: m.teamOneName ?? null,
      teamTwoName: m.teamTwoName ?? null,
      teamOneCode: m.teamOneCode ?? null,
      teamTwoCode: m.teamTwoCode ?? null,
      teamOneLogo: m.t1_logo_file_path ?? null,
      teamTwoLogo: m.t2_logo_file_path ?? null,
      overs: numOrNull(m.overs),
      t1Total: numOrNull(m.t1total),
      t1Wickets: numOrNull(m.t1wickets),
      t1Balls: numOrNull(m.t1balls),
      t2Total: numOrNull(m.t2total),
      t2Wickets: numOrNull(m.t2wickets),
      t2Balls: numOrNull(m.t2balls),
      isComplete: num(m.isComplete) === 1,
      status: m.status ?? null,
      result: m.result ?? null,
      winner: numOrNull(m.winner),
      matchDate: m.matchDate ?? null,
      location: m.location ?? null,
      liveStreamLink: m.live_streaming_link ?? null,
      lastUpdated: dateFromIso(m.lastUpdatedDate),
    };
    await prisma.match.upsert({
      where: { id: m.matchId },
      create: { id: m.matchId, ...payload },
      update: payload,
    });
    count++;
  }
  return count;
}

/** Points table / standings for a series. */
export async function syncStandings(seriesId: number): Promise<number> {
  const groups = (await getPointsTable(seriesId)) ?? [];
  let count = 0;
  for (const g of groups) {
    for (const row of g.teams ?? []) {
      const t = row.team;
      if (!t?.teamID) continue;
      const payload = {
        groupName: g.groupName ?? null,
        teamName: t.teamName ?? null,
        teamCode: t.teamCode ?? null,
        teamLogo: t.logo_file_path ?? null,
        matches: num(t.matches),
        won: num(t.won),
        lost: num(t.lost),
        tied: num(t.tied),
        noResult: num(t.noResult),
        points: num(t.points),
        netRunRate: numOrNull(t.netRunRate),
        runsScored: numOrNull(t.runsScored),
        runsGiven: numOrNull(t.runsGiven),
      };
      await prisma.standing.upsert({
        where: { seriesId_teamId: { seriesId, teamId: t.teamID } },
        create: { seriesId, teamId: t.teamID, ...payload },
        update: payload,
      });
      count++;
    }
  }
  return count;
}

/** Batting leaderboard ("Number Zone") for a series. */
export async function syncBattingStats(seriesId: number): Promise<number> {
  const list = (await getBattingStats(seriesId)) ?? [];
  for (const b of list) {
    if (!b.playerID) continue;
    const payload = {
      teamId: numOrNull(b.teamId),
      firstName: b.firstName ?? null,
      lastName: b.lastName ?? null,
      teamName: b.teamName ?? null,
      profilePic: b.profilepic_file_path ?? null,
      matches: num(b.matches),
      innings: num(b.innings),
      notOuts: num(b.notOuts),
      runs: num(b.runsScored),
      balls: num(b.ballsFaced),
      fours: num(b.fours),
      sixes: num(b.sixers),
      fifties: num(b.fifties),
      hundreds: num(b.hundreds),
      highestScore: numOrNull(b.highestScore),
      points: numOrNull(b.points),
    };
    await prisma.playerBattingStat.upsert({
      where: { seriesId_playerId: { seriesId, playerId: b.playerID } },
      create: { seriesId, playerId: b.playerID, ...payload },
      update: payload,
    });
  }
  return list.length;
}

/** Bowling leaderboard for a series. */
export async function syncBowlingStats(seriesId: number): Promise<number> {
  const list = (await getBowlingStats(seriesId)) ?? [];
  for (const b of list) {
    if (!b.playerID) continue;
    const payload = {
      teamId: numOrNull(b.teamId),
      firstName: b.firstName ?? null,
      lastName: b.lastName ?? null,
      teamName: b.teamName ?? null,
      profilePic: b.profilepic_file_path ?? null,
      matches: num(b.matches),
      innings: num(b.innings),
      balls: num(b.balls),
      runs: num(b.runs),
      wickets: num(b.wickets),
      catches: num(b.catches),
      fourWickets: num(b.fourWickets),
      fiveWickets: num(b.fiveWickets),
      maidens: num(b.maidens),
      dotBalls: num(b.dotBalls),
      wides: num(b.wides),
      noBalls: num(b.noBalls),
      hattricks: num(b.hattricks),
      economy: numOrNull(b.economy),
      points: numOrNull(b.points),
    };
    await prisma.playerBowlingStat.upsert({
      where: { seriesId_playerId: { seriesId, playerId: b.playerID } },
      create: { seriesId, playerId: b.playerID, ...payload },
      update: payload,
    });
  }
  return list.length;
}

/** Fielding leaderboard for a series. */
export async function syncFieldingStats(seriesId: number): Promise<number> {
  const list = (await getFieldingStats(seriesId)) ?? [];
  for (const f of list) {
    if (!f.playerID) continue;
    const payload = {
      teamId: numOrNull(f.teamId),
      firstName: f.firstName ?? null,
      lastName: f.lastName ?? null,
      teamName: f.teamName ?? null,
      profilePic: f.profilepic_file_path ?? null,
      matches: num(f.totalMatches),
      catches: num(f.catches),
      wkCatches: num(f.wkcatches),
      directRunOuts: num(f.direct),
      indirectRunOuts: num(f.indirect),
      stumpings: num(f.stumpings),
      total: num(f.total),
      points: numOrNull(f.points),
    };
    await prisma.playerFieldingStat.upsert({
      where: { seriesId_playerId: { seriesId, playerId: f.playerID } },
      create: { seriesId, playerId: f.playerID, ...payload },
      update: payload,
    });
  }
  return list.length;
}

/** Club Cricket of Chicago's squads (one team entry per division). */
export async function syncRosters(): Promise<{ players: number; roster: number }> {
  let players = 0;
  let roster = 0;
  for (const teamId of CCC_TEAM_IDS) {
    const data = await getTeamPlayers(teamId);
    const list = data?.teamPlayers ?? [];
    for (const p of list) {
      if (!p.playerID) continue;
      const playerPayload = {
        firstName: p.firstName ?? null,
        lastName: p.lastName ?? null,
        profilePic: p.profilepic_file_path ?? null,
        playingRole: p.playingRole ?? null,
      };
      await prisma.player.upsert({
        where: { id: p.playerID },
        create: { id: p.playerID, ...playerPayload },
        update: playerPayload,
      });
      players++;
      const rosterPayload = {
        jerseyNumber: p.jerseyNumber ?? null,
        role: p.playingRole ?? null,
      };
      await prisma.teamRoster.upsert({
        where: { teamId_playerId: { teamId, playerId: p.playerID } },
        create: { teamId, playerId: p.playerID, ...rosterPayload },
        update: rosterPayload,
      });
      roster++;
    }
  }
  return { players, roster };
}

// ---- orchestration ---------------------------------------------------------

type StepResult =
  | { status: "ok"; result: unknown }
  | { status: "error"; error: string };

async function runStep(
  entity: string,
  fn: () => Promise<unknown>
): Promise<StepResult> {
  const t0 = Date.now();
  try {
    const result = await fn();
    const itemCount = typeof result === "number" ? result : null;
    await prisma.syncState.upsert({
      where: { entity },
      create: {
        entity,
        lastSyncedAt: new Date(),
        lastStatus: "ok",
        lastError: null,
        itemCount,
        durationMs: Date.now() - t0,
      },
      update: {
        lastSyncedAt: new Date(),
        lastStatus: "ok",
        lastError: null,
        itemCount,
        durationMs: Date.now() - t0,
      },
    });
    return { status: "ok", result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.syncState.upsert({
      where: { entity },
      create: {
        entity,
        lastSyncedAt: new Date(),
        lastStatus: "error",
        lastError: message,
        durationMs: Date.now() - t0,
      },
      update: {
        lastSyncedAt: new Date(),
        lastStatus: "error",
        lastError: message,
        durationMs: Date.now() - t0,
      },
    });
    return { status: "error", error: message };
  }
}

/** Full sync of all tracked CricClubs data into the DB. Safe to re-run anytime. */
export async function syncAll(): Promise<{
  durationMs: number;
  steps: Record<string, StepResult>;
}> {
  const started = Date.now();
  const steps: Record<string, StepResult> = {};

  steps.series = await runStep("series", syncSeries);
  steps.fixtures = await runStep("fixtures", syncFixtures);

  for (const { id } of TRACKED_SERIES) {
    steps[`teams:${id}`] = await runStep(`teams:${id}`, () => syncTeams(id));
    steps[`matches:${id}`] = await runStep(`matches:${id}`, () => syncMatches(id));
    steps[`standings:${id}`] = await runStep(`standings:${id}`, () => syncStandings(id));
    steps[`batting:${id}`] = await runStep(`batting:${id}`, () => syncBattingStats(id));
    steps[`bowling:${id}`] = await runStep(`bowling:${id}`, () => syncBowlingStats(id));
    steps[`fielding:${id}`] = await runStep(`fielding:${id}`, () => syncFieldingStats(id));
  }

  steps.rosters = await runStep("rosters", syncRosters);

  return { durationMs: Date.now() - started, steps };
}
