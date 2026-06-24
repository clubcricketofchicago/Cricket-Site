'use client'

import Image from 'next/image'

export default function MatchLocation({ className = '', logoWhite = false, children }) {
  let img_url = '/images/location.svg'
  if (logoWhite === true) {
    img_url = '/images/location_white.svg'
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-4 h-4 mr-2 flex-shrink-0">
        <Image
          src={img_url}
          alt="Location Icon"
          className="w-full h-full ccc-meta-ico"
          width={16}
          height={16}
          unoptimized
        />
      </div>
      <div className="overflow-hidden">
        <p className="roboto-condensed-regular p5 truncate">
          {children.substring(0, 24)}
        </p>
      </div>
    </div>
  )
}
