'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react'
import { fetchGraphQL } from '../lib/graphqlClient'
import { getCCCAcademyQuery } from '../lib/queries/academyQuery'
import HeroBanner from '../components/ui/HeroBanner'
import NewSeasonCounter from '../components/ui/NewSeasonCounter'
import MeetSquad from '../components/ui/MeetSquad'
import BGParralaxBanner from '../components/ui/BGParralaxBanner'
import SponsorsBanner from '../components/ui/SponsorsBanner'
import FixturesGrid from '../components/ui/FixturesGrid'
import TournamentSection from '../components/ui/TournamentSection'
import HeroBannerSkeleton from '../components/skeletons/HeroBannerSkeleton'
import { Reveal } from '../components/motion'

const AcademyPageContent = () => {
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const query = getCCCAcademyQuery()
    fetchGraphQL(query)
      .then((data) => {
        setPageData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching data from Craft CMS:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (error) {
    return <div className="error-message">Error loading content: {error}</div>
  }

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
          {/* Add other skeleton components here */}
        </>
      )
    }

    return pageData.entries[0].homePageBlocks.map((block) => {
      switch (block.typeHandle) {
        case 'homeHeroBanner':
          return (
            <Reveal key={block.id}>
              <Suspense fallback={<div className="loading-hero">Loading hero...</div>}>
                <HeroBanner data={block} />
              </Suspense>
            </Reveal>
          )
        case 'fixturesGrid':
          return (
            <Reveal key={block.id}>
              <FixturesGrid data={block} />
            </Reveal>
          )
        case 'tournamentSection':
          return (
            <Reveal key={block.id}>
              <TournamentSection data={block} />
            </Reveal>
          )
        case 'timerBanner':
          return (
            <Reveal key={block.id}>
              <NewSeasonCounter data={block} />
            </Reveal>
          )
        case 'meetTheManagement':
          return (
            <Reveal key={block.id}>
              <MeetSquad data={block} />
            </Reveal>
          )
        case 'banner':
          return (
            <Reveal key={block.id}>
              <BGParralaxBanner data={block} />
            </Reveal>
          )
        case 'sponsorsBanner':
          return (
            <Reveal key={block.id}>
              <SponsorsBanner data={block} />
            </Reveal>
          )
        default:
          return null
      }
    })
  }

  return <>{loading ? <HeroBannerSkeleton /> : renderComponents()}</>
}

export default function Page() {
  return (
    <section className="w-full h-full bg-repeat-y bg-[100%]">
      <AcademyPageContent />
    </section>
  )
}
