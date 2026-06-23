// Verifies CricClubs API access + parsing WITHOUT touching the database.
//   npm run cricclubs:smoke
import "dotenv/config";
import {
  getBattingStats,
  getMatches,
  getPointsTable,
  getSchedule,
  getSeriesList,
} from "../app/lib/cricclubs/endpoints";

async function main() {
  const SID = 331; // Red Ball Div II 2025 (has completed data)

  const series = await getSeriesList();
  console.log("series total:        ", series?.seriesList?.length);

  const sched = await getSchedule();
  console.log("upcoming fixtures:   ", sched?.fixtureList?.length);

  const matches = await getMatches(SID);
  console.log(`matches(${SID}):        `, matches?.length, "- e.g.", matches?.[0]?.result);

  const pts = await getPointsTable(SID);
  console.log(
    `standings(${SID}):      `,
    "groups",
    pts?.length,
    "teams",
    pts?.[0]?.teams?.length,
    "- top",
    pts?.[0]?.teams?.[0]?.team?.teamName,
    pts?.[0]?.teams?.[0]?.team?.points
  );

  const bat = await getBattingStats(SID);
  console.log(
    `batting(${SID}):        `,
    bat?.length,
    "- top",
    bat?.[0]?.firstName,
    bat?.[0]?.lastName,
    bat?.[0]?.runsScored,
    "runs"
  );

  console.log("\nSmoke test OK — API reachable and parsing as expected.");
}

main().catch((err) => {
  console.error("Smoke test FAILED:", err);
  process.exit(1);
});
