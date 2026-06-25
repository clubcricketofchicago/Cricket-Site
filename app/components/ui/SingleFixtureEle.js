'use client'

import { format } from 'date-fns'
import Image from 'next/image'
import MatchDate from './MatchDate'
import MatchLocation from './MatchLocation'

export default function SingleFixtureEle({ fixture, isActive = false, cmsBaseUrl = 'http://cms.ccc.clubcricketofchicago.com/' }) {
  const formatMatchDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy')
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }

  const getFullImageUrl = (url) => {
    if (!url) return '/images/default-team-logo.png'
    if (url.startsWith('http')) return url

    const cleanUrl = url.startsWith('/') ? url.slice(1) : url
    const baseUrl = cmsBaseUrl.endsWith('/') ? cmsBaseUrl : `${cmsBaseUrl}/`
    return `${baseUrl}${cleanUrl}`
  }

  return (
    <div
      className="ccc-card rounded-lg overflow-hidden relative transition-all duration-500 ease-in-out text-[color:var(--text)]"
      style={{
        transform: isActive ? 'translateY(-12.5%)' : 'none'
      }}
    >
      <div className="px-[4%] py-[4%] flex flex-col relative">
        <MatchDate className="mx-auto">
          {formatMatchDate(fixture.date)}
        </MatchDate>
        <div className="text-center mt-[1%]">
          <p className="roboto-condensed-regular p3">{fixture.title}</p>
        </div>
        <div className="flex items-center justify-around my-4">
          <div className="w-[32%] max-w-[92px] flex items-center justify-center">
            <Image
              src={getFullImageUrl(fixture.t1Logo?.[0]?.url)}
              alt={fixture.t1Logo?.[0]?.alt || fixture.t1Name}
              width={64}
              height={64}
              className="max-w-full max-h-full w-full h-auto rounded-full"
              unoptimized={true}
            />
          </div>
          <div className="mx-2">
            <p className="roboto-condensed-bold p1">VS</p>
          </div>
          <div className="w-[32%] max-w-[92px] flex items-center justify-center">
            <Image
              src={getFullImageUrl(fixture.t2Logo?.[0]?.url)}
              alt={fixture.t2Logo?.[0]?.alt || fixture.t2Name}
              width={64}
              height={64}
              className="max-w-full max-h-full w-full h-auto rounded-full"
              unoptimized={true}
            />
          </div>
        </div>
        <MatchLocation className="mx-auto">
          {fixture.groundsName}
        </MatchLocation>
      </div>
    </div>
  )
}
