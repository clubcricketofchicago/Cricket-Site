"use client";

import React from "react";

function DataBattingTableHeader() {
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
        <th className="p5 white_color border_th">BF</th>
        <th className="p5 white_color border_th">Rns</th>
        <th className="p5 white_color border_th">4s</th>
        <th className="p5 white_color border_th">6s</th>
        <th className="p5 white_color border_th">50s</th>
        <th className="p5 white_color border_th">100s</th>
        <th className="p5 white_color border_th">NO</th>
        <th className="p5 white_color border_th">HS</th>
      </tr>
    </thead>
  );
}

function DataBattingTableRow({ tableRow, indexVal }) {
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
      <td className="p5 white_color">{tableRow.ballsFaced}</td>
      <td className="p5 white_color">{tableRow.runsScored}</td>
      <td className="p5 white_color">{tableRow.fours}</td>
      <td className="p5 white_color">{tableRow.sixers}</td>
      <td className="p5 white_color">{tableRow.fifties}</td>
      <td className="p5 white_color">{tableRow.hundreds}</td>
      <td className="p5 white_color">{tableRow.notOuts}</td>
      <td className="p5 white_color">{tableRow.highestScore}</td>
    </tr>
  );
}

export default function RenderBattingDataTable({ battingData }) {
  return (
    <table cellSpacing="0">
      <DataBattingTableHeader />
      <tbody>
        {battingData.map((row, idx) => (
          <DataBattingTableRow key={idx} tableRow={row} indexVal={idx} />
        ))}
      </tbody>
    </table>
  );
}
