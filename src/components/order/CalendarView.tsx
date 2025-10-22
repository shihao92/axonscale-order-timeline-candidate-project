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
  const addRangeDates = (start: Date, end: Date) => {
    let cur = new Date(start);
    // normalize to start of day
    cur.setHours(0,0,0,0);
    const last = new Date(end);
    last.setHours(0,0,0,0);
    while (cur <= last) {
      days.push(format(cur, 'yyyy-MM-dd'));
      cur.setDate(cur.getDate() + 1);
    }
  };

  const DAY_MS = 24 * 60 * 60 * 1000;

  if (order.timelineData) {
    const prod = order.timelineData.production || {};

    // production start: explicit start or fallback to order.createdAt
    const productionStart = prod.start ? new Date(prod.start) : new Date(order.createdAt);

    // decide production duration: prefer duration_days, otherwise duration_days_max
    const productionDuration = prod.duration_days || prod.duration_days_max || 0;

    const productionEnd = prod.end
      ? new Date(prod.end)
      : new Date(productionStart.getTime() + productionDuration * DAY_MS);

    addRangeDates(productionStart, productionEnd);

    const shipping = order.timelineData.shipping;
    if (shipping) {
      const shippingStart = shipping.start ? new Date(shipping.start) : productionEnd;
      const shippingDuration = shipping.duration_days_max || shipping.duration_days || 0;
      const shippingEnd = shipping.end
        ? new Date(shipping.end)
        : new Date(shippingStart.getTime() + shippingDuration * DAY_MS);

      addRangeDates(shippingStart, shippingEnd);
    }
  } else {
    // fallback to createdAt as single-day event
    if (order.createdAt) days.push(format(new Date(order.createdAt), 'yyyy-MM-dd'));
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
  // each entry contains metadata whether this day is the start or end of that order
  const dayOrderMap = useMemo(() => {
    type Item = { order: Order; isStart: boolean; isEnd: boolean };
    const map: Record<string, Item[]> = {};
    orders.forEach(order => {
      const orderDays = getOrderDays(order).sort();
      if (orderDays.length === 0) return;
      const first = orderDays[0];
      const last = orderDays[orderDays.length - 1];

      orderDays.forEach(d => {
        const date = parseISO(d);
        // only include if in current month
        if (date >= monthStart && date <= monthEnd) {
          map[d] = map[d] || [];
          map[d].push({ order, isStart: d === first, isEnd: d === last });
        }
      });
    });
    // sort deterministic by orderId
    Object.keys(map).forEach(k => {
      map[k].sort((a,b) => (a.order.orderId || '').localeCompare(b.order.orderId || ''));
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
        <div className="text-sm text-muted-foreground">Click an event to view details</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-center font-medium py-1">{d}</div>
        ))}

        {days.map(day => {
    const key = format(day, 'yyyy-MM-dd');
          const eventList = dayOrderMap[key] || [];
          const isToday = isSameDay(day, new Date());
          return (
            <div key={key} className={cn('min-h-[80px] p-1 border rounded-sm bg-card', isToday && 'ring-1 ring-primary') }>
              <div className="flex items-start justify-between mb-1">
                <div className="text-xs font-medium">{format(day,'d')}</div>

                {eventList.length > 0 && <div className="text-xs text-muted-foreground">{eventList.length}</div>}
              </div>

              <div className="space-y-1">
                {eventList.slice(0, dayMaxEvents).map(item => {
                  const { order, isStart, isEnd } = item;
                  const singleDay = isStart && isEnd;
                  const pillRounded = singleDay
                    ? 'rounded-md'
                    : isStart && !isEnd
                    ? 'rounded-l-md rounded-r-none'
                    : isEnd && !isStart
                    ? 'rounded-r-md rounded-l-none'
                    : 'rounded-none';

                  return (
                    <Popover key={order.orderId}>
                      <PopoverTrigger asChild>
                        <button
                          onClick={() => onOrderClick?.(order)}
                          className={cn('w-full text-left text-xs truncate px-1 py-0.5', STATUS_COLOR[order.status] || 'bg-slate-400', 'text-white', pillRounded)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center truncate">
                              {isStart && (
                                <span className="inline-block w-2 h-2 rounded-full bg-white/80 mr-1" aria-hidden />
                              )}
                              <span className="truncate">
                                {order.productSpec?.product_specifications?.product_name || order.productSpec?.productName || order.orderId}
                              </span>
                            </div>
                            {isEnd && (
                              <span className="inline-block w-2 h-2 rounded-full bg-white/80 ml-2" aria-hidden />
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="space-y-2 max-w-xs">
                          <div className="font-semibold text-sm">{order.productSpec?.product_specifications?.product_name || order.productSpec?.productName || order.orderId}</div>
                          <div className="text-xs text-muted-foreground">Order: {order.orderId}</div>

                          {order.quoteId && (
                            <div className="text-xs">Quote: <span className="font-medium">{order.quoteId}</span></div>
                          )}

                          {order.supplierId && (
                            <div className="text-xs">Supplier: <span className="font-medium">{order.supplierId}</span></div>
                          )}

                          <div className="text-xs">Status: <span className="font-medium">{order.status}</span></div>

                          {order.timelineData?.production && (
                            <div className="text-xs">
                              Production: <span className="font-medium">
                                {order.timelineData.production.start ? format(new Date(order.timelineData.production.start), 'MMM d, yyyy') : '—'}
                                {order.timelineData.production.end ? ` – ${format(new Date(order.timelineData.production.end), 'MMM d, yyyy')}` : ''}
                              </span>
                            </div>
                          )}

                          {order.timelineData?.shipping && (
                            <div className="text-xs">
                              Shipping: <span className="font-medium">
                                {order.timelineData.shipping.start ? format(new Date(order.timelineData.shipping.start), 'MMM d, yyyy') : '—'}
                                {order.timelineData.shipping.end ? ` – ${format(new Date(order.timelineData.shipping.end), 'MMM d, yyyy')}` : ''}
                              </span>
                            </div>
                          )}

                          {order.trackingNumber && (
                            <div className="text-xs">Tracking: <span className="font-medium">{order.trackingNumber}</span></div>
                          )}

                          <div className="pt-2 flex justify-end">
                            <Button size="sm" variant="ghost" onClick={() => onOrderClick?.(order)}>Open</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })}

                {eventList.length > dayMaxEvents && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs text-muted-foreground">+{eventList.length - dayMaxEvents} more</button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {eventList.map(it => (
                          <div key={it.order.orderId} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={cn('w-2 h-2 rounded-full', STATUS_COLOR[it.order.status] || 'bg-slate-400')} />
                              <div className="text-xs">
                                <div className="font-medium">{it.order.productSpec?.product_specifications?.product_name || it.order.productSpec?.productName || it.order.orderId}</div>
                                <div className="text-muted-foreground text-[11px]">{it.order.orderId}</div>
                              </div>
                            </div>
                            <div>
                              <Button size="sm" variant="ghost" onClick={() => onOrderClick?.(it.order)}>View</Button>
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
