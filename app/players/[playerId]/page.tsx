"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PlayerProfileSkeleton } from "../../components/skeletons/PageSkeletons";

interface BattingRow {
  format: string;
  matches: number;
  innings: number;
  runs: number;
  highestScore: number;
  average: string;
  strikeRate: string;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
}
interface BowlingRow {
  format: string;
  matches: number;
  innings: number;
  overs: string;
  runs: number;
  wickets: number;
  maidens: number;
  average: string;
  economy: string;
  fourWickets: number;
  fiveWickets: number;
}
interface Profile {
  playerId: number;
  name: string;
  photo: string;
  role: string;
  bio: { battingStyle: string; bowlingStyle: string; age: number | null } | null;
  season: { matches: number; runs: number; highestScore: number; sixes: number; wickets: number };
  careerBatting: BattingRow[];
  careerBowling: BowlingRow[];
  error?: string;
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-gradient-to-b from-[#1b1f2b] to-[#10131c] rounded-[2vw] lg:rounded-[0.6vw] p-[4vw] lg:p-[1.2vw] border border-[#D2A357]/20 text-center">
      <p className="oswald-bold text-[#D2A357] text-[7vw] lg:text-[2vw] leading-none">{value}</p>
      <p className="roboto-condensed-bold text-[#cfcfcf] uppercase tracking-wider text-[2.6vw] lg:text-[0.72vw] mt-[1.5vw] lg:mt-[0.4vw]">
        {label}
      </p>
    </div>
  );
}
function Th({ children }: { children: ReactNode }) {
  return (
    <th className="roboto-condensed-bold text-[#D2A357] uppercase text-left px-[2vw] lg:px-[0.7vw] py-[2vw] lg:py-[0.6vw] text-[2.6vw] lg:text-[0.78vw] whitespace-nowrap">
      {children}
    </th>
  );
}
function Td({ children, lead = false }: { children: ReactNode; lead?: boolean }) {
  return (
    <td
      className={`px-[2vw] lg:px-[0.7vw] py-[2vw] lg:py-[0.55vw] text-[2.8vw] lg:text-[0.85vw] whitespace-nowrap ${
        lead ? "roboto-condensed-bold text-white" : "roboto-condensed-regular text-[#d8d8d8]"
      }`}
    >
      {children}
    </td>
  );
}

