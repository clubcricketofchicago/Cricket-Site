"use client";

import React from "react";

export default function LeagueLogoSlider({ flagImage }) {
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || "";

  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
    const baseUrl = cmsBaseUrl.endsWith("/") ? cmsBaseUrl : `${cmsBaseUrl}/`;
    return `${baseUrl}${cleanUrl}`;
  };

  // CricClubs has no per-series flag, so fall back to the CCC crest.
  const backgroundFlag = getFullImageUrl(flagImage) || "/images/logo.png";

  return (
    <div className="league_logo_slider">
      <div className="leagueLogo_slider flex_grid">
        <div
          className="newleague_logo_ele aspect-[750/960]"
          style={{
            backgroundImage: `url(${backgroundFlag})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          {/* If you want to reintroduce these sections, uncomment them and replace with real data
          
          <div className="leagueStatic_name">
            <p className="roboto-condensed-bold p4">
              Midwest Cricket Conference
            </p>
          </div>
          <div className="league_logo">
            <img src="/images/league-logos/mwcc_logo.png" alt="LEAGUE LOGO" />
          </div>
          <div className="series_name">
            <p className="roboto-condensed-bold p4">
              2023
              <br />
              RedBall T30
            </p>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}
