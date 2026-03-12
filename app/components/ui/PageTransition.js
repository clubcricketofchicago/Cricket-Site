'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PageTransition({ children }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState("fadeIn")

  useEffect(() => {
    // Safely access children props; if not present, default to null
    const currentChildPath = displayChildren && displayChildren.props ? displayChildren.props.pathname : null
    if (pathname !== currentChildPath) {
      setTransitionStage("fadeOut")
      const timeout = setTimeout(() => {
        setDisplayChildren(children)
        setTransitionStage("fadeIn")
      }, 300) // Duration matches CSS transition

      return () => clearTimeout(timeout)
    }
  }, [pathname, children, displayChildren])

  return (
    <div className={`transition-wrapper ${transitionStage}`}>
      {displayChildren}
    </div>
  )
}
