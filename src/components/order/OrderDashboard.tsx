"use client";

import React, { useMemo } from 'react';
import { Order } from '@/types/order';
import OrderStatus from './OrderStatus';
import DaysRemainingHistogram from './DaysRemainingHistogram';
import OrdersSparkline from './OrdersSparkline';

interface OrderDashboardProps {
  orders: Order[];
}

// Small helper to bucket days remaining
function bucketDays(days: number) {
  if (days <= 0) return 'overdue';
  if (days <= 3) return '0-3';
  if (days <= 7) return '4-7';
  if (days <= 14) return '8-14';
  return '15+';
}

export default function OrderDashboard({ orders }: OrderDashboardProps) {
  const stats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const daysBuckets: Record<string, number> = { overdue: 0, '0-3': 0, '4-7': 0, '8-14': 0, '15+': 0 };
    const timelineCountsByDate: Record<string, number> = {};

    const today = new Date();

    orders.forEach((o) => {
      const status = o.status || 'UNKNOWN';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // compute days remaining using timelineData or estimatedShippingDays
      let daysRemaining = 0;
      if (o.timelineData && o.timelineData.production && o.timelineData.shipping) {
        const created = new Date(o.createdAt);
        const totalDays = o.timelineData.total_duration_days || 0;
        const elapsed = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(0, totalDays - elapsed);
      } else if (o.estimatedShippingDaysMax) {
        daysRemaining = o.estimatedShippingDaysMax;
      } else {
        daysRemaining = 7;
      }

      const bucket = bucketDays(daysRemaining);
      daysBuckets[bucket] = (daysBuckets[bucket] || 0) + 1;

      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      timelineCountsByDate[d] = (timelineCountsByDate[d] || 0) + 1;
    });

    return { statusCounts, daysBuckets, timelineCountsByDate };
  }, [orders]);

  const statusKeys = Object.keys(stats.statusCounts);
  const total = orders.length || 1;
  const colorMap: Record<string, string> = {
    PRODUCTION_COMPLETED: '#10B981',
    PRODUCTION: '#0EA5E9',
    PRODUCTION_PLANNING: '#60A5FA',
    INITIAL_PROCESSING: '#7C3AED',
    QUALITY_ASSURANCE: '#F59E0B',
    COMPLIANCE_CHECK: '#F97316',
    CREATED: '#6B7280',
    UNKNOWN: '#94A3B8'
  };
  const segments = statusKeys.map((k, idx) => {
    const count = stats.statusCounts[k] || 0;
    const pct = Math.round((count / total) * 100);
    const color = colorMap[k] || `hsl(${(idx * 60) % 360} 70% 45%)`;
    return { key: k, count, pct, color };
  });

  // prepare sparkline points (last 14 days)
  const sparkData = useMemo(() => {
    const points: number[] = [];
    const counts = stats.timelineCountsByDate;
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      points.push(counts[key] || 0);
    }
    return points;
  }, [stats.timelineCountsByDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="enter-from-bottom">
        <OrderStatus segments={segments} />
      </div>
      <div className="enter-from-bottom" style={{ animationDelay: '80ms' }}>
        <DaysRemainingHistogram buckets={stats.daysBuckets} />
      </div>
      <div className="enter-from-bottom" style={{ animationDelay: '120ms' }}>
        <OrdersSparkline points={sparkData} />
      </div>
    </div>
  );
}
