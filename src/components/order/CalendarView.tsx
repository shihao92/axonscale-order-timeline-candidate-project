"use client";

import React, { useMemo, useState } from 'react';
import { Order, ORDER_STATUS } from '@/types/order';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  orders: Order[];
  onOrderClick?: (order: Order) => void;
  dayMaxEvents?: number;
}

const STATUS_COLOR: Record<string, string> = {
  [ORDER_STATUS.CREATED]: 'bg-slate-400',
  [ORDER_STATUS.PRODUCTION_PLANNING]: 'bg-yellow-400',
  [ORDER_STATUS.INITIAL_PROCESSING]: 'bg-yellow-500',
  [ORDER_STATUS.PRODUCTION]: 'bg-blue-400',
  [ORDER_STATUS.QUALITY_ASSURANCE]: 'bg-indigo-400',
  [ORDER_STATUS.COMPLIANCE_CHECK]: 'bg-purple-400',
  [ORDER_STATUS.PRODUCTION_COMPLETED]: 'bg-green-500'
};

function getOrderDays(order: Order) {
  // prefer timelineData phases (production + shipping) if present
  const days: string[] = [];
  const addRange = (startStr?: string, endStr?: string) => {
    if (!startStr) return;
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : start;
    let cur = new Date(start);
    while (cur <= end) {
      days.push(cur.toISOString().slice(0,10));
      cur.setDate(cur.getDate() + 1);
    }
  };

  if (order.timelineData) {
    const prod = order.timelineData.production;
    addRange(prod?.start, prod?.end);
    if (order.timelineData.shipping) addRange(order.timelineData.shipping.start, order.timelineData.shipping.end);
  } else {
    // fallback to createdAt as single-day event
    if (order.createdAt) days.push(new Date(order.createdAt).toISOString().slice(0,10));
  }

  return Array.from(new Set(days));
}

export default function CalendarView({ orders, onOrderClick, dayMaxEvents = 3 }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pickerMonth, setPickerMonth] = useState<number>(currentMonth.getMonth());
  const [pickerYear, setPickerYear] = useState<number>(currentMonth.getFullYear());

  const months = Array.from({length:12}).map((_,i) => ({value:i, label: format(new Date(2000,i,1),'MMMM')}));
  const years = Array.from({length:10}).map((_,i)=> new Date().getFullYear() - 5 + i);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const days = useMemo(() => eachDayOfInterval({ start: monthStart, end: monthEnd }), [monthStart, monthEnd]);

  // map date (YYYY-MM-DD) to orders intersecting that day
  const dayOrderMap = useMemo(() => {
    const map: Record<string, Order[]> = {};
    orders.forEach(order => {
      const orderDays = getOrderDays(order);
      orderDays.forEach(d => {
        // only include if in current month
        const date = new Date(d);
        if (date >= monthStart && date <= monthEnd) {
          map[d] = map[d] || [];
          map[d].push(order);
        }
      });
    });
    // sort deterministic by orderId
    Object.keys(map).forEach(k => {
      map[k].sort((a,b) => (a.orderId || '').localeCompare(b.orderId || ''));
    });
    return map;
  }, [orders, monthStart, monthEnd]);

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={prevMonth} aria-label="Previous month">‹</Button>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="font-semibold flex items-center gap-2"
                onClick={() => { setPickerMonth(currentMonth.getMonth()); setPickerYear(currentMonth.getFullYear()); }}
              >
                {format(currentMonth, 'MMMM yyyy')}
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-3 p-3 w-64">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Jump to</div>
                  <button className="text-xs text-muted-foreground" onClick={() => { setCurrentMonth(new Date()); }}>Today</button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {months.map(m => (
                    <button
                      key={m.value}
                      className={`px-2 py-1 rounded text-sm ${pickerMonth === m.value ? 'bg-primary text-white' : 'bg-muted'}`}
                      onClick={() => setPickerMonth(m.value)}
                    >
                      {m.label.slice(0,3)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded bg-muted" onClick={() => setPickerYear(y => y - 1)}>‹</button>
                  <input
                    type="number"
                    value={pickerYear}
                    onChange={(e) => setPickerYear(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1 text-sm text-center"
                  />
                  <button className="px-2 py-1 rounded bg-muted" onClick={() => setPickerYear(y => y + 1)}>›</button>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setCurrentMonth(new Date(pickerYear, pickerMonth, 1))}>Go</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button size="sm" onClick={nextMonth} aria-label="Next month">›</Button>
        </div>
        <div className="text-sm text-muted-foreground">Tap an event to view details</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-center font-medium py-1">{d}</div>
        ))}

        {days.map(day => {
          const key = day.toISOString().slice(0,10);
          const eventList = dayOrderMap[key] || [];
          const isToday = isSameDay(day, new Date());
          return (
            <div key={key} className={cn('min-h-[80px] p-1 border rounded-sm bg-card', isToday && 'ring-1 ring-primary') }>
              <div className="flex items-start justify-between mb-1">
                <div className="text-xs font-medium">{format(day,'d')}</div>

                {eventList.length > 0 && <div className="text-xs text-muted-foreground">{eventList.length}</div>}
              </div>

              <div className="space-y-1">
                {eventList.slice(0, dayMaxEvents).map(order => (
                  <Popover key={order.orderId}>
                    <PopoverTrigger asChild>
                      <button
                        onClick={() => onOrderClick?.(order)}
                        className={cn('w-full text-left text-xs truncate px-1 py-0.5 rounded', STATUS_COLOR[order.status] || 'bg-slate-400', 'text-white')}
                      >
                        {order.productSpec?.product_specifications?.product_name || order.productSpec?.productName || order.orderId}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-2 max-w-xs">
                        <div className="font-semibold text-sm">{order.productSpec?.product_specifications?.product_name || order.productSpec?.productName || order.orderId}</div>
                        <div className="text-xs text-muted-foreground">Order: {order.orderId}</div>
                        <div className="text-xs">Status: <span className="font-medium">{order.status}</span></div>
                        <div className="pt-2 flex justify-end">
                          <Button size="sm" variant="ghost" onClick={() => onOrderClick?.(order)}>Open</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}

                {eventList.length > dayMaxEvents && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs text-muted-foreground">+{eventList.length - dayMaxEvents} more</button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {eventList.map(o => (
                          <div key={o.orderId} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={cn('w-2 h-2 rounded-full', STATUS_COLOR[o.status] || 'bg-slate-400')} />
                              <div className="text-xs">
                                <div className="font-medium">{o.productSpec?.product_specifications?.product_name || o.productSpec?.productName || o.orderId}</div>
                                <div className="text-muted-foreground text-[11px]">{o.orderId}</div>
                              </div>
                            </div>
                            <div>
                              <Button size="sm" variant="ghost" onClick={() => onOrderClick?.(o)}>View</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
