"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Bat {
  name: string;
  dismissal: string;
  notOut: boolean;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: string;
}
interface Bowl {
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  wides: number;
  noBalls: number;
  econ: string;
}
interface Extras {
  b: number;
  lb: number;
  wd: number;
  nb: number;
  pn: number;
  total: number;
}
interface FoW {
  runs: number;
  wicket: number;
  over: string;
  player: string;
}
interface Innings {
  teamName: string;
  total: number;
  wickets: number;
  overs: string;
  runRate: string;
  extras: Extras;
  didNotBat: string[];
  fallOfWickets: FoW[];
  batting: Bat[];
  bowling: Bowl[];
}
interface MatchCard {
  matchId: number;
  found: boolean;
  teamOne: string;
  teamTwo: string;
  teamOneLogo: string;
  teamTwoLogo: string;
  result: string;
  date: string;
  seriesName: string;
  location: string;
  innings: Innings[];
  error?: string;
}

function Th({ children, right = false }: { children: ReactNode; right?: boolean }) {
  return (
    <th
      className={`roboto-condensed-bold text-[#D2A357] uppercase px-[2vw] lg:px-[0.7vw] py-[2vw] lg:py-[0.6vw] text-[2.5vw] lg:text-[0.74vw] whitespace-nowrap ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
function Num({ children, lead = false }: { children: ReactNode; lead?: boolean }) {
  return (
    <td
      className={`text-right px-[2vw] lg:px-[0.7vw] py-[2vw] lg:py-[0.5vw] text-[2.8vw] lg:text-[0.85vw] whitespace-nowrap ${
        lead ? "roboto-condensed-bold text-white" : "roboto-condensed-regular text-[#9a9a9a]"
      }`}
    >
      {children}
    </td>
  );
}

function InningsCard({ inn }: { inn: Innings }) {
  const ex = inn.extras;
  const exParts = [
    ["b", ex.b],
    ["lb", ex.lb],
    ["w", ex.wd],
    ["nb", ex.nb],
    ["p", ex.pn],
  ]
    .filter(([, v]) => (v as number) > 0)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  const fow = inn.fallOfWickets
    .map((f) => `${f.wicket}-${f.runs} (${f.player}${f.over ? `, ${f.over}` : ""})`)
    .join("   ");

  return (
    <div className="bg-[#10131c] rounded-[2.5vw] lg:rounded-[0.7vw] border border-[#D2A357]/20 overflow-hidden mb-[5vw] lg:mb-[1.6vw]">
      <div className="flex items-center justify-between bg-[#181c28] px-[4vw] lg:px-[1.3vw] py-[3vw] lg:py-[0.9vw]">
        <p className="roboto-condensed-bold text-white uppercase text-[4vw] lg:text-[1.1vw]">
          {inn.teamName}
        </p>
        <p className="oswald-bold text-[#D2A357] text-[5vw] lg:text-[1.5vw] leading-none">
          {inn.total}/{inn.wickets}
          <span className="roboto-condensed-regular text-[#9a9a9a] text-[3vw] lg:text-[0.8vw] ml-[1.5vw] lg:ml-[0.4vw]">
            ({inn.overs} ov)
          </span>
        </p>
      </div>

      {/* Batting */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/10">
              <Th>Batting</Th>
              <Th right>R</Th>
              <Th right>B</Th>
              <Th right>4s</Th>
              <Th right>6s</Th>
              <Th right>SR</Th>
            </tr>
          </thead>
          <tbody>
            {inn.batting.map((b, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="px-[2vw] lg:px-[0.7vw] py-[2vw] lg:py-[0.5vw]">
                  <p className="roboto-condensed-bold text-white text-[3.2vw] lg:text-[0.9vw]">
                    {b.name}
                    {b.notOut ? <span className="text-[#5fcf9e]"> *</span> : null}
                  </p>
                  <p className="roboto-condensed-regular text-[#7d7d7d] text-[2.6vw] lg:text-[0.72vw]">
                    {b.dismissal}
                  </p>
                </td>
                <Num lead>{b.runs}</Num>
                <Num>{b.balls}</Num>
                <Num>{b.fours}</Num>
                <Num>{b.sixes}</Num>
                <Num>{b.sr}</Num>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Extras + Total + DNB + FoW */}
      <div className="px-[4vw] lg:px-[1.3vw] py-[3vw] lg:py-[1vw] border-t border-white/10">
        <div className="flex justify-between items-baseline">
          <span className="roboto-condensed-regular text-[#cfcfcf] text-[3vw] lg:text-[0.85vw]">
            Extras
            {exParts ? (
              <span className="text-[#7d7d7d]"> ({exParts})</span>
            ) : null}
          </span>
          <span className="roboto-condensed-bold text-white text-[3.2vw] lg:text-[0.9vw]">
            {ex.total}
          </span>
        </div>
        <div className="flex justify-between items-baseline mt-[2vw] lg:mt-[0.6vw] pt-[2vw] lg:pt-[0.6vw] border-t border-white/10">
          <span className="roboto-condensed-bold text-white uppercase text-[3.2vw] lg:text-[0.95vw]">
            Total
            <span className="roboto-condensed-regular text-[#9a9a9a] normal-case">
              {" "}
              ({inn.overs} ov{inn.runRate ? `, RR ${inn.runRate}` : ""})
            </span>
          </span>
          <span className="oswald-bold text-[#D2A357] text-[4.5vw] lg:text-[1.3vw]">
            {inn.total}/{inn.wickets}
          </span>
        </div>
        {inn.didNotBat.length > 0 ? (
          <p className="roboto-condensed-regular text-[#9a9a9a] text-[2.8vw] lg:text-[0.8vw] mt-[3vw] lg:mt-[0.8vw]">
            <span className="text-[#7d7d7d]">Did not bat: </span>
            {inn.didNotBat.join(", ")}
          </p>
        ) : null}
        {fow ? (
          <p className="roboto-condensed-regular text-[#9a9a9a] text-[2.8vw] lg:text-[0.8vw] mt-[2vw] lg:mt-[0.5vw]">
            <span className="text-[#7d7d7d]">Fall of wickets: </span>
            {fow}
          </p>
        ) : null}
      </div>

      {/* Bowling */}
      {inn.bowling.length > 0 ? (
        <div className="overflow-x-auto border-t border-white/10">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10">
                <Th>Bowling</Th>
                <Th right>O</Th>
                <Th right>M</Th>
                <Th right>R</Th>
                <Th right>W</Th>
                <Th right>Econ</Th>
              </tr>
            </thead>
            <tbody>
              {inn.bowling.map((b, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="px-[2vw] lg:px-[0.7vw] py-[2vw] lg:py-[0.5vw] roboto-condensed-bold text-white text-[3.2vw] lg:text-[0.9vw]">
                    {b.name}
                  </td>
                  <Num>{b.overs}</Num>
                  <Num>{b.maidens}</Num>
                  <Num>{b.runs}</Num>
                  <Num lead>{b.wickets}</Num>
                  <Num>{b.econ}</Num>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default function MatchCentre() {
  const params = useParams();
  const id = Array.isArray(params?.matchId) ? params.matchId[0] : params?.matchId;
  const [m, setM] = useState<MatchCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/match/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setM(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="roboto-condensed-regular text-white p3">Loading scorecard…</p>
      </div>
    );
  if (!m || m.error || !m.found || m.innings.length === 0)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="roboto-condensed-regular text-white p3">Scorecard unavailable for this match.</p>
        <Link href="/" className="roboto-condensed-bold text-[#D2A357] uppercase hover:underline">
          ← Home
        </Link>
      </div>
    );

  return (
    <section className="base_paddings py-[8vw] lg:py-[3vw]">
      <div className="max_content center_aligned mx-auto">
        <div className="bg-gradient-to-r from-[#10131c] to-[#181c28]/40 rounded-[3vw] lg:rounded-[0.8vw] border border-[#D2A357]/20 p-[6vw] lg:p-[1.8vw] mb-[6vw] lg:mb-[2vw]">
          {m.seriesName ? (
            <p className="roboto-condensed-bold text-[#D2A357] uppercase tracking-wider text-[3vw] lg:text-[0.85vw] text-center mb-[3vw] lg:mb-[1vw]">
              {m.seriesName}
            </p>
          ) : null}
          <div className="flex items-center justify-center gap-[5vw] lg:gap-[2.5vw]">
            <div className="flex flex-col items-center gap-[2vw] lg:gap-[0.6vw] w-[30%]">
              <div className="relative w-[16vw] h-[16vw] lg:w-[4.5vw] lg:h-[4.5vw] rounded-full overflow-hidden bg-[#222]">
                <Image src={m.teamOneLogo || "/images/placeholder_logo.png"} alt={m.teamOne} fill sizes="72px" className="object-contain" unoptimized />
              </div>
              <p className="roboto-condensed-bold text-white text-center uppercase text-[3vw] lg:text-[0.9vw] leading-tight">
                {m.teamOne}
              </p>
            </div>
            <span className="oswald-bold text-[#D2A357] text-[5vw] lg:text-[1.6vw]">VS</span>
            <div className="flex flex-col items-center gap-[2vw] lg:gap-[0.6vw] w-[30%]">
              <div className="relative w-[16vw] h-[16vw] lg:w-[4.5vw] lg:h-[4.5vw] rounded-full overflow-hidden bg-[#222]">
                <Image src={m.teamTwoLogo || "/images/placeholder_logo.png"} alt={m.teamTwo} fill sizes="72px" className="object-contain" unoptimized />
              </div>
              <p className="roboto-condensed-bold text-white text-center uppercase text-[3vw] lg:text-[0.9vw] leading-tight">
                {m.teamTwo}
              </p>
            </div>
          </div>
          {m.result ? (
            <p className="roboto-condensed-bold text-[#5fcf9e] text-center text-[3.4vw] lg:text-[1vw] mt-[4vw] lg:mt-[1.2vw]">
              {m.result}
            </p>
          ) : null}
          <p className="roboto-condensed-regular text-[#9a9a9a] text-center text-[2.8vw] lg:text-[0.8vw] mt-[2vw] lg:mt-[0.5vw]">
            {[m.date, m.location].filter(Boolean).join(" · ")}
          </p>
        </div>

        {m.innings.map((inn, i) => (
          <InningsCard key={i} inn={inn} />
        ))}
      </div>
    </section>
  );
}
