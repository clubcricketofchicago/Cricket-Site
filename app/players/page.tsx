'use client'


export const dynamic = 'force-dynamic';

import Image from 'next/image'
import SectionTitleEle from '../components/ui/SectionTitleEle'
import { useEffect, useState } from 'react'
// Roster now comes from the local DB (Neon) via /api/players (CCC's squad), shaped
// like the old CMS player payload. The "Show Full Stats" modal still uses the live
// CricClubs career stats via /api/player-stats.

// ------------------------------------
// Define interfaces for typed data
// ------------------------------------
interface PlayerImage {
  url: string
  alt?: string
}

interface Player {
  id: string
  title?: string
  country?: string
  teamName?: string
  // This is an array of images, each containing "url" and possibly "alt"
  playerImage?: PlayerImage[]
  nationalFlag?: PlayerImage[]
  jerseyNumber?: number
  matches?: number
  totalruns?: number
  wickets?: number
  scorebycaptain?: number
  playerid?: number
}



// GraphQL response for players
interface GraphQLPlayersResponse {
  entries: Player[]
}

// GraphQL response for configuration
interface PlayerConfigurationResponse {
  globalSet?: {
    lightswitch?: boolean
  }
}

/* ================= TYPES ================= */

interface BattingStat {
  seriesType: string;
  matches: number;
  innings: number;
  runsScored: number;
  highestScore: number;
  average: string;
  strikeRate: string;
  fours: number;
  sixers: number;
  fifties: number;
  hundreds: number;
}

interface BowlingStat {
  seriesType: string;
  matches: number;
  innings: number;
  overs: number | null;
  runsGiven: number;
  wickets: number;
  economy: string;
  maidens: number;
}

interface PlayerStats {
  battingStats: BattingStat[];
  bowlingStats: BowlingStat[];
}



function getFullImageUrl(url: string) {
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://cms.ccc.clubcricketofchicago.com/'
  if (url?.startsWith('http')) return url
  const cleanUrl = url?.startsWith('/') ? url.substring(1) : url
  const baseUrl = cmsBaseUrl.endsWith('/') ? cmsBaseUrl : `${cmsBaseUrl}/`
  return `${baseUrl}${cleanUrl}`
}

function getInfoBgImage(_score: number) {
  // Uniform card style for every player (gold/silver/bronze tier removed).
  return '/images/players/gold_infoBG.png'
}

