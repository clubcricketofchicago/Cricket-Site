'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LogoContainer({ href, imageUrl, className = '', width }) {
  const router = useRouter()

  const handleClick = () => {
    if (href.includes('http')) {
      window.open(href, '_self')
    } else {
      router.push(href)
    }
  }

  return (
    <div
      className={`logo_container ${className}`.trim()}
      style={{ width }}
      onClick={handleClick}
    >
      <Image
        src={`/images/${imageUrl}`}
        alt="Logo"
        width={160}
        height={80}
        priority
        className="w-full h-auto object-contain"
      />
    </div>
  )
}
