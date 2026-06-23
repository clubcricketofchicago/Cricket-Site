// Raw shapes returned by the CricClubs core API (only the fields we consume).
// Verified against live responses for clubId 63. All numbers may arrive as
// number | string depending on endpoint, so consumers coerce defensively.

export interface CricEnvelope<T> {
  data: T | null;
  errorMessage: string | null;
  errorCode: string | null;
  responseState: boolean;
}

export interface RawSeries {
  seriesID: number;
  seriesName: string;
  seriesType?: string;
  year?: string;
  level?: string;
  parentSeriesId?: number;
  startDate?: string; // unix seconds (string)
}
export interface RawSeriesListData {
  seriesList: RawSeries[];
}

export interface RawFixture {
  fixtureId: number;
  teamOne?: number;
  teamTwo?: number;
  teamOneName?: string;
  teamTwoName?: string;
  teamOneCode?: string;
  teamTwoCode?: string;
  t1_logo_file_path?: string;
  t2_logo_file_path?: string;
  matchId?: number;
  matchType?: string;
  date?: string; // "MM/DD/YYYY"
  fixedFormatDate?: string; // "YYYY-MM-DD"
  time?: string;
  day?: string;
  groundId?: number;
  ground?: string;
  location?: string;
  googleMapsLink?: string;
  statusDesc?: string;
  matchDateTime?: number; // unix seconds
  seriesId?: number;
  seriesName?: string;
}
export interface RawScheduleData {
  fixtureList: RawFixture[];
}

export interface RawMatch {
  matchId: number;
  clubId?: number;
  clubName?: string;
  teamOne?: number;
  teamTwo?: number;
  teamOneName?: string;
  teamTwoName?: string;
  teamOneCode?: string;
  teamTwoCode?: string;
  t1_logo_file_path?: string;
  t2_logo_file_path?: string;
  overs?: number;
  t1total?: number;
  t1wickets?: number;
  t1balls?: number;
  t2total?: number;
  t2wickets?: number;
  t2balls?: number;
  isComplete?: number;
  status?: string;
  result?: string;
  winner?: number;
  matchDate?: string;
  location?: string;
  live_streaming_link?: string;
  lastUpdatedDate?: string;
  seriesName?: string;
}

export interface RawTeam {
  teamID: number;
  teamName: string;
  teamCode?: string;
  captainName?: string;
  captain?: number;
  viceCaptainName?: string;
  viceCaptain?: number;
  logo_file_path?: string;
  group?: number;
}
export interface RawTeamsListData {
  teamsList: { groupName?: string; teams: RawTeam[] }[];
}

export interface RawRosterPlayer {
  playerID: number;
  firstName?: string;
  lastName?: string;
  profilepic_file_path?: string;
  playingRole?: string;
  jerseyNumber?: string;
}
export interface RawTeamPlayersData {
  teamPlayers: RawRosterPlayer[];
}

export interface RawPointsTeam {
  team: {
    teamID: number;
    teamName?: string;
    teamCode?: string;
    logo_file_path?: string;
    matches?: number;
    won?: number;
    lost?: number;
    tied?: number;
    noResult?: number;
    points?: number;
    netRunRate?: number;
    runsScored?: number;
    runsGiven?: number;
  };
}
export interface RawPointsGroup {
  groupName?: string;
  groupId?: number;
  teams: RawPointsTeam[];
}

export interface RawBattingStat {
  playerID: number;
  firstName?: string;
  lastName?: string;
  teamId?: number;
  teamName?: string;
  profilepic_file_path?: string;
  matches?: number;
  innings?: number;
  notOuts?: number;
  runsScored?: number;
  ballsFaced?: number;
  fours?: number;
  sixers?: number;
  fifties?: number;
  hundreds?: number;
  highestScore?: number;
  points?: number;
}

export interface RawBowlingStat {
  playerID: number;
  firstName?: string;
  lastName?: string;
  teamId?: number;
  teamName?: string;
  profilepic_file_path?: string;
  matches?: number;
  innings?: number;
  balls?: number;
  runs?: number;
  wickets?: number;
  catches?: number;
  fourWickets?: number;
  fiveWickets?: number;
  maidens?: number;
  dotBalls?: number;
  wides?: number;
  noBalls?: number;
  hattricks?: number;
  economy?: number;
  points?: number;
}

export interface RawFieldingStat {
  playerID: number;
  firstName?: string;
  lastName?: string;
  teamId?: number;
  teamName?: string;
  profilepic_file_path?: string;
  totalMatches?: number;
  catches?: number;
  wkcatches?: number;
  direct?: number;
  indirect?: number;
  stumpings?: number;
  total?: number;
  points?: number;
}
