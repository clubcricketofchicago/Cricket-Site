// CricClubs API configuration + ingest scope for Club Cricket of Chicago.
//
// The CricClubs core API is keyed by `clubId` (the `association` param is ignored).
// clubId 63 = "Midwest Cricket Conference", the club under which CCC competes.

export const CRICCLUBS = {
  baseUrl: process.env.CRICCLUBS_BASE_URL ?? "https://core-prod-origin.cricclubs.com/core",
  clubId: Number(process.env.CRICCLUBS_CLUB_ID ?? 63),
  association: process.env.CRICCLUBS_ASSOCIATION ?? "mwcc",
  consumerKey: process.env.X_CONSUMER_KEY ?? "",
  apiKey: process.env.X_API_KEY ?? "",
  authToken: process.env.CRICCLUBS_AUTH_TOKEN ?? "",
} as const;

/**
 * Series (tournaments) to ingest matches/standings/stats for.
 * These are the divisions Club Cricket of Chicago plays in, matching what the
 * existing site already publishes (slug == seriesId) plus the current season.
 */
export const TRACKED_SERIES: { id: number; name: string; year: string }[] = [
  // 2026 — Summer 2026 (parent season id 359); CCC plays these divisions:
  { id: 361, name: "Master Royal RedBall Premier", year: "2026" },
  { id: 362, name: "Blast T20", year: "2026" },
  { id: 364, name: "RedBall Division II", year: "2026" },
  // 2025 — published on the existing site:
  { id: 330, name: "RedBall Premier 2025", year: "2025" },
  { id: 331, name: "Red Ball Div II 2025", year: "2025" },
  { id: 333, name: "SBCC T20 Blast 2025", year: "2025" },
  // 2024 — published on the existing site:
  { id: 300, name: "Master Royal Red Ball 2024", year: "2024" },
  { id: 312, name: "Master Royal RedBall 2024 Playoffs", year: "2024" },
  // 2024 — additional CCC divisions (CCC plays under alternate team names here):
  { id: 298, name: "Elite 3030 2024", year: "2024" },
  { id: 303, name: "Midwest Premier League 2024", year: "2024" },
  // 2023 — historical:
  { id: 279, name: "Master Royal Red Ball 2023", year: "2023" },
  { id: 284, name: "USA T-10 Cup 2023", year: "2023" },
  // 2022 — historical (earliest CCC season on CricClubs):
  { id: 266, name: "RedBall T30 2022", year: "2022" },
];

export const TRACKED_SERIES_IDS = TRACKED_SERIES.map((s) => s.id);

/** Club Cricket of Chicago's own team entries — one per Summer 2026 division. */
export const CCC_TEAM_IDS = [2677, 2686, 2714];

/**
 * CCC competes under different team NAMES in some series — e.g. "Club Cricket Of
 * Chicago Seekers" (Elite 3030 2024) and "CCC Stars" (Midwest Premier League 2024).
 * Most series use the exact name "Club Cricket of Chicago"; for the ones that don't,
 * we identify CCC's team by id instead.
 */
export const CCC_ALT_TEAM_IDS = [
  2186, // Elite 3030 2024 — "Club Cricket Of Chicago Seekers"
  2240, // Midwest Premier League 2024 — "CCC Stars"
];
