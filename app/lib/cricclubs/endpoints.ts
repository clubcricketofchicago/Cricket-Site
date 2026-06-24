// Typed wrappers over the CricClubs core endpoints we use.
// Endpoint paths/params confirmed against the official MWCC API docs and live probing.

import { cricFetch } from "./client";
import { CRICCLUBS } from "./config";
import type {
  RawBattingStat,
  RawBowlingStat,
  RawFieldingStat,
  RawMatch,
  RawPointsGroup,
  RawScheduleData,
  RawSeriesListData,
  RawTeamPlayersData,
  RawTeamsListData,
} from "./types";

const clubId = () => CRICCLUBS.clubId;

/** All series/tournaments for the club. */
export const getSeriesList = () =>
  cricFetch<RawSeriesListData>("/series/getSeriesList", { clubId: clubId() });

/** Upcoming/scheduled fixtures. Omit seriesId to get all for the club. */
export const getSchedule = (seriesId?: number) =>
  cricFetch<RawScheduleData>("/match/getSchedule", {
    clubId: clubId(),
    seriesId,
  });

/** Completed/in-progress match results for a series. Returns a bare array. */
export const getMatches = (seriesId: number) =>
  cricFetch<RawMatch[]>("/match/getMatches", { clubId: clubId(), seriesId });

/** Teams participating in a series. */
export const getTeamsList = (seriesId: number) =>
  cricFetch<RawTeamsListData>("/team/getTeamsList", {
    clubId: clubId(),
    seriesId,
  });

/** Players in a team (current squad). */
export const getTeamPlayers = (teamId: number) =>
  cricFetch<RawTeamPlayersData>("/team/getTeamPlayers", {
    clubId: clubId(),
    teamId,
  });

/** Points table / standings for a series. Returns a bare array of groups. */
export const getPointsTable = (seriesId: number) =>
  cricFetch<RawPointsGroup[]>("/team/getPointsTable", {
    clubId: clubId(),
    seriesId,
  });

/** Batting leaderboard for a series (optionally one team). Bare array. */
export const getBattingStats = (seriesId: number, teamId?: number) =>
  cricFetch<RawBattingStat[]>("/stats/getBattingStats", {
    clubId: clubId(),
    seriesId,
    teamId,
  });

/** Bowling leaderboard for a series (optionally one team). Bare array. */
export const getBowlingStats = (seriesId: number, teamId?: number) =>
  cricFetch<RawBowlingStat[]>("/stats/getBowlingStats", {
    clubId: clubId(),
    seriesId,
    teamId,
  });

/** Fielding leaderboard for a series (note API spelling "Feilding"). Bare array. */
export const getFieldingStats = (seriesId: number, teamId?: number) =>
  cricFetch<RawFieldingStat[]>("/stats/getFeildingStats", {
    clubId: clubId(),
    seriesId,
    teamId,
  });

/** A player's career batting/bowling stats (by series type). */
export const getCareerStats = (playerId: number) =>
  cricFetch<{
    battingStats?: Record<string, unknown>[];
    bowlingStats?: Record<string, unknown>[];
  }>("/player/getStats", { v: "5.0.29", playerId });

/** A player's profile/bio. */
export const getUserDetails = (playerId: number) =>
  cricFetch<Record<string, unknown>>("/user/getUserDetails", { playerId });
