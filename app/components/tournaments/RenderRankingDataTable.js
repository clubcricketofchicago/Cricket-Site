"use client";

import React from "react";

function DataRankingTableHeader() {
  return (
    <thead>
      <tr>
        <th style={{ width: "4%", textAlign: "center" }} className="p5 white_color">
          #
        </th>
        <th style={{ width: "23%", textAlign: "left" }} className="p5 white_color">
          Player
        </th>
        <th className="p5 white_color border_th">Batting Points</th>
        <th className="p5 white_color border_th">Bowling Points</th>
        <th className="p5 white_color border_th">Fielding Points</th>
        <th className="p5 white_color border_th">Other Points</th>
        <th className="p5 white_color border_th">Total</th>
      </tr>
    </thead>
  );
}

function DataRankingTableRow({ tableRow, indexVal }) {
  return (
    <tr>
      <td style={{ width: "4%", textAlign: "center" }} className="p5 white_color">
        {indexVal + 1}
      </td>
      <td style={{ width: "23%", textAlign: "left" }} className="p5 white_color">
        {tableRow.firstName} {tableRow.lastName}
      </td>
      <td className="p5 white_color">{tableRow.battingPoints}</td>
      <td className="p5 white_color">{tableRow.bowlingPoints}</td>
      <td className="p5 white_color">{tableRow.fieldingPoints}</td>
      <td className="p5 white_color">{tableRow.otherPoints}</td>
      <td className="p5 white_color">{tableRow.total}</td>
    </tr>
  );
}

export default function RenderRankingDataTable({ rankingData }) {
  return (
    <table cellSpacing="0">
      <DataRankingTableHeader />
      <tbody>
        {rankingData.map((row, idx) => (
          <DataRankingTableRow key={idx} tableRow={row} indexVal={idx} />
        ))}
      </tbody>
    </table>
  );
}
