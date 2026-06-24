"use client";

import Image from "next/image";
import Link from "next/link";

export default function RecentResults({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <section className="base_paddings recentResults relative z-[8] py-[5%] lg:py-[3%]">
      <div className="max_content center_aligned mx-auto">
        <h2 className="text-center roboto-condensed-bold text-white uppercase text-[6vw] lg:text-[2.2vw] mb-[5%] lg:mb-[2.5%]">
          Recent Results
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[4vw] lg:gap-[1.5vw]">
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/match/${r.id}`}
              className="block bg-[#181c28] rounded-[3vw] lg:rounded-[0.8vw] p-[4vw] lg:p-[1.4vw] border border-[#D2A357]/30 transition-colors hover:border-[#D2A357]/70"
            >
              <div className="flex justify-between items-center mb-[4%]">
                <p className="roboto-condensed-regular text-[#D2A357] text-[3vw] lg:text-[0.85vw] truncate pr-2">
                  {r.seriesName}
                </p>
                <span
                  className={`roboto-condensed-bold text-white rounded-full px-[3vw] lg:px-[0.8vw] py-[0.4vw] text-[2.6vw] lg:text-[0.75vw] ${
                    r.cccWon ? "bg-[#2e8b6f]" : "bg-[#c0392b]"
                  }`}
                >
                  {r.cccWon ? "WON" : "LOST"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[3%] w-[44%]">
                  <Image
                    src={r.cccLogo || "/images/placeholder_logo.png"}
                    alt="Club Cricket of Chicago"
                    width={44}
                    height={44}
                    className="rounded-full object-contain w-[10vw] h-[10vw] lg:w-[2.6vw] lg:h-[2.6vw]"
                    unoptimized
                  />
                  <div className="min-w-0">
                    <p className="roboto-condensed-bold text-white text-[3.4vw] lg:text-[0.95vw]">
                      CCC
                    </p>
                    <p className="roboto-condensed-regular text-[#d8d8d8] text-[3vw] lg:text-[0.85vw]">
                      {r.cccScore}
                    </p>
                  </div>
                </div>

                <p className="roboto-condensed-bold text-[#D2A357] text-[3.4vw] lg:text-[1vw]">
                  vs
                </p>

                <div className="flex items-center gap-[3%] w-[44%] justify-end text-right">
                  <div className="min-w-0">
                    <p className="roboto-condensed-bold text-white text-[3.4vw] lg:text-[0.95vw] truncate">
                      {r.opponentName}
                    </p>
                    <p className="roboto-condensed-regular text-[#d8d8d8] text-[3vw] lg:text-[0.85vw]">
                      {r.oppScore}
                    </p>
                  </div>
                  <Image
                    src={r.opponentLogo || "/images/placeholder_logo.png"}
                    alt={r.opponentName}
                    width={44}
                    height={44}
                    className="rounded-full object-contain w-[10vw] h-[10vw] lg:w-[2.6vw] lg:h-[2.6vw]"
                    unoptimized
                  />
                </div>
              </div>

              {r.result && (
                <p className="roboto-condensed-regular text-[#d8d8d8] text-[2.8vw] lg:text-[0.8vw] mt-[4%] text-center">
                  {r.result}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