function PlayerCardEle({
  player,
  lightswitch,
}: {
  player: Player
  lightswitch: boolean
}) {
  const playerImage = player.playerImage?.[0]
  const countryAbbreviation = player.country?.toLowerCase()
  const flagUrl = countryAbbreviation
    ? `/images/nationality/${countryAbbreviation}.svg`
    : '/images/sample_flag.png'

  const profilePic = playerImage
    ? getFullImageUrl(playerImage.url)
    : '/images/sample_player_image.png'

  const bottomBgImage = getInfoBgImage(player.scorebycaptain || 0)
  { console.log('Player runs:', player) }

  interface ApiError {
    error: string;
  }



  const [playerId, setPlayerId] = useState<number | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<PlayerStats>({
    battingStats: [],
    bowlingStats: [],
  });

  const fetchStats = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/player-stats?playerId=${id}`
      );

      const data = await res.json();

      setStats(
        data.data ?? { battingStats: [], bowlingStats: [] }
      );

      setIsOpen(true);
    } catch (err) {
      setError("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (id: number) => {
    setPlayerId(id);
    fetchStats(id);
  };


  return (
    <div className="playerCardEle relative ">
      {/* Top half: player background */}
      <div className="w-full aspect-[500/392] h-auto bg-[url(/images/player_Image_bg.png)] bg-contain bg-no-repeat flex">
        <div
          className="w-auto h-[90%] aspect-[226/199] ml-auto bg-cover bg-center mt-auto"
          style={{ backgroundImage: `url(${profilePic})` }}
        />
        <div className="absolute w-[16vw] h-[35.5vh] lg:w-[3.5%] lg:h-[14.6vw] ml-[0.2vw] mt-[-0.2vw]">
          <div className="flex h-full">
            <div className="mt-auto h-[74%] justify-between flex flex-col">
              <div className="w-[80%] mx-auto">
                <Image
                  src={flagUrl}
                  alt={player.nationalFlag?.[0]?.alt || ''}
                  width={46}
                  height={31}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
              <p className="text-center roboto-condensed-med p4 text-pretty text-[#D2A357]">
                {player.teamName}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-1 bg-[#181c28] justify-center items-center py-[0.5vw] gap-2 '>
        <div >
          <div >

            {/* Heading */}
            <h1
              onClick={() => openModal(player.playerid || 0)}
              className="text-white font-bold text-center uppercase"
            >
              Show Full Stats
            </h1>

            {/* Popup Modal */}
            {isOpen && (
              <div className=" bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white w-[900px] max-h-[80vh] overflow-auto rounded-xl p-6 relative shadow-xl">

                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-3 right-4 text-lg"
                  >
                    ✕
                  </button>

                  <h2 className="text-2xl font-bold mb-6">
                    Player Statistics
                  </h2>

                  {loading && <p>Loading...</p>}
                  {error && <p className="text-red-500">{error}</p>}

                  {!loading &&
                    stats.battingStats.length > 0 && (

                      <div className="space-y-10">

                        {[...new Set(
                          stats.battingStats.map(b => b.seriesType)
                        )].map((type) => {

                          const battingByType =
                            stats.battingStats.filter(
                              (b) => b.seriesType === type
                            );

                          const bowlingByType =
                            stats.bowlingStats.filter(
                              (b) => b.seriesType === type
                            );

                          return (
                            <div key={type} className="space-y-6">

                              <h3 className="text-xl font-semibold border-b pb-2">
                                {type} Stats
                              </h3>

                              {/* Batting Table */}
                              {battingByType.length > 0 && (
                                <div className="overflow-auto border rounded-lg">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="border px-3 py-2">Matches</th>
                                        <th className="border px-3 py-2">Runs</th>
                                        <th className="border px-3 py-2">Highest</th>
                                        <th className="border px-3 py-2">Avg</th>
                                        <th className="border px-3 py-2">SR</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {battingByType.map((bat, i) => (
                                        <tr key={i} className="text-center">
                                          <td className="border px-3 py-2">
                                            {bat.matches}
                                          </td>
                                          <td className="border px-3 py-2 font-semibold">
                                            {bat.runsScored}
                                          </td>
                                          <td className="border px-3 py-2">
                                            {bat.highestScore}
                                          </td>
                                          <td className="border px-3 py-2">
                                            {bat.average}
                                          </td>
                                          <td className="border px-3 py-2">
                                            {bat.strikeRate}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* Bowling Table */}
                              {bowlingByType.length > 0 && (
                                <div className="overflow-auto border rounded-lg">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="border px-3 py-2">Matches</th>
                                        <th className="border px-3 py-2">Wickets</th>
                                        <th className="border px-3 py-2">Runs</th>
                                        <th className="border px-3 py-2">Economy</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {bowlingByType.map((bowl, i) => (
                                        <tr key={i} className="text-center">
                                          <td className="border px-3 py-2">
                                            {bowl.matches}
                                          </td>
                                          <td className="border px-3 py-2 font-semibold">
                                            {bowl.wickets}
                                          </td>
                                          <td className="border px-3 py-2">
                                            {bowl.runsGiven}
                                          </td>
                                          <td className="border px-3 py-2">
                                            {bowl.economy}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                            </div>
                          );
                        })}

                      </div>
                    )}

                </div>
              </div>
            )}
          </div>
        </div>


      </div>
      {/* Bottom half: player info (dynamically set background) */}
      <div
        className="aspect-[284/228] h-auto bg-contain bg-no-repeat flex"
        style={{ backgroundImage: `url(${bottomBgImage})` }}
      >
        <div className="playerMainInfo py-[2%] w-[90%] mx-auto h-full">
          <h2 className="text-center roboto-condensed-bold p1 underline text-[#282525] uppercase">
            {player.title}
          </h2>

          {lightswitch ? (
            // Show jersey number
            <div className="jerInfo flex h-[72%] w-full">
              <h5 className="my-auto roboto-condensed-bold text-[7.2vw] leading-[7vw] text-[#282828] m-auto">
                {player.jerseyNumber}
              </h5>
            </div>
          ) : (
            // Show stats
            <div className="w-[80%] mx-auto mt-[5%]">
              <div className="text-center w-full mx-auto text-[#332f2f] my-auto flex flex-col">
                <div className="flex justify-between w-full h-auto mb-[2%]">
                  <p className="my-auto roboto-condensed-bold p1">MATCHES</p>
                  <p className="my-auto roboto-condensed-bold p1">
                    {player.matches}
                  </p>
                </div>
                <div className="flex justify-between w-full h-auto mb-[2%]">
                  <p className="my-auto roboto-condensed-bold p1">RUNS</p>
                  <p className="my-auto roboto-condensed-bold p1">
                    {player.totalruns ?? 0}

                  </p>
                </div>
                <div className="flex justify-between w-full h-auto">
                  <p className="my-auto roboto-condensed-bold p1">WICKETS</p>
                  <p className="my-auto roboto-condensed-bold p1">
                    {player.wickets}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  // 1) Type your state for players
  const [players, setPlayers] = useState<Player[]>([])

  // 2) Type your configuration value (lightswitch: boolean)
  const [lightswitch, setLightswitch] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/players')
        const playersData: GraphQLPlayersResponse = await res.json()

        if (playersData && playersData.entries) {
          setPlayers(playersData.entries)
        } else {
          throw new Error('No player data returned from API')
        }

        // Show stats (matches/runs/wickets) for everyone, uniformly.
        setLightswitch(false)
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }

    fetchData()
  }, [])

  return (
    <section className="allPlayersPanel_header lg:base_paddings">
      <div className="LSC_parent PlayersPage center_aligned px-[3.5%] pb-[20%] pt-[10%] lg:py-[2%] bg-white/10 backdrop-blur-sm rounded-[2vw] lg:pb-[6vw]">
        <SectionTitleEle>Players</SectionTitleEle>
        <hr className="w-full h-[0.1vw] bg-[#FFFFFF] border-none" />
        <div className="players_panel_container items-center relative">
          {players.map((player) => (
            <PlayerCardEle key={player.id} player={player} lightswitch={lightswitch} />
          ))}

        </div>
      </div>
    </section>
  )
}

// --------------------------------------
// Additional types used in data fetches
// --------------------------------------
interface GraphQLPlayersResponse {
  entries: Player[]
}

interface PlayerConfigurationResponse {
  globalSet?: {
    lightswitch?: boolean
  }
}
