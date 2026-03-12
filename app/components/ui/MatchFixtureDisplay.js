'use client';

import { format } from 'date-fns';
import MatchLocation from './MatchLocation';
import MatchDate from './MatchDate';
import Image from 'next/image';

export default function MatchFixtureDisplay({ date, title, t1Logo, t2Logo, groundsName }) {
  const formatMatchDate = (dateString) => {
    try {
      const dt = new Date(dateString);
      return format(dt, 'dd MMM yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <div className="UMP_match_ele">
      <MatchDate className="mx-auto">{formatMatchDate(date)}</MatchDate>
      <div className="text-center mt-[1%]">
        <p className="roboto-condensed-regular p3">{title}</p>
      </div>
      <div className="flex items-center justify-between my-4">
        <div className="w-[32%] flex items-center justify-center">
          <Image 
            src={t1Logo.url}
            alt={t1Logo.alt || 'Team 1'}
            width={64}
            height={64}
            className="max-w-full max-h-full w-full h-auto rounded-full"
            unoptimized={true}
          />
        </div>
        <div className="mx-2">
          <p className="roboto-condensed-bold p1">VS</p>
        </div>
        <div className="w-[32%] flex items-center justify-center">
          <Image 
            src={t2Logo.url}
            alt={t2Logo.alt || 'Team 2'}
            width={64}
            height={64}
            className="max-w-full max-h-full w-full h-auto rounded-full"
            unoptimized={true}
          />
        </div>
      </div>
      <MatchLocation className="mx-auto">{groundsName}</MatchLocation>
    </div>
  );
}
