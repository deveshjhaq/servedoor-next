import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export function MenuSectionSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-44" />
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className="border rounded-lg p-4 flex justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-20 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="bg-white rounded-xl border p-4 space-y-3">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr>
      {[...Array(columns)].map((_, idx) => (
        <td key={idx} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function PageSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, idx) => (
          <RestaurantCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}
