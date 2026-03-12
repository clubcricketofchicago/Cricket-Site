"use client";

import React from "react";

function DataBowlingTableHeader() {
  return (
    <thead>
      <tr>
        <th style={{ width: "4%", textAlign: "center" }} className="p5 white_color">
          #
        </th>
        <th style={{ width: "23%", textAlign: "left" }} className="p5 white_color">
          Player
        </th>
        <th className="p5 white_color border_th">Mat</th>
        <th className="p5 white_color border_th">Ins</th>
        <th className="p5 white_color border_th">Balls</th>
        <th className="p5 white_color border_th">Runs</th>
        <th className="p5 white_color border_th">Wkts</th>
        <th className="p5 white_color border_th">Pts</th>
        <th className="p5 white_color border_th">Cths</th>
        <th className="p5 white_color border_th">4W</th>
        <th className="p5 white_color border_th">5W</th>
        <th className="p5 white_color border_th">DB</th>
      </tr>
    </thead>
  );
}

function DataBowlingTableRow({ tableRow, indexVal }) {
  return (
    <tr>
      <td style={{ width: "4%", textAlign: "center" }} className="p5 white_color">
        {indexVal + 1}
      </td>
      <td style={{ width: "23%", textAlign: "left" }} className="p5 white_color">
        {tableRow.firstName} {tableRow.lastName}
      </td>
      <td className="p5 white_color">{tableRow.matches}</td>
      <td className="p5 white_color">{tableRow.innings}</td>
      <td className="p5 white_color">{tableRow.balls}</td>
      <td className="p5 white_color">{tableRow.runs}</td>
      <td className="p5 white_color">{tableRow.wickets}</td>
      <td className="p5 white_color">{tableRow.points}</td>
      <td className="p5 white_color">{tableRow.catches}</td>
      <td className="p5 white_color">{tableRow.fourWickets}</td>
      <td className="p5 white_color">{tableRow.fiveWickets}</td>
      <td className="p5 white_color">{tableRow.dotBalls}</td>
    </tr>
  );
}

export default function RenderBowlingDataTable({ bowlingData }) {
  return (
    <table cellSpacing="0">
      <DataBowlingTableHeader />
      <tbody>
        {bowlingData.map((row, idx) => (
          <DataBowlingTableRow key={idx} tableRow={row} indexVal={idx} />
        ))}
      </tbody>
    </table>
  );
}
