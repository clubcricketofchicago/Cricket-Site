"use client";

import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import RenderBattingDataTable from "/app/components/tournaments/RenderBattingDataTable";
import RenderBowlingDataTable from "/app/components/tournaments/RenderBowlingDataTable";
import RenderFieldingDataTable from "/app/components/tournaments/RenderFieldingDataTable";
import RenderRankingDataTable from "/app/components/tournaments/RenderRankingDataTable";

export default function NumberZone({
  battingNumberZone = [],
  bowlingNumberZone = [],
  fieldingNumberZone = [],
  rankingZone = [],
}) {
  const battingData = battingNumberZone.map((player) => ({
    firstName: player?.player?.split(" ")[0] || "",
    lastName: player?.player?.split(" ")[1] || "",
    matches: player?.mat || 0,
    innings: player?.ins || 0,
    ballsFaced: player?.bf || 0,
    runsScored: player?.runs || 0,
    fours: player?.fours || 0,
    sixers: player?.sixes || 0,
    fifties: player?.fifties || 0,
    hundreds: player?.hundreds || 0,
    notOuts: player?.no || 0,
    highestScore: player?.hs || 0,
  }));

  const bowlingData = bowlingNumberZone.map((player) => ({
    firstName: player?.player?.split(" ")[0] || "",
    lastName: player?.player?.split(" ")[1] || "",
    matches: player?.mat || 0,
    innings: player?.ins || 0,
    balls: player?.balls || 0,
    runs: player?.runs || 0,
    wickets: player?.wkts || 0,
    points: player?.pts || 0,
    catches: player?.cths || 0,
    fourWickets: player?.fourW || 0,
    fiveWickets: player?.fiveW || 0,
    dotBalls: player?.db || 0,
  }));

  const fieldingData = fieldingNumberZone.map((player) => ({
    firstName: player?.player?.split(" ")[0] || "",
    lastName: player?.player?.split(" ")[1] || "",
    totalMatches: player?.mat || 0,
    catches: player?.cths || 0,
    wkcatches: player?.wc || 0,
    direct: player?.dr || 0,
    indirect: player?.idr || 0,
    stumpings: player?.stm || 0,
    total: player?.to || 0,
  }));

  const rankingData = rankingZone.map((player) => ({
    firstName: player?.player?.split(" ")[0] || "",
    lastName: player?.player?.split(" ")[1] || "",
    battingPoints: player?.battingPoints || 0,
    bowlingPoints: player?.bowlingPoints || 0,
    fieldingPoints: player?.fieldingPoints || 0,
    otherPoints: player?.otherPoints || 0,
    total: player?.total || 0,
  }));

  return (
    <section className="NZ_container center_aligned">
      <div className="NZ_title">
        <h5 className="oswald-bold p1 white_color">NUMBER ZONE</h5>
      </div>
      <div className="NZ_NT_container">
        <Tabs>
          <div className="NZ_NT_tabList_parent">
            <TabList>
              <Tab className="roboto-condensed-bold react-tabs__tab p4 grey_text">
                Batting
              </Tab>
              <Tab className="roboto-condensed-bold react-tabs__tab p4 grey_text">
                Bowling
              </Tab>
              <Tab className="roboto-condensed-bold react-tabs__tab p4 grey_text">
                Fielding
              </Tab>
              <Tab className="roboto-condensed-bold react-tabs__tab p4 grey_text">
                Rankings
              </Tab>
            </TabList>
          </div>

          <TabPanel className="react-tabs__tab-panel NZNT_table batting_table">
            <RenderBattingDataTable battingData={battingData} />
          </TabPanel>

          <TabPanel className="react-tabs__tab-panel NZNT_table bowling_table">
            <RenderBowlingDataTable bowlingData={bowlingData} />
          </TabPanel>

          <TabPanel className="react-tabs__tab-panel NZNT_table fielding_table">
            <RenderFieldingDataTable fieldingData={fieldingData} />
          </TabPanel>

          <TabPanel className="react-tabs__tab-panel NZNT_table rankings_table">
            <RenderRankingDataTable rankingData={rankingData} />
          </TabPanel>
        </Tabs>
      </div>
    </section>
  );
}
