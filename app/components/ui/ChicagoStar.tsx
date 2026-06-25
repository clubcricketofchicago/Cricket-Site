// The six-pointed star from the Chicago city flag — CCC's small "spark" marker.
// Used as a bullet / divider / accent throughout the revamp. Inherits color via
// currentColor (wrapper .ccc-star defaults to orange; override with text color).

import type { CSSProperties } from "react";

type Props = {
  className?: string;
  size?: number | string;
  title?: string;
  style?: CSSProperties;
};

export default function ChicagoStar({ className = "", size = "1em", title, style }: Props) {
  return (
    <span
      className={`ccc-star ${className}`}
      style={{ width: size, height: size, ...style }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <svg viewBox="0 0 100 100" focusable="false">
        <polygon points="50,2 62,29.2 91.6,26 74,50 91.6,74 62,70.8 50,98 38,70.8 8.4,74 26,50 8.4,26 38,29.2" />
      </svg>
    </span>
  );
}
