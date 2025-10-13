"use client";

import React from 'react';

interface Segment {
  key: string;
  count: number;
  pct: number;
  color: string;
}

function humanize(key: string) {
  return key
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export default function OrderStatus({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, v) => s + v.count, 0) || 1;

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-md shadow-sm">
      <h4 className="text-sm font-medium mb-2">Order Status</h4>
      <div className="w-full h-8 bg-gray-100 rounded overflow-hidden relative">
        <div className="absolute inset-0 flex">
          {segments.map((seg) => (
            <div
              key={seg.key}
              title={`${humanize(seg.key)}: ${seg.count} (${seg.pct}%)`}
              aria-label={`${humanize(seg.key)} ${seg.count}`}
              style={{ width: `${seg.pct}%`, background: seg.color }}
              className="h-full flex items-center justify-center text-[11px] font-semibold text-white"
            >
              {seg.pct >= 10 ? `${seg.pct}%` : ''}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: seg.color }} />
            <div className="flex-1">
              <div className="font-medium truncate">{humanize(seg.key)}</div>
              <div className="text-muted-foreground text-[12px]">{seg.count} orders • {seg.pct}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
