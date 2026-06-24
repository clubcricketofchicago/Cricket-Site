'use client';

import { useEffect, useState } from 'react';
import SectionTitleEle from '../../components/ui/SectionTitleEle';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
        <h4 className="roboto-condensed-med p1 text-white text-center uppercase mt-[2%]">
          {seriesName}
        </h4>
      </Link>
    </div>
  );
}

export default function Page() {
  
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('Series');
  const pathname = usePathname();
  const currentSlug = pathname.split('/').pop();

  useEffect(() => {
    fetch('/api/tournaments')
      .then((r) => r.json())
      .then((data) => {
        if (!data || !data.entries) return;

        const yearEntries = data.entries.filter(
          (entry) => entry.typeHandle === 'tournamentYearPage'
        );
        const tournamentEntries = data.entries.filter(
          (entry) => entry.typeHandle === 'tournamentPage'
        );

        const yearMatch = yearEntries.find((e) => e.slug === currentSlug);

        if (!yearMatch) {
          setTitle('No series found under this year');
          return;
        }

        const relatedTournaments = tournamentEntries.filter(
          (entry) => entry.parent && entry.parent.slug === currentSlug
          
        );

        if (!relatedTournaments.length) {
          setTitle('No series found under this year');
        } else {
          setEntries(relatedTournaments);
        }
      })
      .catch((err) => {
        console.error('Error fetching tournament data:', err);
        setTitle('Error loading series');
      });
  }, [currentSlug]);

  return (
    <section className="allPlayersPanel_header base_paddings">
      <div className="LSC_parent PlayersPage center_aligned px-[3.5%] py-[2%] bg-white/10 backdrop-blur-sm rounded-[2vw] pb-[6vw]">
        <SectionTitleEle>{title}</SectionTitleEle>
        <hr className="w-full h-[0.1vw] bg-[#FFFFFF] border-none" />
        <div className="grid grid-cols-4 gap-[8vw] mt-[5%]">
          {entries.map((entry) => (
            
            <SeriesCard
              key={entry.id}
              imageUrl={entry.flagImage[0]?.url ? getFullImageUrl(entry.flagImage[0]?.url) : '/images/logo.png'}
              seriesName={entry.title}
              hyperLink={`/tournaments/${currentSlug}/${entry.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
