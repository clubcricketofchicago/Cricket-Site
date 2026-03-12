"use client";

import React from "react";

function DataFieldingTableHeader() {
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
        <th className="p5 white_color border_th">Cths</th>
        <th className="p5 white_color border_th">WC</th>
        <th className="p5 white_color border_th">DR</th>
        <th className="p5 white_color border_th">IDR</th>
        <th className="p5 white_color border_th">STM</th>
        <th className="p5 white_color border_th">TO</th>
      </tr>
    </thead>
  );
}

function DataFieldingTableRow({ tableRow, indexVal }) {
  return (
    <tr>
      <td style={{ width: "4%", textAlign: "center" }} className="p5 white_color">
        {indexVal + 1}
      </td>
      <td style={{ width: "23%", textAlign: "left" }} className="p5 white_color">
        {tableRow.firstName} {tableRow.lastName}
      </td>
      <td className="p5 white_color">{tableRow.totalMatches}</td>
      <td className="p5 white_color">{tableRow.catches}</td>
      <td className="p5 white_color">{tableRow.wkcatches}</td>
      <td className="p5 white_color">{tableRow.direct}</td>
      <td className="p5 white_color">{tableRow.indirect}</td>
      <td className="p5 white_color">{tableRow.stumpings}</td>
      <td className="p5 white_color">{tableRow.total}</td>
    </tr>
  );
}

export default function RenderFieldingDataTable({ fieldingData }) {
  return (
    <table cellSpacing="0">
      <DataFieldingTableHeader />
      <tbody>
        {fieldingData.map((row, idx) => (
          <DataFieldingTableRow key={idx} tableRow={row} indexVal={idx} />
        ))}
      </tbody>
    </table>
  );
}
