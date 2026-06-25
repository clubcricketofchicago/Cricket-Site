import React from 'react';

// Theme-aware shimmer fallback string (kept for parity / optional injection). The
// surface and highlight are token-driven so it reads correctly in both themes.
// In practice SkeletonElement below uses the global `.ccc-skel` class instead.
export const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .shimmer {
    animation: shimmer 2s infinite linear;
    background-color: var(--panel);
    background-image: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(176,192,222,0.10) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 100%);
    background-size: 1000px 100%;
  }
`;

// Utility component for creating skeleton elements. Uses the global, theme-aware
// `.ccc-skel` class so the shimmer/surface match both light and dark themes.
export const SkeletonElement = ({ className = "", style = {} }) => (
  <div className={`ccc-skel rounded-md ${className}`} style={style}></div>
);

export default SkeletonElement; 