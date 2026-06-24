'use client'

import { ReactNode } from 'react'
import { Oswald, Roboto_Condensed } from 'next/font/google'

import HeaderNavPanel from './components/ui/HeaderNavPanel'
import FooterPanel from './components/ui/FooterPanel'
import './globals.css'

// Self-hosted via next/font (no render-blocking Google Fonts request, less layout shift).
const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald',
})
const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-condensed',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${robotoCondensed.variable}`}>
      <head>
        <title>Club Cricket of Chicago | Discover Competitive Cricket</title>
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="preconnect" href="https://media.cricclubs.com" crossOrigin="" />
        <meta
          name="description"
          content="Welcome to Club Cricket of Chicago, your home for cricket in the Windy City. Join us and discover the joy of competitive cricket."
        />
      </head>
      <body>
        <div className="w-full h-full bg-[url('/images/bg-patterns/bg_pattern_min_1.png')] bg-repeat-y bg-[100%] bg-[length:100%]">
          <HeaderNavPanel />
          {children}
          <FooterPanel />
        </div>
      </body>
    </html>
  )
}
