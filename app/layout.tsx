'use client'

// export const dynamic = 'force-dynamic';


import { ReactNode } from 'react'

import HeaderNavPanel from './components/ui/HeaderNavPanel'
import FooterPanel from './components/ui/FooterPanel'
import './globals.css'


export default function RootLayout({ children }: { children: ReactNode }) {
  
  
  return (
    <html lang="en">
      <head>
        <title>Club Cricket of Chicago | Discover Competitive Cricket</title>
        <link rel="icon" href="/images/favicon.ico"/>
        <meta
          name="description"
          content="Welcome to Club Cricket of Chicago, your home for cricket in the Windy City. Join us and discover the joy of competitive cricket."
        />
      </head>
      <body >
        <div className="w-full h-full bg-[url('/images/bg-patterns/bg_pattern_min_1.png')] bg-repeat-y bg-[100%] bg-[length:100%]">
          <HeaderNavPanel />
         
            {children}
         
          <FooterPanel />
        </div>
      </body>
    </html>
  )
}
