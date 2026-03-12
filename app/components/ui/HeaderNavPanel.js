"use client"

import LogoContainer from './LogoContainer'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { fetchGraphQL } from '/app/lib/graphqlClient'
import { getNavigationConfig } from '/app/lib/queries/navigationQuery'
import Image from 'next/image'

function NavEleIco({ iconData }) {
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || 'https://cms-ccc.ddev.site/'

  const getFullImageUrl = (url) => {
    if (url?.startsWith('http') || url?.startsWith('/images')) return url
    const cleanUrl = url?.startsWith('/') ? url.substring(1) : url
    const baseUrl = cmsBaseUrl.endsWith('/') ? cmsBaseUrl : `${cmsBaseUrl}/`
    return `${baseUrl}${cleanUrl}`
  }

  return (
    <Image
      src={getFullImageUrl(iconData.url)}
      alt={iconData.alt || iconData.title || ''}
      className="nav_eleIco"
      width={40}
      height={40}
      unoptimized
    />
  )
}

function NavEle({ navItem, setNewTab }) {
  const hasIcon = navItem.navigationIcon && navItem.navigationIcon.length > 0
  const imageEle = hasIcon ? <NavEleIco iconData={navItem.navigationIcon[0]} /> : <></>
  const target = setNewTab || navItem.hyperlink.url.startsWith('http') ? '_blank' : undefined

  return (
    <div className="nav_ele flex_grid">
      <div className="nav_ele_text">
        <Link href={navItem.hyperlink.url} target={target} className="no_underline p2">
          {navItem.title}
        </Link>
      </div>
      {imageEle}
    </div>
  )
}

function NavEleBtn({ navItem }) {
  return (
    <div className="nav_ele">
      <Link href={navItem.hyperlink.url}>
        <button className="nav_ele_btn">
          <p className="roboto-condensed-med p2">{navItem.title}</p>
        </button>
      </Link>
    </div>
  )
}

function NavContainer({ navigationItems }) {
  return (
    <div className="nav_container flex_grid">
      {navigationItems.map((item) => {
        if (item.buttonToggle) {
          return <NavEleBtn key={item.id} navItem={item} />
        } else {
          return <NavEle key={item.id} navItem={item} />
        }
      })}
    </div>
  )
}

function MobileNav() {
  const HandleHamClick = () => {
    const ele = document.getElementById('mobNav_hamIcon')
    const mobEle = document.getElementById('mobileNav_ref')

    if (ele && mobEle) {
      if (ele.classList.contains('nav-open')) {
        ele.classList.remove('nav-open')
        mobEle.classList.remove('active_nav')
      } else {
        ele.classList.add('nav-open')
        mobEle.classList.add('active_nav')
      }
    }
  }

  return (
    <div className="mobile_nav_ele">
      <div id="mobNav_hamIcon" className="nav_burger mobile-only" onClick={HandleHamClick}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}

export default function HeaderNavPanel() {
  const headerRef = useRef(null)
  const [bgColor, setBgColor] = useState('unset')
  const [navigationItems, setNavigationItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const query = getNavigationConfig()
        const data = await fetchGraphQL(query)

        if (data && data.entries) {
          setNavigationItems(data.entries)
        } else {
          throw new Error('No navigation data returned from API')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchNavigation()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const elmnt = headerRef.current

      if (elmnt && window.scrollY > elmnt.offsetHeight && window.innerWidth > 1024) {
        elmnt.classList.add('active_header')
      } else if (elmnt) {
        setBgColor('unset')
        elmnt.classList.remove('active_header')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getFullUrl = (url) => {
    if (url?.startsWith('http')) return url
    if (url?.startsWith('/')) return url
    return `/${url}`
  }

  const buttonItem = navigationItems.find((item) => item.buttonToggle)

  return (
    <>
      <header ref={headerRef} className="main_header base_paddings" style={{ backgroundColor: bgColor }}>
        <div className="center_aligned flex_grid">
          <LogoContainer href="/" className="site_logo" imageUrl="logo.png" />
          {loading ? (
            <></>
          ) : error ? (
            <div>Error loading navigation: {error}</div>
          ) : (
            <NavContainer navigationItems={navigationItems} />
          )}
          <MobileNav />
        </div>
      </header>

      <div id="mobileNav_ref" className="mobile_navigation">
        <div className="mob_nav_parent">
          {loading ? (
            <></>
          ) : error ? (
            <></>
          ) : (
            <>
              {navigationItems
                .filter((item) => !item.buttonToggle)
                .map((item) => (
                  <div key={item.id} className="mob_nav_ele">
                    <Link
                      href={getFullUrl(item.hyperlink.url)}
                      target={item.hyperlink.url.startsWith('http') ? '_blank' : undefined}
                      className="roboto-condensed-regular no_underline p2 content_black"
                    >
                      {item.title}
                    </Link>
                  </div>
                ))}
              {buttonItem && (
                <div className="mob_nav_ele_btn">
                  <button className="nav_ele_btn roboto-condensed-med p2">
                    <Link href={getFullUrl(buttonItem.hyperlink.url)} className="roboto-condensed-regular no_underline p2">
                      {buttonItem.title}
                    </Link>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
