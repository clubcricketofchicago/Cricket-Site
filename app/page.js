"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense, Fragment } from "react";
import HeroBanner from "./components/ui/HeroBanner";
import RecentResults from "./components/ui/RecentResults";
import NewSeasonCounter from "./components/ui/NewSeasonCounter";
import MeetSquad from "./components/ui/MeetSquad";
import BGParralaxBanner from "./components/ui/BGParralaxBanner";
import SponsorsBanner from "./components/ui/SponsorsBanner";
import FixturesGrid from "./components/ui/FixturesGrid";
import TournamentSection from "./components/ui/TournamentSection";
import { fetchGraphQL } from "./lib/graphqlClient";
import { getHomePageQuery } from "./lib/queries/homePageQuery";
import PageTransition from "./components/ui/PageTransition";
import HeroBannerSkeleton from "./components/skeletons/HeroBannerSkeleton";
import { Reveal } from "./components/motion";

const HomePageContent = () => {
  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState(null);
  // Upcoming fixtures + recent results come from the local DB (Neon); editorial stays on the CMS.
  const [dbFixtures, setDbFixtures] = useState(null);
  const [recentResults, setRecentResults] = useState(null);

  useEffect(() => {
    const query = getHomePageQuery();
    fetchGraphQL(query)
      .then((data) => {
        setPageData(data);
      })
      .catch((err) => {
        console.error("Error fetching data from Craft CMS:", err);
        setError(err.message);
      });

    fetch("/api/schedule")
      .then((r) => r.json())
      .then((d) => setDbFixtures(d.entries || []))
      .catch(() => setDbFixtures([]));

    fetch("/api/recent-results")
      .then((r) => r.json())
      .then((d) => setRecentResults(d.results || []))
      .catch(() => setRecentResults([]));
  }, []);

  if (error) {
    return <div className="error-message">Error loading content: {error}</div>;
  }

  // Render the blocks or skeletons
  const renderComponents = () => {
    if (
      !pageData ||
      !pageData.entries ||
      !pageData.entries[0] ||
      !pageData.entries[0].homePageBlocks
    ) {
      return (
        <>
          <HeroBannerSkeleton />
          {/* ...other skeletons if needed */}
        </>
      );
    }

    return pageData.entries[0].homePageBlocks.map((block) => {
      switch (block.typeHandle) {
        case "homeHeroBanner":
          return (
            <Reveal key={block.id}>
              <Suspense fallback={<div className="loading-hero">Loading hero...</div>}>
                <HeroBanner data={block} />
              </Suspense>
            </Reveal>
          );
        case "fixturesGrid":
          return (
            <Fragment key={block.id}>
              <Reveal>
                <FixturesGrid
                  data={{
                    ...block,
                    fixturesEntries: dbFixtures ?? block.fixturesEntries,
                  }}
                />
              </Reveal>
              <Reveal>
                <RecentResults results={recentResults ?? []} />
              </Reveal>
            </Fragment>
          );
        case "tournamentSection":
          return (
            <Reveal key={block.id}>
              <TournamentSection data={block} />
            </Reveal>
          );
        case "timerBanner":
          return (
            <Reveal key={block.id}>
              <NewSeasonCounter data={block} />
            </Reveal>
          );
        case "meetTheManagement":
          return (
            <Reveal key={block.id}>
              <MeetSquad data={block} />
            </Reveal>
          );
        case "banner":
          return (
            <Reveal key={block.id}>
              <BGParralaxBanner data={block} />
            </Reveal>
          );
        case "sponsorsBanner":
          return (
            <Reveal key={block.id}>
              <SponsorsBanner data={block} />
            </Reveal>
          );
        default:
          return <></>;
      }
    });
  };

  return renderComponents();
};

export default function Home() {
  return (
    <PageTransition>
      <section className="w-full h-full bg-repeat-y bg-[100%]">
        <HomePageContent />
      </section>
    </PageTransition>
  );
}
