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
      className="rounded-lg overflow-hidden relative transition-all duration-500 ease-in-out text-black !bg-[url('/images/carg_bg.jpg')] !bg-cover bg-no-repeat"
      style={{
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.1),' +
          '0 8px 16px rgba(0,0,0,0.1), 0 16px 32px rgba(0,0,0,0.1), 0 32px 64px rgba(0,0,0,0.1),' +
          'inset 0 2px 3px rgba(255,255,255,0.95), inset 0 -2px 3px rgba(0,0,0,0.25)',
        transform: isActive ? 'translateY(-12.5%)' : 'none',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'linear-gradient(135deg, #E8E8E8 0%, #AFAFAF 100%)'
      }}
    >
      <div className="px-[4%] py-[4%] flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-80 pointer-events-none"></div>
        <MatchDate className="mx-auto">
          {formatMatchDate(fixture.date)}
        </MatchDate>
        <div className="text-center mt-[1%]">
          <p className="roboto-condensed-regular p3">{fixture.title}</p>
        </div>
        <div className="flex items-center justify-around my-4">
          <div className="w-[32%] flex items-center justify-center">
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
          <div className="w-[32%] flex items-center justify-center">
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
