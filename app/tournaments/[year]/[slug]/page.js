"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, notFound } from "next/navigation";

// Tournament data now comes from the local DB (Neon) via internal API routes
// (/api/tournaments and /api/tournaments/fixtures), shaped like the old CMS payload.

import LeagueLogoSlider from "../../../components/tournaments/LeagueLogoSlider";
import PlayerOfTheWeek from "../../../components/tournaments/PlayerOfTheWeek";
import LeagueHighlights from "../../../components/tournaments/LeagueHighlights";
import FixturesAndResults from "../../../components/tournaments/FixturesAndResults";
import NumberZone from "../../../components/tournaments/NumberZone";
import Image from "next/image";

const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || "";

function getFullImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${cmsBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function StandingListEle({ team }) {
  return (
    <div className="SListing_team_ele flex_grid">
      <div className="SListing_name flex_grid">
        <div className="team_ico">
          <Image
            src={getFullImageUrl(team.teamLogo?.[0]?.url)}
            alt={team.title || "Team Logo"}
            width={40}
            height={40}
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="team_name">
          <p className="roboto-condensed-regular light_grey p5 uppercase">
            {team.title || "Team"}
          </p>
        </div>
      </div>
      <div className="SListing_win">
        <p className="roboto-condensed-bold light_grey p5">{team.wins || 0}</p>
      </div>
      <div className="SListing_lose">
        <p className="roboto-condensed-bold light_grey p5">{team.loses || 0}</p>
      </div>
    </div>
  );
}

function LeagueStandings({ teamStandings }) {
  const hasTeams = teamStandings && teamStandings.length > 0;

  return (
    <div className="LT_gridEle LT_league_standings">
      <div className="standings_listing">
        <div className="standings_title">
          <p className="p4 grey_text roboto-condensed-bold">Standings</p>
        </div>

        <div className="SListing_header flex_grid">
          <div className="SListing_name">
            <p className="roboto-condensed-bold light_grey p5">Teams</p>
          </div>
          <div className="SListing_win">
            <p className="roboto-condensed-bold light_grey p5">W</p>
          </div>
          <div className="SListing_lose">
            <p className="roboto-condensed-bold light_grey p5">L</p>
          </div>
        </div>

        <div className="SListing_listing">
          {hasTeams ? (
            teamStandings.slice(0, 10).map((team) => (
              <StandingListEle key={team.id || Math.random().toString()} team={team} />
            ))
          ) : (
            <div className="p-4 text-center text-[#d8d8d8]">
              <p>No standings available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeagueStatsContainer() {
  const params = useParams();
  const router = useRouter();

  const [allTournaments, setAllTournaments] = useState([]);
  const [currentTournamentIndex, setCurrentTournamentIndex] = useState(0);
  const [tournamentData, setTournamentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fixtures, setFixtures] = useState([]);
  const [allFixtures, setAllFixtures] = useState({});

  const fetchFixturesForTournament = useCallback(
    async (tournament) => {
      console.log("fetchFixturesForTournament called with tournament slug:", tournament.slug);
      try {
        if (tournament.slug && allFixtures[tournament.slug]) {
          console.log("Already have fixtures stored for slug:", tournament.slug, allFixtures[tournament.slug]);
          return allFixtures[tournament.slug];
        }
        const res = await fetch(
          `/api/tournaments/fixtures?slug=${encodeURIComponent(tournament.slug)}`
        );
        const fixtureData = await res.json();
        console.log("Fixtures API response:", fixtureData);
        const tournamentFixtures = (fixtureData && fixtureData.entries.filter(entry => entry.mappedSeries && entry.mappedSeries.length > 0)) || [];
        if (tournament.slug) {
          setAllFixtures((prev) => ({
            ...prev,
            [tournament.slug]: tournamentFixtures,
          }));
        }
        return tournamentFixtures;
      } catch (e) {
        console.error("Failed to fetch fixtures:", e);
        return [];
      }
    },
    [allFixtures]
  );

  useEffect(() => {
    const { year, slug } = params || {};
    console.log("Initial data fetch useEffect triggered with params:", params);
    if (!year || !slug) {
      console.log("Either year or slug is missing; marking error as true.");
      setError(true);
      setLoading(false);
      return;
    }

    fetch("/api/tournaments")
      .then((r) => r.json())
      .then(async (data) => {
        console.log("Tournament page fetch response:", data);
        const allEntries = (data && data.entries) || [];
        const yearTournaments = allEntries.filter(
          (entry) =>
            entry.typeHandle === "tournamentPage" && entry.parent && entry.parent.slug === year
        );
        console.log("Filtered yearTournaments:", yearTournaments);
        if (yearTournaments.length === 0) {
          console.log("No tournaments found for given year:", year);
          setError(true);
          setLoading(false);
          return;
        }
        setAllTournaments(yearTournaments);
        const currentIndex = yearTournaments.findIndex((entry) => entry.slug === slug);
        if (currentIndex === -1) {
          console.log("No matching tournament found with slug:", slug);
          setError(true);
          setLoading(false);
          return;
        }
        setCurrentTournamentIndex(currentIndex);
        const currentTournament = yearTournaments[currentIndex];
        console.log("current Tournament:");
        console.log(currentTournament);
        setTournamentData(currentTournament);
        console.log("Current Tournament data:", currentTournament);
        const fetchedFixtures = await fetchFixturesForTournament(currentTournament);
        setFixtures(fetchedFixtures);
        console.log("Current Tournament Title:", currentTournament.title);
        console.log("Fixtures Data:", fetchedFixtures);
        console.log("Results Data:", currentTournament.resultCards || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Tournament page fetch error:", e);
        setError(true);
        setLoading(false);
      });
  }, [params, fetchFixturesForTournament]);

  const goToPrevTournament = useCallback(async () => {
    console.log("goToPrevTournament called");
    if (allTournaments.length <= 1) {
      console.log("There is only one tournament or none. Aborting prev nav.");
      return;
    }
    const newIndex = (currentTournamentIndex - 1 + allTournaments.length) % allTournaments.length;
    const prevTournament = allTournaments[newIndex];
    console.log("Navigating to previous tournament index:", newIndex);
    console.log("Previous tournament slug:", prevTournament.slug);
    setCurrentTournamentIndex(newIndex);
    setTournamentData(prevTournament);
    const { year } = params;
    if (year && prevTournament.slug) {
      router.push(`/tournaments/${year}/${prevTournament.slug}`, { scroll: false });
    }
    const fetchedFixtures = await fetchFixturesForTournament(prevTournament);
    setFixtures(fetchedFixtures);
    console.log("Previous Tournament:", prevTournament.title);
    console.log("Updated Fixtures Data:", fetchedFixtures);
    console.log("Updated Results Data:", prevTournament.resultCards || []);
  }, [allTournaments, currentTournamentIndex, params, router, fetchFixturesForTournament]);

  const goToNextTournament = useCallback(async () => {
    console.log("goToNextTournament called");
    if (allTournaments.length <= 1) {
      console.log("There is only one tournament or none. Aborting next nav.");
      return;
    }
    const newIndex = (currentTournamentIndex + 1) % allTournaments.length;
    const nextTournament = allTournaments[newIndex];
    console.log("Navigating to next tournament index:", newIndex);
    console.log("Next tournament slug:", nextTournament.slug);
    setCurrentTournamentIndex(newIndex);
    setTournamentData(nextTournament);
    const { year } = params;
    if (year && nextTournament.slug) {
      router.push(`/tournaments/${year}/${nextTournament.slug}`, { scroll: false });
    }
    const fetchedFixtures = await fetchFixturesForTournament(nextTournament);
    setFixtures(fetchedFixtures);
    console.log("Next Tournament:", nextTournament.title);
    console.log("Updated Fixtures Data:", fetchedFixtures);
    console.log("Updated Results Data:", nextTournament.resultCards || []);
  }, [allTournaments, currentTournamentIndex, params, router, fetchFixturesForTournament]);

  if (loading) {
    console.log("Page is loading; returning null.");
    return null;
  }
  if (error || !tournamentData) {
    console.log("Error or missing tournamentData; rendering notFound().");
    return notFound();
  }

  return (
    <>
      <section className="LSC_container base_paddings">
        <div className="LSC_parent center_aligned flex_grid">
          <div className="LSC_smallCol_grid">
            <div className="NewLeague_pag_icon_container">
              <div className="flex">
                <div className="NewLeague_pag_icon prev_icon cursor-pointer" onClick={goToPrevTournament}>
                  <Image
                    src="/images/slide_pag_ico.png"
                    alt="Previous Tournament"
                    width={30}
                    height={30}
                    unoptimized
                  />
                </div>
                <div className="NewLeague_pag_icon next_icon cursor-pointer" onClick={goToNextTournament}>
                  <Image
                    src="/images/slide_pag_ico.png"
                    alt="Next Tournament"
                    width={30}
                    height={30}
                    unoptimized
                  />
                </div>
              </div>
            </div>

            <LeagueLogoSlider
              flagImage={getFullImageUrl(tournamentData.flagImage?.[0]?.url)}
            />

            <LeagueStandings teamStandings={tournamentData.teamStandings || []} />
          </div>

          <div className="LSC_BigCol_grid">
            <PlayerOfTheWeek
              batsmanName={tournamentData.batsmanName}
              batsmanImage={getFullImageUrl(tournamentData.batsmanImage?.[0]?.url)}
              batsmanLabel={tournamentData.batsmanLabel}
              batsmanValue={tournamentData.batsmanValue}
              bowlerName={tournamentData.bowlerName}
              bowlerImage={getFullImageUrl(tournamentData.bowlerImage?.[0]?.url)}
              bowlerCardLabel={tournamentData.bowlerCardLabel}
              bowlerValue={tournamentData.bowlerValue}
            />
            <LeagueHighlights
              leagueStats={tournamentData.leagueStats}
              topPlayers={tournamentData.topPlayers}
              teamBatting={tournamentData.teamBatting}
              teamBowling={tournamentData.teamBowling}
            />
          </div>

          <div className="LSC_smallCol_grid">
            <FixturesAndResults
              fixtureCount={7}
              resultsCount={7}
              fixtures={fixtures}
              results={tournamentData.resultCards || []}
            />
          </div>
        </div>

        <NumberZone
          battingNumberZone={tournamentData.battingNumberZone}
          bowlingNumberZone={tournamentData.bowlingNumberZone}
          fieldingNumberZone={tournamentData.fieldingNumberZone}
          rankingZone={tournamentData.rankingZone}
        />
      </section>
    </>
  );
}
