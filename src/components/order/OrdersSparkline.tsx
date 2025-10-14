"use client";

import React from 'react';

export default function OrdersSparkline({ points }: { points: number[] }) {
  const maxPoint = Math.max(...points, 1);
  const width = points.length;

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-md shadow-sm">
      <h4 className="text-sm font-medium mb-2">Orders (last 14 days)</h4>
      <svg viewBox={`0 0 ${width} 20`} className="w-full h-10">
        {points.map((v, i) => {
          const x = i;
          const y = 20 - (v / maxPoint) * 18;
          return <circle key={i} cx={x + 0.5} cy={y} r={0.6} fill="#0ea5e9" />;
        })}
        <polyline
          fill="none"
          stroke="#0ea5e9"
          strokeWidth={0.8}
          points={points.map((v, i) => `${i + 0.5},${20 - (v / maxPoint) * 18}`).join(' ')}
        />
      </svg>
    </div>
  );
}
