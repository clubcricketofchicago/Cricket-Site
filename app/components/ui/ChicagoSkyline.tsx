// The Chicago skyline silhouette — the recurring signature of the revamp.
// Traced from a clean Chicago skyline vector (Willis + Hancock antennae intact)
// into THREE depth layers — far (distant/lightest) → mid → near (front/darkest) —
// drawn back-to-front for atmospheric city depth. Each layer is themed via
// --skyline-far/mid/near so depth reads in both daylight and dusk.
// Path data is auto-generated in chicagoSkylinePath.ts (scratchpad/trace_depth.py).

import type { CSSProperties } from "react";
import { CHICAGO_SKYLINE as S } from "./chicagoSkylinePath";

type Props = { className?: string; style?: CSSProperties };

export default function ChicagoSkyline({ className = "", style }: Props) {
  return (
    <div className={`ccc-skyline ${className}`} style={style} aria-hidden="true">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} preserveAspectRatio="xMidYMax meet" focusable="false">
        <path className="sky-far" d={S.far} />
        <path className="sky-mid" d={S.mid} />
        <path className="sky-near" d={S.near} />
      </svg>
    </div>
  );
}
