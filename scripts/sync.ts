// One-off / cron CLI to run the CricClubs -> DB sync.
//   npm run sync
import "dotenv/config";
import { syncAll } from "../app/lib/sync";
import { prisma } from "../app/lib/db/prisma";

async function main() {
  console.log(
    `CricClubs sync starting (clubId ${process.env.CRICCLUBS_CLUB_ID ?? 63})...`
  );
  const summary = await syncAll();

  let ok = 0;
  let failed = 0;
  for (const [entity, step] of Object.entries(summary.steps)) {
    if (step.status === "ok") {
      ok++;
      const r = step.result;
      console.log(`  ✓ ${entity}: ${typeof r === "number" ? r : JSON.stringify(r)}`);
    } else {
      failed++;
      console.error(`  ✗ ${entity}: ${step.error}`);
    }
  }

  console.log(`Done in ${summary.durationMs}ms — ${ok} ok, ${failed} failed.`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