export default function PlayerProfile() {
  const params = useParams();
  const id = Array.isArray(params?.playerId) ? params.playerId[0] : params?.playerId;
  const [p, setP] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/player/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setP(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <PlayerProfileSkeleton />;
  if (!p || p.error)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="roboto-condensed-regular text-white p3">Player profile unavailable.</p>
        <Link href="/players" className="roboto-condensed-bold text-[#D2A357] uppercase hover:underline">
          ← All Players
        </Link>
      </div>
    );

  return (
    <section className="base_paddings py-[8vw] lg:py-[3vw]">
      <div className="max_content center_aligned mx-auto">
        <Link
          href="/players"
          className="roboto-condensed-bold text-[#D2A357] text-[3.4vw] lg:text-[0.9vw] uppercase tracking-wider hover:underline"
        >
          ← All Players
        </Link>

        {/* Hero */}
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-[5vw] lg:gap-[2vw] mt-[5vw] lg:mt-[1.5vw] mb-[8vw] lg:mb-[2.5vw] bg-gradient-to-r from-[#10131c] to-[#181c28]/40 rounded-[3vw] lg:rounded-[0.8vw] border border-[#D2A357]/20 p-[6vw] lg:p-[2vw]">
          <div className="relative w-[42vw] h-[42vw] lg:w-[12vw] lg:h-[12vw] rounded-[2vw] lg:rounded-[0.6vw] overflow-hidden ring-2 ring-[#D2A357] shrink-0 bg-[#222]">
            <Image
              src={p.photo || "/images/sample_player_image.png"}
              alt={p.name}
              fill
              sizes="200px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="text-center lg:text-left flex-1">
            {p.role ? (
              <span className="inline-block roboto-condensed-bold uppercase text-black bg-gradient-to-b from-[#8F5F1F] via-[#D4A845] to-[#8F5F1F] rounded-full px-[3vw] lg:px-[0.9vw] py-[1vw] lg:py-[0.2vw] text-[2.8vw] lg:text-[0.75vw] tracking-wider mb-[2vw] lg:mb-[0.6vw]">
                {p.role}
              </span>
            ) : null}
            <h1 className="oswald-bold text-white uppercase text-[8.5vw] lg:text-[3vw] leading-none">
              {p.name}
            </h1>
            <p className="roboto-condensed-regular text-[#9a9a9a] mt-[1.5vw] lg:mt-[0.4vw] text-[3.4vw] lg:text-[1vw]">
              Club Cricket of Chicago
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-[5vw] lg:gap-x-[1.6vw] gap-y-[1vw] mt-[3vw] lg:mt-[0.8vw] roboto-condensed-regular text-[#cfcfcf] text-[3vw] lg:text-[0.85vw]">
              {p.bio?.battingStyle ? (
                <span>
                  <span className="text-[#777]">Batting </span>
                  {p.bio.battingStyle}
                </span>
              ) : null}
              {p.bio?.bowlingStyle ? (
                <span>
                  <span className="text-[#777]">Bowling </span>
                  {p.bio.bowlingStyle}
                </span>
              ) : null}
              {p.bio?.age ? (
                <span>
                  <span className="text-[#777]">Age </span>
                  {p.bio.age}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Season */}
        <h2 className="oswald-bold text-white uppercase text-[5.5vw] lg:text-[1.6vw] mb-[3vw] lg:mb-[1vw]">
          Summer 2026 <span className="text-[#D2A357]">Season</span>
        </h2>
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-[2.5vw] lg:gap-[1vw] mb-[8vw] lg:mb-[2.5vw]">
          <Stat label="Matches" value={p.season.matches} />
          <Stat label="Runs" value={p.season.runs} />
          <Stat label="HS" value={p.season.highestScore} />
          <Stat label="Wickets" value={p.season.wickets} />
          <Stat label="Sixes" value={p.season.sixes} />
        </div>

        {/* Career batting */}
        {p.careerBatting.length > 0 ? (
          <>
            <h2 className="oswald-bold text-white uppercase text-[5.5vw] lg:text-[1.6vw] mb-[3vw] lg:mb-[1vw]">
              Career <span className="text-[#D2A357]">Batting</span>
            </h2>
            <div className="overflow-x-auto rounded-[2vw] lg:rounded-[0.6vw] border border-[#D2A357]/20 mb-[8vw] lg:mb-[2.5vw] bg-[#10131c]">
              <table className="min-w-full">
                <thead className="bg-[#181c28]">
                  <tr>
                    <Th>Format</Th>
                    <Th>Mat</Th>
                    <Th>Inns</Th>
                    <Th>Runs</Th>
                    <Th>HS</Th>
                    <Th>Avg</Th>
                    <Th>SR</Th>
                    <Th>50s</Th>
                    <Th>100s</Th>
                    <Th>4s</Th>
                    <Th>6s</Th>
                  </tr>
                </thead>
                <tbody>
                  {p.careerBatting.map((b, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <Td lead>{b.format}</Td>
                      <Td>{b.matches}</Td>
                      <Td>{b.innings}</Td>
                      <Td lead>{b.runs}</Td>
                      <Td>{b.highestScore}</Td>
                      <Td>{b.average}</Td>
                      <Td>{b.strikeRate}</Td>
                      <Td>{b.fifties}</Td>
                      <Td>{b.hundreds}</Td>
                      <Td>{b.fours}</Td>
                      <Td>{b.sixes}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {/* Career bowling */}
        {p.careerBowling.length > 0 ? (
          <>
            <h2 className="oswald-bold text-white uppercase text-[5.5vw] lg:text-[1.6vw] mb-[3vw] lg:mb-[1vw]">
              Career <span className="text-[#D2A357]">Bowling</span>
            </h2>
            <div className="overflow-x-auto rounded-[2vw] lg:rounded-[0.6vw] border border-[#D2A357]/20 bg-[#10131c]">
              <table className="min-w-full">
                <thead className="bg-[#181c28]">
                  <tr>
                    <Th>Format</Th>
                    <Th>Mat</Th>
                    <Th>Inns</Th>
                    <Th>Overs</Th>
                    <Th>Runs</Th>
                    <Th>Wkts</Th>
                    <Th>Avg</Th>
                    <Th>Econ</Th>
                    <Th>4w</Th>
                    <Th>5w</Th>
                  </tr>
                </thead>
                <tbody>
                  {p.careerBowling.map((b, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <Td lead>{b.format}</Td>
                      <Td>{b.matches}</Td>
                      <Td>{b.innings}</Td>
                      <Td>{b.overs}</Td>
                      <Td>{b.runs}</Td>
                      <Td lead>{b.wickets}</Td>
                      <Td>{b.average}</Td>
                      <Td>{b.economy}</Td>
                      <Td>{b.fourWickets}</Td>
                      <Td>{b.fiveWickets}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
