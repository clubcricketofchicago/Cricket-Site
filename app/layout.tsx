'use client'

import { ReactNode } from 'react'
import Script from 'next/script'
import { Saira_Condensed, Archivo } from 'next/font/google'

import HeaderNavPanel from './components/ui/HeaderNavPanel'
import FooterPanel from './components/ui/FooterPanel'
import './globals.css'

// Revamp 2026 — "Blue Hour / Chicago Dusk".
// New type pairing: Saira Condensed (athletic display) + Archivo (grotesque body).
// They are loaded into the legacy CSS variable names (--font-oswald / --font-roboto-condensed)
// so every existing typography class re-skins at once with no stale references.
const saira = Saira_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-oswald',
})
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-roboto-condensed',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${saira.variable} ${archivo.variable}`}>
      <head>
        <title>Club Cricket of Chicago | Discover Competitive Cricket</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Apply saved theme before paint to avoid a flash (default: dusk/dark). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('ccc-theme');document.documentElement.dataset.theme=(t==='light'?'light':'dark');}catch(e){document.documentElement.dataset.theme='dark';}})();",
          }}
        />
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="preconnect" href="https://media.cricclubs.com" crossOrigin="" />
        <meta
          name="description"
          content="Welcome to Club Cricket of Chicago, your home for cricket in the Windy City. Join us and discover the joy of competitive cricket."
        />
      </head>
      <body>
        {/* Google Analytics (GA4) — loaded after the page is interactive. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-R3N32PZ8ND"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-R3N32PZ8ND');`}
        </Script>
        <div className="site_shell">
          <HeaderNavPanel />
          {children}
          <FooterPanel />
        </div>
      </body>
    </html>
  )
}
