import React from 'react';

// Restaurant Card Skeleton
export const RestaurantCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 shimmer"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 shimmer"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 shimmer"></div>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-16 shimmer"></div>
        <div className="h-4 bg-gray-200 rounded w-20 shimmer"></div>
      </div>
    </div>
  </div>
);

// Menu Item Skeleton
export const MenuItemSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-24 h-24 bg-gray-200 rounded-lg shimmer flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 shimmer"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2 shimmer"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 shimmer"></div>
      </div>
      <div className="h-10 w-20 bg-gray-200 rounded shimmer"></div>
    </div>
  </div>
);

// Order Card Skeleton
export const OrderCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 bg-gray-200 rounded w-32 shimmer"></div>
      <div className="h-6 bg-gray-200 rounded w-24 shimmer"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full shimmer"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 shimmer"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 shimmer"></div>
    </div>
    <div className="mt-4 flex justify-between items-center">
      <div className="h-8 bg-gray-200 rounded w-24 shimmer"></div>
      <div className="h-8 bg-gray-200 rounded w-28 shimmer"></div>
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="animate-pulse">
    {[...Array(columns)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded shimmer"></div>
      </td>
    ))}
  </tr>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-12 w-12 bg-gray-200 rounded-lg shimmer"></div>
      <div className="h-6 w-16 bg-gray-200 rounded shimmer"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-24 mb-2 shimmer"></div>
    <div className="h-4 bg-gray-200 rounded w-32 shimmer"></div>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-20 h-20 bg-gray-200 rounded-full shimmer"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2 shimmer"></div>
        <div className="h-4 bg-gray-200 rounded w-64 shimmer"></div>
      </div>
    </div>
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded shimmer"></div>
      ))}
    </div>
  </div>
);

// Generic List Skeleton
export const ListSkeleton = ({ items = 5, height = 'h-16' }) => (
  <div className="space-y-3">
    {[...Array(items)].map((_, i) => (
      <div key={i} className={`bg-gray-200 rounded ${height} shimmer animate-pulse`}></div>
    ))}
  </div>
);

// Full Page Loading
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
    <div className="relative">
      {/* Outer spinning circle */}
      <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>

      {/* Inner pulsing circle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-12 h-12 bg-red-600 rounded-full animate-pulse-slow"></div>
      </div>
    </div>

    {message && (
      <p className="mt-6 text-gray-600 text-lg font-medium animate-pulse">{message}</p>
    )}
  </div>
);

// Button Loading
export const ButtonLoader = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-3'
  };

  return (
    <div className={`${sizeClasses[size]} border-white border-t-transparent rounded-full animate-spin`}></div>
  );
};

export default {
  RestaurantCardSkeleton,
  MenuItemSkeleton,
  OrderCardSkeleton,
  TableRowSkeleton,
  StatsCardSkeleton,
  ProfileSkeleton,
  ListSkeleton,
  PageLoader,
  ButtonLoader
};
