"use client";

import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Image from "next/image";
import { Stagger, StaggerItem } from "../motion";

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
        <img src="/images/near_me_icon.png" alt="location icon" />
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
        <img src="/images/calendar_icon.png" alt="date icon" />
      </div>
      <div className="match_date_info">
        <p>{formattedDate[0]}</p>
        <p>{formattedDate[1]}</p>
        <p>{formattedDate[2]}</p>
      </div>
    </div>
  );
}

// --- Parse "runs/wickets" strings like "223/4" -> { runs: 223, wickets: 4 } ---
function parseScore(scoreString?: string | null) {
  if (!scoreString || !scoreString.includes("/")) {
    return { runs: 0, wickets: 0 };
  }
  const [runs, wickets] = scoreString.split("/");
  return {
    runs: parseInt(runs || "0", 10) || 0,
    wickets: parseInt(wickets || "0", 10) || 0,
  };
}

// --- Parse overs strings like "19.3/30" -> 19.3 (the bowled overs) ---
function parseOvers(oversString?: string | null) {
  if (!oversString) return 0;
  const [bowledStr] = oversString.split("/");
  const val = parseFloat(bowledStr);
  return isNaN(val) ? 0 : val;
}

// -----------------------------
// Fixture item for the "Fixtures" tab
// -----------------------------
function MatchFixtureEle({ fixture }: { fixture: FixtureItem }) {
  // We'll treat T2 as the "opponent" for the UI.
  const opponentName = fixture?.t2Name || "Opponent";
  const opponentLogoObj = fixture?.t2Logo?.[0];
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
  const resultString = result?.title || "No result data";
  const isWin = result.lightswitch;
  const statusColor = isWin ? "rgb(110 198 170)" : "rgb(241 10 10)";

  const { runs: t1Runs, wickets: t1Wkts } = parseScore(result?.t1Score);
  const t1Ov = parseOvers(result?.t1Overs);
  const t1LogoObj = result?.teamOneLogo?.[0];
  const t1Logo = getFullImageUrl(t1LogoObj?.url);

  const { runs: t2Runs, wickets: t2Wkts } = parseScore(result?.t2Score);
  const t2Ov = parseOvers(result?.t2Overs);
  const t2LogoObj = result?.teamTwoLogo?.[0];
  const t2Logo = getFullImageUrl(t2LogoObj?.url);

  const matchDate = result?.date || "";

  return (
    <div className="MRE_ele flex_grid">
      <div className="main_teamInfo_parent">
        <div className="w-full my-auto">
          <div className="teamInfo_parent flex_grid">
            {/* ---------- Team 1 Info ---------- */}
            <div className="team_info won_team_info flex_grid">
              <div className="score_board">
                <div className="runs_wickets_info">
                  <p className="roboto-condensed-bold p4">
                    {t1Runs}/{t1Wkts}
                  </p>
                </div>
                <div className="overs_info">
                  <p className="roboto-condensed-regular p6">
                    {t1Ov.toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="team_info_logo">
                <Image
                  src={t1Logo}
                  alt="Team 1 Logo"
                  width={24}
                  height={24}
                  unoptimized={true}
                />
              </div>
            </div>

            <div className="w-[6%] flex">
              <p className="white_color roboto-condensed-regular p6 my-auto">
                Vs
              </p>
            </div>

            {/* ---------- Team 2 Info ---------- */}
            <div className="team_info lost_team_info flex_grid">
              <div className="team_info_logo">
                <Image
                  src={t2Logo}
                  alt="Team 2 Logo"
                  width={24}
                  height={24}
                  unoptimized={true}
                />
              </div>
              <div className="score_board">
                <div className="runs_wickets_info">
                  <p className="roboto-condensed-bold p4">
                    {t2Runs}/{t2Wkts}
                  </p>
                </div>
                <div className="overs_info">
                  <p className="roboto-condensed-regular p6">
                    {t2Ov.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Result Status ---------- */}
          <div className="result_status">
            <p
              className="roboto-condensed-regular p6"
              style={{ color: statusColor }}
            >
              {resultString}
            </p>
          </div>
        </div>
      </div>
      <MatchDate>{matchDate}</MatchDate>
    </div>
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
            <Stagger className="fixtures_container flex_grid">
              {fixtures.slice(0, fixtureCount).map((fixture) => (
                <StaggerItem key={fixture.id} hover>
                  <MatchFixtureEle fixture={fixture} />
                </StaggerItem>
              ))}
            </Stagger>
          </TabPanel>
        )}

        {hasResults && (
          <TabPanel>
            <Stagger>
              {results.slice(0, resultsCount).map((result) => (
                <StaggerItem key={result.id} hover>
                  <MatchResultEle result={result} />
                </StaggerItem>
              ))}
            </Stagger>
          </TabPanel>
        )}
      </Tabs>
    </div>
  );
}
