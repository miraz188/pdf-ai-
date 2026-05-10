import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-6 animate-pulse">
    <div className="h-4 bg-dark-700 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-dark-700 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-dark-700 rounded w-full mb-2"></div>
    <div className="h-3 bg-dark-700 rounded w-2/3"></div>
  </div>
);

export const SkeletonList = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);
