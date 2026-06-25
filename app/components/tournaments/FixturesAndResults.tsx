"use client";

import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Image from "next/image";
import Link from "next/link";

// --- Helper to build full CMS image URLs ---
const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || "";
function getFullImageUrl(url?: string | null) {
  if (!url) return "/images/placeholder_logo.png";
  if (url.startsWith("http")) return url;
  return `${cmsBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

// -----------------------------
// Interfaces to replace "any"
// -----------------------------
interface LogoItem {
  url?: string | null;
}

interface FixtureItem {
  id: string;
  t1Name?: string;
  t1Logo?: LogoItem[];
  t2Name?: string;
  t2Logo?: LogoItem[];
  groundsName?: string;
  date?: string;
}

interface ResultItem {
  id: string;
  title?: string;      // e.g. "Won by 126 Runs"
  t1Score?: string;    // e.g. "223/4"
  t2Score?: string;    // e.g. "97/9"
  t1Overs?: string;    // e.g. "19.3/30"
  t2Overs?: string;
  teamOneLogo?: LogoItem[];
  teamTwoLogo?: LogoItem[];
  date?: string;
  lightswitch?: boolean;
  opponentName?: string;
  opponentLogo?: LogoItem[];
  cccScore?: string;
  oppScore?: string;
}

// --- Reusable sub-component: Location ---
function MatchLocation({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`match_location ${className ?? ""}`}>
      <div className="match_loc_ico">
        <img src="/images/near_me_icon.png" alt="location icon" className="ccc-meta-ico" />
      </div>
      <div className="match_loc_info">
        <p className="roboto-condensed-light">{children}</p>
      </div>
    </div>
  );
}

// --- Reusable sub-component: Date ---
function MatchDate({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  if (!children) {
    // If no date is provided, render nothing
    return null;
  }

  const dateObj = new Date(children);
  if (isNaN(dateObj.getTime())) {
    return null;
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = dateObj.toLocaleDateString("en-US", options).split(", ");

  return (
    <div className={`match_date ${className ?? ""}`}>
      <div className="match_date_ico">
        <img src="/images/calendar_icon.png" alt="date icon" className="ccc-meta-ico" />
      </div>
      <div className="match_date_info">
        <p>{formattedDate[0]}</p>
        <p>{formattedDate[1]}</p>
        <p>{formattedDate[2]}</p>
      </div>
    </div>
  );
}

// -----------------------------
// Fixture item for the "Fixtures" tab
// -----------------------------
function MatchFixtureEle({ fixture }: { fixture: FixtureItem }) {
  // These are CCC's fixtures, so the opponent is whichever side isn't CCC
  // (CCC can be listed as either team one or team two).
  const CCC = "Club Cricket of Chicago";
  const cccIsT1 = fixture?.t1Name === CCC;
  const opponentName = (cccIsT1 ? fixture?.t2Name : fixture?.t1Name) || "Opponent";
  const opponentLogoObj = cccIsT1 ? fixture?.t2Logo?.[0] : fixture?.t1Logo?.[0];
  const opponentLogo = getFullImageUrl(opponentLogoObj?.url);

  const location = fixture?.groundsName || "";
  const date = fixture?.date || "";

  return (
    <div className="MXE_ele flex_grid">
      <div className="oppo_team flex">
        <div className="w-full my-auto">
          <div className="flex_grid">
            <div className="oppo_vs_text">
              <p className="white_color roboto-condensed-regular p4">Vs</p>
            </div>
            <div className="oppo_team_ico">
              <Image
                src={opponentLogo}
                alt="Opponent Logo"
                width={24}
                height={24}
                unoptimized
              />
            </div>
          </div>
          <div className="oppo_team_name">
            <p className="white_color roboto-condensed-regular p6">
              {opponentName}
            </p>
          </div>
        </div>
      </div>
      <MatchLocation className="flex_grid">
        {location}
      </MatchLocation>
      <MatchDate>{date}</MatchDate>
    </div>
  );
}

// -----------------------------
// Result item for the "Results" tab
// -----------------------------
function MatchResultEle({ result }: { result: ResultItem }) {
  // Rendered with the SAME structure as the fixtures card (.MXE_ele + Vs Opponent),
  // with the scoreline + outcome where a fixture shows its location.
  const isWin = result.lightswitch;
  const isTie = /\btie(d)?\b/i.test(result.title || "");
  const statusColor = isTie ? "var(--text-dim)" : isWin ? "var(--win)" : "var(--loss)";
  const opponentName = result.opponentName || "Opponent";
  const opponentLogo = getFullImageUrl(result.opponentLogo?.[0]?.url);
  const cccScore = result.cccScore || "0/0";
  const oppScore = result.oppScore || "0/0";
  const date = result?.date || "";

  return (
    <Link
      href={`/match/${result.id}`}
      className="block no_underline transition-opacity hover:opacity-90"
    >
      {/* same .MXE_ele card as the fixtures (CSS is scoped to div.MXE_ele) */}
      <div className="MXE_ele flex_grid">
        <div className="oppo_team flex">
          <div className="w-full my-auto">
            <div className="flex_grid">
              <div className="oppo_vs_text">
                <p className="white_color roboto-condensed-regular p4">Vs</p>
              </div>
              <div className="oppo_team_ico">
                <Image src={opponentLogo} alt="Opponent Logo" width={24} height={24} unoptimized />
              </div>
            </div>
            <div className="oppo_team_name">
              <p className="white_color roboto-condensed-regular p6">{opponentName}</p>
            </div>
          </div>
        </div>

        {/* score + outcome (in place of the fixture's location) */}
        <div className="w-[42%] flex">
          <div className="m-auto text-center px-[3%]">
            <p className="roboto-condensed-bold p5 white_color whitespace-nowrap">
              {cccScore} <span className="text-[color:var(--text-dim)]">–</span> {oppScore}
            </p>
            <p className="roboto-condensed-bold p6" style={{ color: statusColor }}>
              {isTie ? "TIE" : isWin ? "WON" : "LOST"}
            </p>
          </div>
        </div>

        <MatchDate>{date}</MatchDate>
      </div>
    </Link>
  );
}

// -----------------------------
// Main Component
// -----------------------------
interface Props {
  fixtureCount?: number;
  resultsCount?: number;
  fixtures?: FixtureItem[];
  results?: ResultItem[];
}

export default function FixturesAndResults({
  fixtureCount = 7,
  resultsCount = 7,
  fixtures = [],
  results = [],
}: Props) {
  const hasFixtures = fixtures && fixtures.length > 0;
  const hasResults = results && results.length > 0;

  if (!hasFixtures && !hasResults) {
    return null;
  }

  return (
    <div className="LT_gridEle LT_fixtures_results_tabs_parent">
      <Tabs>
        <TabList>
          {hasFixtures && (
            <Tab className="roboto-condensed-bold react-tabs__tab p4 grey_text uppercase">
              Fixtures
            </Tab>
          )}
          {hasResults && (
            <Tab className="roboto-condensed-bold react-tabs__tab p4 grey_text uppercase">
              Results
            </Tab>
          )}
        </TabList>

        {hasFixtures && (
          <TabPanel>
            <div className="fixtures_container flex_grid">
              {fixtures.slice(0, fixtureCount).map((fixture) => (
                <MatchFixtureEle key={fixture.id} fixture={fixture} />
              ))}
            </div>
          </TabPanel>
        )}

        {hasResults && (
          <TabPanel>
            <div className="fixtures_container flex_grid">
              {results.slice(0, resultsCount).map((result) => (
                <MatchResultEle key={result.id} result={result} />
              ))}
            </div>
          </TabPanel>
        )}
      </Tabs>
    </div>
  );
}
