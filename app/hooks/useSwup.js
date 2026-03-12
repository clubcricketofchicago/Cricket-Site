'use client'

import { useEffect } from 'react'
import Swup from 'swup'
import SwupScrollPlugin from '@swup/scroll-plugin'
import SwupFadeTheme from '@swup/fade-theme'

export default function useSwup() {
  useEffect(() => {
    const swup = new Swup({
      plugins: [
        new SwupScrollPlugin(),
        new SwupFadeTheme()
      ],
      animationSelector: '[class*="transition-"]'
    })

    return () => swup.destroy()
  }, [])

  return null
}
