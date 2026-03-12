'use client';

import { useState } from 'react';
import SectionTitleEle from '../ui/SectionTitleEle';
import TimeCounter from '../ui/TimeCounter';
import SingleFixtureEle from '../ui/SingleFixtureEle';

// Placeholder data for when there is no upcoming match
const PLACEHOLDER_UPCOMING_MATCH = {
  fixtureId: 1,
  fixedFormatDate: "2024-08-15",
  time: "12:00 PM",
  seriesName: "CCC Summer League 2024",
  t1_logo_file_path: "/images/team-logos/team1.png",
  t2_logo_file_path: "/images/team-logos/team2.png",
  teamOneName: "Chicago Eagles",
  teamTwoName: "Club Cricket of Chicago",
  ground: "Lincoln Park Cricket Ground",
  location: "Chicago, IL",
  title: "Chicago Eagles vs Club Cricket of Chicago"
};

interface Logo {
  url: string;
}

interface UpcomingMatch {
  id: string;
  title: string;
  t1Name: string;
  t2Name: string;
  groundsName: string;
  date: string;
  t1Logo: Logo[];
  t2Logo: Logo[];
}

interface UpcomingMatchPanelProps {
  match?: UpcomingMatch | null;
}

export default function UpcomingMatchPanel({ match }: UpcomingMatchPanelProps) {
  // Keep the match in state (not strictly necessary unless you plan to modify it)
  const [upcomingMatch] = useState<UpcomingMatch | null>(match ?? null);

  // Boolean to check if we have a valid match
  const hasMatch = !!upcomingMatch;

  return (
    <section className="UMP_container base_paddings">
      <div className="UMP_parent center_aligned max_content">

        {/* Title changes depending on whether a match is present */}
        <SectionTitleEle>
          {hasMatch ? 'Next Match' : 'Next Season Starts In'}
        </SectionTitleEle>

        <div className="UMP_parent_grid flex_grid">

          {hasMatch ? (
            <>
              {/* Single Fixture Card */}
              <div className="UMP_match_ele mb-[5%]">
                <SingleFixtureEle
                  fixture={upcomingMatch}
                  isActive={false} // no "raised" effect
                />
              </div>

              {/* Countdown Timer */}
              <div className="UMP_timer">
                <TimeCounter
                  matchDate={
                    new Date(upcomingMatch.date).toISOString().split('T')[0]
                  }
                  matchTime={new Date(upcomingMatch.date).toLocaleTimeString(
                    [],
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                />
              </div>
            </>
          ) : (
            // Fallback if there's no upcoming match
            <div className="UMP_timer" style={{ width: '100%' }}>
              <TimeCounter
                matchDate={PLACEHOLDER_UPCOMING_MATCH.fixedFormatDate}
                matchTime={PLACEHOLDER_UPCOMING_MATCH.time}
                className="mb-[2%]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
