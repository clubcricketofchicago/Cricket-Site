import React from 'react';
import { SkeletonElement } from './SkeletonUtils';

const HeroBannerSkeleton = () => {
  return (
    <div className="w-full relative overflow-hidden">
      {/* Background skeleton */}
      <SkeletonElement className="w-full h-[80vh]" />
      
      {/* Content skeleton */}
      <div className="absolute inset-0 flex flex-col justify-center items-center p-8">
        <div className="w-2/3 max-w-md">
          {/* Title skeleton */}
          <SkeletonElement className="h-10 mb-4" />
          
          {/* Subtitle skeleton */}
          <SkeletonElement className="h-6 mb-6 w-3/4" />
          
          {/* Button skeleton */}
          <SkeletonElement className="h-12 w-40" />
        </div>
      </div>
    </div>
  );
};

export default HeroBannerSkeleton; 