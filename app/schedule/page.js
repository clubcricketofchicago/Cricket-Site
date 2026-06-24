"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import UpcomingMatchPanel from "../components/calendar/UpcomingMatchPanel";
import DateCalendar from "../components/calendar/DateCalendar";
import { Reveal } from "../components/motion";
// Calendar data now comes from the local DB (Neon) via /api/schedule (CCC's fixtures),
// shaped like the old CMS fixture payload.

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data from Calendar API:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Reveal className="loading-message animate-pulse">
        Loading calendar data...
      </Reveal>
    );
  }

  if (error) {
    return <div className="error-message">Error loading calendar content: {error}</div>;
  }

  if (!matches || !matches.entries || matches.entries.length === 0) {
    return <Reveal className="no-data">No match data available.</Reveal>;
  }

  // Filter out matches that are today or earlier
  const filteredEntries = matches.entries.filter((entry) => {
    const matchDate = new Date(entry.date);
    const today = new Date();

    // Compare the numeric date value (or you can zero out time for a "strict" date-only check)
    return matchDate.getTime() > today.getTime();
  });

  // If all matches are filtered out, you can handle that gracefully
  if (filteredEntries.length === 0) {
    return <Reveal className="no-data">No upcoming matches.</Reveal>;
  }

  // Optionally, you can wrap them back into the same shape
  const filteredMatches = {
    ...matches,
    entries: filteredEntries
  };

  return (
    <section className="w-full h-auto bg-repeat-y bg-[100%] aspect-[16/9]">
      <div className="min-h-screen py-20 text-white">
        <Suspense
          fallback={
            <div className="container mx-auto text-center">Loading matches...</div>
          }
        >
          {/* Pass just the first (earliest) upcoming match to UpcomingMatchPanel */}
          <Reveal delay={0}>
            <UpcomingMatchPanel match={filteredEntries[0]} />
          </Reveal>

          {/* Pass the full list of upcoming matches to DateCalendar */}
          <Reveal delay={0.15}>
            <DateCalendar matches={filteredMatches} />
          </Reveal>
        </Suspense>
      </div>
    </section>
  );
}
