"use client";
import React from "react";

export interface PlayerOfTheWeekProps {
  batsmanName?: string;
  batsmanImage?: string;
  batsmanLabel?: string;
  batsmanValue?: number;
  bowlerName?: string;
  bowlerImage?: string;
  bowlerCardLabel?: string;
  bowlerValue?: number;
}

const getFullImageUrl = (url?: string) => {
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || "https://cms-ccc.ddev.site/";
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
  const baseUrl = cmsBaseUrl.endsWith("/") ? cmsBaseUrl : `${cmsBaseUrl}/`;
  return `${baseUrl}${cleanUrl}`;
};

export default function PlayerOfTheWeek({
  batsmanName = "-",
  batsmanImage = "",
  batsmanLabel = "Runs",
  batsmanValue = 0,
  bowlerName = "-",
  bowlerImage = "",
  bowlerCardLabel = "WICKETS",
  bowlerValue = 0,
}: PlayerOfTheWeekProps) {
  const batterImg = getFullImageUrl(batsmanImage);
  const bowlerImg = getFullImageUrl(bowlerImage);

  return (
    <section className="POTW_container">
      <div className="POTW_parent flex_grid rounded-[18px] overflow-hidden">
        <div className="POTW_container">
          <div className="POTW_player_title">
            <h4 className="brand_orange p1 roboto-condensed-bold">BEST BATSMAN</h4>
          </div>
          <div
            className="POTW_ele POTW_bestBatsman"
            style={{ backgroundImage: `url('${batterImg}')` }}
          ></div>
          <div className="POTW_text_overlay">
            <p className="POTW_playerName white_color h4 uppercase oswald-bold">
              {batsmanName}
            </p>
            <p className="POTW_score brand_orange h1 roboto-condensed-bold">
              {batsmanValue}
            </p>
            <p className="POTW_score_text brand_orange p1 roboto-condensed-bold">
              {batsmanLabel?.toUpperCase() || "RUNS"}
            </p>
          </div>
        </div>

        <div className="POFT_container">
          <img src="/images/ccc_players.svg" alt="divider icon" />
        </div>

        <div className="POTW_container">
          <div className="POTW_player_title">
            <h4 className="brand_orange p1 roboto-condensed-bold">BEST BOWLER</h4>
          </div>
          <div
            className="POTW_ele POTW_bestBowler"
            style={{ backgroundImage: `url('${bowlerImg}')` }}
          ></div>
          <div className="POTW_text_overlay">
            <p className="POTW_playerName white_color h4 uppercase oswald-bold">
              {bowlerName}
            </p>
            <p className="POTW_score brand_orange h1 roboto-condensed-bold">
              {bowlerValue}
            </p>
            <p className="POTW_score_text brand_orange p1 roboto-condensed-bold">
              {bowlerCardLabel?.toUpperCase() || "WICKETS"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
