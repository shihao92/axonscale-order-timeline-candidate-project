import { useMemo } from 'react';
import { Order, TimelineData } from '@/types/order';

export interface TimelineCalculation {
  totalDurationDays: number;
  productionDays: number;
  shippingDays: number;
  currentProgress: number;
  productionProgress: number;
  shippingProgress: number;
  isOverdue: boolean;
  daysRemaining: number;
  daysRemainingMin?: number;
  currentPhase: 'production' | 'shipping' | 'completed';
  productionWidth: number;
  shippingWidth: number;
  currentTimePosition: number;
  hasShippingRange?: boolean;
  shippingMinWidth?: number;
  shippingRangeWidth?: number;
}

export function useTimelineCalculation(orders: Order[]): Record<string, TimelineCalculation> {
  return useMemo(() => {
    const calculations: Record<string, TimelineCalculation> = {};

    orders.forEach(order => {
      if (!order.timelineData) {
        calculations[order.orderId] = createFallbackCalculation(order);
        return;
      }

      calculations[order.orderId] = calculateTimeline(order, order.timelineData);
    });

    return calculations;
  }, [orders]);
}

function calculateTimeline(order: Order, timelineData: TimelineData): TimelineCalculation {
  const now = new Date();

  const hasNotStarted = timelineData.has_started === false || !timelineData.production.start;

  if (hasNotStarted) {
    const productionDurationDays = timelineData.production.duration_days_max || timelineData.production.duration_days;
    const shippingDurationMax = timelineData.shipping?.duration_days_max || timelineData.shipping?.duration_days || 0;
    const shippingDurationMin = timelineData.shipping?.duration_days_min || shippingDurationMax;

    const totalDaysMax = productionDurationDays + shippingDurationMax;
    const totalDaysMin = productionDurationDays + shippingDurationMin;
    const hasShippingRange = shippingDurationMin !== shippingDurationMax && shippingDurationMin > 0;

    const productionWidth = shippingDurationMax > 0
      ? (productionDurationDays / totalDaysMax) * 100
      : 100;
    const shippingWidth = shippingDurationMax > 0
      ? (shippingDurationMax / totalDaysMax) * 100
      : 0;

    const shippingMinWidth = hasShippingRange
      ? (shippingDurationMin / totalDaysMax) * 100
      : shippingWidth;
    const shippingRangeWidth = hasShippingRange
      ? ((shippingDurationMax - shippingDurationMin) / totalDaysMax) * 100
      : 0;

    return {
      totalDurationDays: totalDaysMax,
      productionDays: productionDurationDays,
      shippingDays: shippingDurationMax,
      currentProgress: 0,
      productionProgress: 0,
      shippingProgress: 0,
      isOverdue: false,
      daysRemaining: totalDaysMax,
      daysRemainingMin: hasShippingRange ? totalDaysMin : undefined,
      currentPhase: 'production',
      productionWidth,
      shippingWidth,
      currentTimePosition: 0,
      hasShippingRange,
      shippingMinWidth,
      shippingRangeWidth
    };
  }

  const productionStart = new Date(timelineData.production.start || order.createdAt);
  const productionDurationDays = timelineData.production.duration_days;
  const productionEnd = timelineData.production.end
    ? new Date(timelineData.production.end)
    : new Date(productionStart.getTime() + productionDurationDays * 24 * 60 * 60 * 1000);

  let shippingEnd = productionEnd;
  let shippingEndMin = productionEnd;
  let shippingTimeMs = 0;
  let hasShippingRange = false;
  let shippingMinWidth = 0;
  let shippingRangeWidth = 0;

  if (timelineData.shipping) {
    const shippingDurationMax = timelineData.shipping.duration_days_max || timelineData.shipping.duration_days;
    const shippingDurationMin = timelineData.shipping.duration_days_min || shippingDurationMax;
    hasShippingRange = shippingDurationMin !== shippingDurationMax;

    const shippingStart = timelineData.shipping.start
      ? new Date(timelineData.shipping.start)
      : productionEnd;

    shippingEnd = timelineData.shipping.end
      ? new Date(timelineData.shipping.end)
      : new Date(shippingStart.getTime() + shippingDurationMax * 24 * 60 * 60 * 1000);

    shippingEndMin = timelineData.shipping.end
      ? new Date(timelineData.shipping.end)
      : new Date(shippingStart.getTime() + shippingDurationMin * 24 * 60 * 60 * 1000);

    shippingTimeMs = shippingEnd.getTime() - productionEnd.getTime();
  }

  const totalTimeMs = shippingEnd.getTime() - productionStart.getTime();
  const productionTimeMs = productionEnd.getTime() - productionStart.getTime();

  const elapsedTimeMs = Math.max(0, now.getTime() - productionStart.getTime());
  const totalProgress = Math.min(1, elapsedTimeMs / totalTimeMs);

  let currentPhase: 'production' | 'shipping' | 'completed' = 'production';
  let productionProgress = 0;
  let shippingProgress = 0;

  if (order.status === 'PRODUCTION_COMPLETED') {
    currentPhase = timelineData.shipping ? 'shipping' : 'completed';
    productionProgress = 1;

    if (timelineData.shipping) {
      if (order.shipmentStatus === 'DELIVERED') {
        shippingProgress = 1;
        currentPhase = 'completed';
      } else if (order.shipmentStatus && order.shipmentStatus !== 'NOT_STARTED') {
        shippingProgress = getShipmentProgressFromStatus(order.shipmentStatus);
      } else {
        const shippingElapsed = Math.max(0, now.getTime() - productionEnd.getTime());
        shippingProgress = Math.min(1, shippingElapsed / shippingTimeMs);
      }
    }
  } else {
    productionProgress = Math.min(1, elapsedTimeMs / productionTimeMs);
  }

  const calculatedProductionDays = Math.ceil(productionTimeMs / (1000 * 60 * 60 * 24));
  const calculatedShippingDays = Math.ceil(shippingTimeMs / (1000 * 60 * 60 * 24));
  const calculatedTotalDays = calculatedProductionDays + calculatedShippingDays;

  const productionWidth = (productionTimeMs / totalTimeMs) * 100;
  const shippingWidth = timelineData.shipping ? (shippingTimeMs / totalTimeMs) * 100 : 0;

  if (hasShippingRange && timelineData.shipping) {
    const shippingDurationMin = timelineData.shipping.duration_days_min || timelineData.shipping.duration_days;
    const shippingDurationMax = timelineData.shipping.duration_days_max || timelineData.shipping.duration_days;
    const totalDaysForRange = calculatedProductionDays + shippingDurationMax;

    shippingMinWidth = (shippingDurationMin / totalDaysForRange) * 100;
    shippingRangeWidth = ((shippingDurationMax - shippingDurationMin) / totalDaysForRange) * 100;
  }

  const currentTimePosition = Math.min(100, totalProgress * 100);

  const isOverdue = now > shippingEnd && currentPhase !== 'completed';

  const daysRemainingMax = Math.max(0, Math.ceil((shippingEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemainingMin = hasShippingRange
    ? Math.max(0, Math.ceil((shippingEndMin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : daysRemainingMax;

  return {
    totalDurationDays: timelineData.total_duration_days || calculatedTotalDays,
    productionDays: calculatedProductionDays,
    shippingDays: calculatedShippingDays,
    currentProgress: totalProgress,
    productionProgress,
    shippingProgress,
    isOverdue,
    daysRemaining: daysRemainingMax,
    daysRemainingMin: hasShippingRange ? daysRemainingMin : undefined,
    currentPhase,
    productionWidth,
    shippingWidth,
    currentTimePosition,
    hasShippingRange,
    shippingMinWidth,
    shippingRangeWidth
  };
}

function getShipmentProgressFromStatus(shipmentStatus: string): number {
  const statusProgress: Record<string, number> = {
    'NOT_STARTED': 0,
    'EXPECTING': 0.1,
    'PICKED_UP': 0.3,
    'IN_TRANSIT': 0.7,
    'DELIVERED': 1.0
  };

  return statusProgress[shipmentStatus] || 0;
}

function createFallbackCalculation(order: Order): TimelineCalculation {
  const createdAt = new Date(order.createdAt);
  const now = new Date();
  const elapsedDays = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  let estimatedProductionDays = order.orderType === 'VIDEO_SAMPLE' ? 2 :
                               order.orderType === 'PHYSICAL_SAMPLE' ? 5 : 10;

  if (order.sampleDetails?.lead_time) {
    const leadTime = parseInt(order.sampleDetails.lead_time);
    if (!isNaN(leadTime)) {
      estimatedProductionDays = leadTime;
    }
  } else if (order.sampleDetails?.video_lead_time && order.orderType === 'VIDEO_SAMPLE') {
    const leadTime = parseInt(order.sampleDetails.video_lead_time);
    if (!isNaN(leadTime)) {
      estimatedProductionDays = leadTime;
    }
  } else if (order.terms?.lead_time) {
    const leadTimeMatch = order.terms.lead_time.match(/(\d+)\s*days?/i);
    if (leadTimeMatch) {
      estimatedProductionDays = parseInt(leadTimeMatch[1]);
    }
  }

  let estimatedShippingDays = order.orderType === 'VIDEO_SAMPLE' ? 0 : 7;
  if (order.estimatedShippingDaysMax) {
    estimatedShippingDays = order.estimatedShippingDaysMax;
  } else if (order.estimatedShippingDaysMin) {
    estimatedShippingDays = order.estimatedShippingDaysMin;
  }
  const totalDays = estimatedProductionDays + estimatedShippingDays;

  const totalProgress = Math.min(1, elapsedDays / totalDays);
  const productionProgress = Math.min(1, elapsedDays / estimatedProductionDays);
  const shippingProgress = order.orderType === 'VIDEO_SAMPLE' ? 0 :
                          Math.max(0, Math.min(1, (elapsedDays - estimatedProductionDays) / estimatedShippingDays));

  const currentPhase: 'production' | 'shipping' | 'completed' =
    order.status === 'PRODUCTION_COMPLETED' ?
      (order.orderType === 'VIDEO_SAMPLE' ? 'completed' : 'shipping') : 'production';

  const productionWidth = order.orderType === 'VIDEO_SAMPLE' ? 100 :
                         (estimatedProductionDays / totalDays) * 100;
  const shippingWidth = order.orderType === 'VIDEO_SAMPLE' ? 0 :
                       (estimatedShippingDays / totalDays) * 100;

  const currentTimePosition = Math.min(100, totalProgress * 100);

  return {
    totalDurationDays: totalDays,
    productionDays: estimatedProductionDays,
    shippingDays: estimatedShippingDays,
    currentProgress: totalProgress,
    productionProgress,
    shippingProgress,
    isOverdue: elapsedDays > totalDays && currentPhase !== 'completed',
    daysRemaining: Math.max(0, Math.ceil(totalDays - elapsedDays)),
    currentPhase,
    productionWidth,
    shippingWidth,
    currentTimePosition
  };
}
