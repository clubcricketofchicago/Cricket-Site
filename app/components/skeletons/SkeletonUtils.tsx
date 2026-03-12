import React from 'react';

// You can import this in your _app.tsx or global CSS
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
    background: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
    background-size: 1000px 100%;
  }
`;

// Utility component for creating skeleton elements
export const SkeletonElement = ({ className = "", style = {} }) => (
  <div className={`shimmer rounded-md ${className}`} style={style}></div>
);

export default SkeletonElement; 