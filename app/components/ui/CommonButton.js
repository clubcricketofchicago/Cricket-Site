'use client'

import { useRouter } from 'next/navigation'

export default function CommonButton({ children, setRoutePath, className = '' }) {
  const router = useRouter()

  function handleClick() {
    router.push(setRoutePath)
  }

  return (
    <div className={`mt-6 ${className}`}>
      <button
        onClick={handleClick}
        className="text-[1.31rem] leading-[1.8rem] font-roboto-condensed font-bold px-8 py-2 text-black rounded-full shadow hover:scale-[1.05] transition-transform bg-gradient-to-b from-[#8F5F1F] via-[#D4A845] to-[#8F5F1F]"
      >
        {children}
      </button>
    </div>
  )
}
