"use client";

import React from 'react';

export default function DaysRemainingHistogram({ buckets }: { buckets: Record<string, number> }) {
  const total = Object.values(buckets).reduce((s, v) => s + v, 0) || 1;

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-md shadow-sm">
      <h4 className="text-sm font-medium mb-2">Days Remaining</h4>
      <div className="flex flex-col gap-2">
        {Object.entries(buckets).map(([k, v]) => (
          <div key={k} className="flex items-center gap-3">
            <div className="text-xs w-16 text-muted-foreground">{k}</div>
            <div className="h-4 bg-gray-100 w-full rounded overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${(v / total) * 100}%` }} />
            </div>
            <div className="text-sm w-8 text-right">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
