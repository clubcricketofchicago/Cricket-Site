"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import UpcomingMatchPanel from "../components/calendar/UpcomingMatchPanel";
import DateCalendar from "../components/calendar/DateCalendar";
import { fetchGraphQL } from "../lib/graphqlClient";
import { getCalendarQuery } from "../lib/queries/calendarQuery";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    const query = getCalendarQuery();

    fetchGraphQL(query)
      .then((data) => {
        console.log("Calendar API response:", data);
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
    return <div className="loading-message">Loading calendar data...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading calendar content: {error}</div>;
  }

  if (!matches || !matches.entries || matches.entries.length === 0) {
    return <div className="no-data">No match data available.</div>;
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
    return <div className="no-data">No upcoming matches.</div>;
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
          <UpcomingMatchPanel match={filteredEntries[0]} />

          {/* Pass the full list of upcoming matches to DateCalendar */}
          <DateCalendar matches={filteredMatches} />
        </Suspense>
      </div>
    </section>
  );
}
