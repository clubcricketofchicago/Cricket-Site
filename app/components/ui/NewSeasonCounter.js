'use client'

import CommonButton from './CommonButton'
import TimeCounter from './TimeCounter'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function NewSeasonCounter({ data, nextMatch }) {
  const { title, counterDate, CTA, convertedCTA, convertedHyperlink, CMTextArea } = data

  // Prefer counting down to the next real fixture (from the DB) over the CMS counterDate.
  const matchIso =
    nextMatch?.date && new Date(nextMatch.date) >= new Date() ? nextMatch.date : null

  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 400], [0, -100])

  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || 'https://cms-ccc.ddev.site/'

  const getFullImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url
    const baseUrl = cmsBaseUrl.endsWith('/') ? cmsBaseUrl : `${cmsBaseUrl}/`
    return `${baseUrl}${cleanUrl}`
  }

  let backgroundImage = '/images/placeholder_banner_bg.jpg'
  if (data?.backgroundImage && data.backgroundImage[0]?.url) {
    backgroundImage = getFullImageUrl(data.backgroundImage[0].url)
  } else if (data?.bgImage && data.bgImage[0]?.url) {
    backgroundImage = getFullImageUrl(data.bgImage[0].url)
  } else if (data?.bannerImage && data.bannerImage[0]?.url) {
    backgroundImage = getFullImageUrl(data.bannerImage[0].url)
  }

  const isFutureDate = matchIso ? true : new Date(counterDate) >= new Date()

  const displayTitle = isFutureDate
    ? title.split('\n').map((line, index) => (
        <span key={index}>
          {line}
          <br />
        </span>
      ))
    : CMTextArea.split('\n').map((line, index) => (
        <span key={index}>
          {line}
          <br />
        </span>
      ))

  const displayCTA = isFutureDate ? CTA : convertedCTA
  const displayHyperlink = isFutureDate
    ? (data.hyperlink && data.hyperlink.url) || '#'
    : (convertedHyperlink && convertedHyperlink.url) || '#'

  return (
    <section
      className="parallax-section"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <motion.div className="content w-[90%] lg:w-[60%] mt-[10%]" style={{ y }}>
        <h4 className="title oswald-semi-bold h1">{displayTitle}</h4>
        <TimeCounter matchDate={matchIso || counterDate} matchTime="12:00 PM" className="my-[5.5%]" />
        <CommonButton setRoutePath={displayHyperlink}>
          {displayCTA}
        </CommonButton>
      </motion.div>
    </section>
  )
}
