"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

function SectionHeading({ children, sub }) {
  return (
    <div className="mb-[5vw] lg:mb-[1.6vw]">
      <div className="flex items-center gap-[3vw] lg:gap-[0.8vw]">
        <span className="inline-block w-[1.2vw] lg:w-[5px] h-[7vw] lg:h-[1.9vw] bg-[#D2A357] rounded-[2px]" />
        <h2 className="oswald-bold text-white uppercase text-[6.5vw] lg:text-[2vw] leading-none tracking-wide">
          {children}
        </h2>
      </div>
      {sub && (
        <p className="roboto-condensed-regular text-[#9a9a9a] mt-[2vw] lg:mt-[0.5vw] pl-[4.2vw] lg:pl-[1.5vw] text-[3.2vw] lg:text-[0.9vw]">
          {sub}
        </p>
      )}
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="relative bg-gradient-to-b from-[#1b1f2b] to-[#10131c] rounded-[3vw] lg:rounded-[0.7vw] p-[5vw] lg:p-[1.6vw] border border-[#D2A357]/20 overflow-hidden transition-colors hover:border-[#D2A357]/50">
      <span className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#8F5F1F] via-[#D4A845] to-[#8F5F1F]" />
      <p className="oswald-bold text-[#D2A357] text-[10vw] lg:text-[3vw] leading-none">
        {Number(value || 0).toLocaleString()}
      </p>
      <p className="roboto-condensed-bold text-[#cfcfcf] uppercase tracking-wider text-[3vw] lg:text-[0.85vw] mt-[2.5vw] lg:mt-[0.6vw]">
        {label}
      </p>
    </div>
  );
}

function PerformerList({ title, unit, players }) {
  if (!players || players.length === 0) return null;
  const [lead, ...rest] = players;
  return (
    <div className="bg-[#10131c] rounded-[3vw] lg:rounded-[0.7vw] border border-[#D2A357]/20 p-[5vw] lg:p-[1.6vw]">
      <p className="roboto-condensed-bold text-[#D2A357] uppercase tracking-wider text-[3.4vw] lg:text-[1vw] mb-[4vw] lg:mb-[1.2vw]">
        {title}
      </p>

      <div className="flex items-center gap-[4vw] lg:gap-[1vw] pb-[4vw] lg:pb-[1.1vw] mb-[3vw] lg:mb-[1vw] border-b border-white/10">
        <div className="relative w-[16vw] h-[16vw] lg:w-[4vw] lg:h-[4vw] rounded-full overflow-hidden ring-2 ring-[#D2A357] shrink-0 bg-[#222]">
          <Image
            src={lead.pic || "/images/sample_player_image.png"}
            alt={lead.name}
            fill
            sizes="64px"
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="roboto-condensed-bold text-white text-[4.2vw] lg:text-[1.15vw] truncate">
            {lead.name}
          </p>
          <p className="roboto-condensed-regular text-[#9a9a9a] text-[3vw] lg:text-[0.8vw]">
            Club Cricket of Chicago
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="oswald-bold text-[#D2A357] text-[8vw] lg:text-[2.4vw] leading-none">
            {lead.value}
          </p>
          <p className="roboto-condensed-regular text-[#9a9a9a] uppercase text-[2.4vw] lg:text-[0.7vw]">
            {unit}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-[2.5vw] lg:gap-[0.7vw]">
        {rest.map((p, i) => (
          <li key={i} className="flex items-center gap-[3vw] lg:gap-[0.8vw]">
            <span className="roboto-condensed-bold text-[#777] w-[5vw] lg:w-[1.4vw] text-center text-[3.2vw] lg:text-[0.9vw]">
              {i + 2}
            </span>
            <div className="relative w-[9vw] h-[9vw] lg:w-[2.2vw] lg:h-[2.2vw] rounded-full overflow-hidden shrink-0 bg-[#222]">
              <Image
                src={p.pic || "/images/sample_player_image.png"}
                alt={p.name}
                fill
                sizes="36px"
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="roboto-condensed-med text-[#e2e2e2] text-[3.4vw] lg:text-[0.95vw] truncate flex-1">
              {p.name}
            </p>
            <p className="oswald-regular text-white text-[3.8vw] lg:text-[1.05vw]">
              {p.value}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DivisionCard({ d }) {
  return (
    <Link href={`/tournaments/${d.year}/${d.slug}`} className="block group h-full">
      <div className="bg-[#10131c] rounded-[3vw] lg:rounded-[0.7vw] border border-[#D2A357]/20 p-[5vw] lg:p-[1.5vw] h-full transition-colors group-hover:border-[#D2A357]/60">
        <p className="roboto-condensed-bold text-white uppercase text-[3.8vw] lg:text-[1vw] leading-tight min-h-[2.4em]">
          {d.name}
        </p>
        <div className="flex items-end gap-[2vw] lg:gap-[0.5vw] mt-[3vw] lg:mt-[1vw]">
          <span className="oswald-bold text-[#D2A357] text-[11vw] lg:text-[3vw] leading-none">
            {d.position ? ordinal(d.position) : "—"}
          </span>
          {d.position ? (
            <span className="roboto-condensed-regular text-[#9a9a9a] text-[3vw] lg:text-[0.85vw] mb-[1vw] lg:mb-[0.3vw]">
              of {d.teams}
            </span>
          ) : null}
        </div>
        <div className="flex gap-[5vw] lg:gap-[1.4vw] mt-[3vw] lg:mt-[1vw] roboto-condensed-regular text-[#cfcfcf] text-[3vw] lg:text-[0.85vw]">
          <span>
            <span className="text-[#5fcf9e] roboto-condensed-bold">{d.won}</span> W
          </span>
          <span>
            <span className="text-[#e2685e] roboto-condensed-bold">{d.lost}</span> L
          </span>
          <span>
            <span className="text-white roboto-condensed-bold">{d.points}</span> Pts
          </span>
        </div>
        <p className="roboto-condensed-bold text-[#D2A357] text-[3vw] lg:text-[0.8vw] uppercase mt-[4vw] lg:mt-[1vw] tracking-wider group-hover:underline">
          View table →
        </p>
      </div>
    </Link>
  );
}

export default function HomeSeasonHub() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data || data.error) return null;
  const { season, stats, topBatsmen, topBowlers, divisions } = data;

  return (
    <section className="base_paddings py-[9vw] lg:py-[3vw] relative z-[6]">
      <div className="max_content center_aligned mx-auto">
        <SectionHeading sub={`${season} — so far`}>By the Numbers</SectionHeading>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[3vw] lg:gap-[1.2vw] mb-[11vw] lg:mb-[3.5vw]">
          <StatTile label="Matches" value={stats.matches} />
          <StatTile label="Runs" value={stats.runs} />
          <StatTile label="Wickets" value={stats.wickets} />
          <StatTile label="Sixes" value={stats.sixes} />
        </div>

        <SectionHeading sub="Club Cricket of Chicago leaders">
          Leading This Season
        </SectionHeading>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[4vw] lg:gap-[1.4vw] mb-[11vw] lg:mb-[3.5vw]">
          <PerformerList title="Most Runs" unit="Runs" players={topBatsmen} />
          <PerformerList title="Most Wickets" unit="Wkts" players={topBowlers} />
        </div>

        <SectionHeading sub="Where we stand">Our Divisions</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[4vw] lg:gap-[1.4vw]">
          {divisions.map((d) => (
            <DivisionCard key={d.slug} d={d} />
          ))}
        </div>
      </div>
    </section>
  );
}
