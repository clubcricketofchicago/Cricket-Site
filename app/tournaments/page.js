'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import SectionTitleEle from '../components/ui/SectionTitleEle';

import Image from 'next/image';
import Link from 'next/link';
// Tournaments list now comes from the local DB (Neon) via /api/tournaments (includes 2026).

const getFullImageUrl = (url) => {
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || 'https://cms-ccc.ddev.site/';
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  const baseUrl = cmsBaseUrl.endsWith('/') ? cmsBaseUrl : `${cmsBaseUrl}/`;
  return `${baseUrl}${cleanUrl}`;
};

function SeriesCard({ imageUrl, seriesName, hyperLink }) {
  return (
    <div className="w-full h-auto">
      <Link href={hyperLink}>
        <Image
          src={imageUrl}
          width={750}
          height={960}
          className="w-full h-auto object-contain"
          alt={`${seriesName} Flag Image`}
          unoptimized
        />
        <h4 className="roboto-condensed-med p1 text-white text-center uppercase mt-[4%]">
          {seriesName}
        </h4>
      </Link>
    </div>
  );
}

export default function Page() {
  const [groupedTournaments, setGroupedTournaments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/tournaments')
      .then((r) => r.json())
      .then((data) => {
        if (!data?.entries) return;

        const yearEntries = data.entries.filter(
          (entry) => entry.typeHandle === 'tournamentYearPage'
        );
        const tournamentEntries = data.entries.filter(
          (entry) => entry.typeHandle === 'tournamentPage'
        );

        const grouped = yearEntries.map((year) => {
          const relatedTournaments = tournamentEntries.filter(
            (entry) => entry.parent?.slug === year.slug
          );

          return {
            yearTitle: year.title,
            yearSlug: year.slug,
            tournaments: relatedTournaments,
          };
        });

        setGroupedTournaments(grouped);
      })
      .catch((err) => {
        console.error('Error fetching tournament data:', err);
        setError('Unable to load tournament data');
      });
  }, []);

  return (
    <section className="allPlayersPanel_header base_paddings">
      <div className="LSC_parent PlayersPage center_aligned px-[3.5%] py-[2%] bg-white/10 backdrop-blur-sm rounded-[2vw] pb-[6vw]">
        <SectionTitleEle>Tournaments</SectionTitleEle>
        <hr className="w-full h-[0.1vw] bg-[#FFFFFF] border-none mb-[2vw]" />
        {error ? (
          <p className="text-white text-center">{error}</p>
        ) : (
          groupedTournaments.map((group) => (
            <div key={group.yearSlug} className="mb-[4vw]">
              <h3 className="text-white h4 uppercase roboto-condensed-bold my-[4vh] lg:mt-[0] lg:mb-[2%]">
                {group.yearTitle}:
              </h3>
              {group.tournaments.length ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-[8vw]">
                  {group.tournaments.map((tournament) => (
                    <SeriesCard
                      key={tournament.id}
                      imageUrl={tournament.flagImage[0]?.url ? getFullImageUrl(tournament.flagImage[0]?.url) : '/images/logo.png'}
                      seriesName={tournament.title}
                      hyperLink={`/tournaments/${group.yearSlug}/${tournament.slug}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-white italic">No tournaments found under this year.</p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
