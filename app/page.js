"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import HeroBanner from "./components/ui/HeroBanner";
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

const HomePageContent = () => {
  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = getHomePageQuery();
    fetchGraphQL(query)
      .then((data) => {
        console.log("GraphQL API response:", data);
        setPageData(data);
      })
      .catch((err) => {
        console.error("Error fetching data from Craft CMS:", err);
        setError(err.message);
      });
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
            <Suspense key={block.id} fallback={<div className="loading-hero">Loading hero...</div>}>
              <HeroBanner data={block} />
            </Suspense>
          );
        case "fixturesGrid":
          console.log("Fixtures Grid Data:", block);
          return <FixturesGrid key={block.id} data={block} />;
        case "tournamentSection":
          return <TournamentSection key={block.id} data={block} />;
        case "timerBanner":
          return <NewSeasonCounter key={block.id} data={block} />;
        case "meetTheManagement":
          return <MeetSquad key={block.id} data={block} />;
        case "banner":
          return <BGParralaxBanner key={block.id} data={block} />;
        case "sponsorsBanner":
          return <SponsorsBanner key={block.id} data={block} />;
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
