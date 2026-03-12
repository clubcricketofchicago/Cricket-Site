'use client'

import MatchLocation from './MatchLocation'
import MatchDate from './MatchDate'

export default function MatchDisplayEle({ bgColor, game }) {
  return (
    <div
      className="rounded-md shadow-sm overflow-hidden p-4 flex flex-col space-y-3"
      style={{ backgroundColor: bgColor }}
    >
      <MatchDate>{game.fixedFormatDate}</MatchDate>

      <div className="text-center">
        <p className="roboto-condensed-regular p6">{game.title}</p>
      </div>

      <div className="flex items-center justify-between my-4">
        <div className="w-16 h-16 flex items-center justify-center">
          <img
            src={"https://cricclubs.com" + game.t1_logo_file_path}
            alt=""
            className="max-w-full max-h-full"
          />
        </div>
        <div className="mx-2">
          <p className="roboto-condensed-regular p4">VS</p>
        </div>
        <div className="w-16 h-16 flex items-center justify-center">
          <img
            src={"https://cricclubs.com" + game.t2_logo_file_path}
            alt=""
            className="max-w-full max-h-full"
          />
        </div>
      </div>

      <MatchLocation logoWhite={false}>{game.location}</MatchLocation>
    </div>
  )
}
