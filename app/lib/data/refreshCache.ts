import { revalidateTag } from "next/cache";
import { COMPETITIVE_DATA_TAG, HISTORIC_DATA_TAG } from "./cachePolicy";

export function refreshCompetitiveCache(includeHistory = false): void {
  // A webhook must expire now: SWR could serve the pre-sync value on the next
  // visit. No DB reads, sync work, or per-page warming happens in this endpoint.
  revalidateTag(COMPETITIVE_DATA_TAG, { expire: 0 });
  if (includeHistory) revalidateTag(HISTORIC_DATA_TAG, { expire: 0 });
}
