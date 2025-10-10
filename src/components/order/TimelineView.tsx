"use client";

import React, { useState } from 'react';
import { Order } from '@/types/order';
import { useTimelineCalculation } from './useTimelineCalculation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Package, Clock, MapPin, CheckCircle, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, CreditCard } from 'lucide-react';
import { PresignedImage } from '@/components/quote/PresignedImage';
import { ORDER_STATUS, SHIPMENT_STATUS, PAYMENT_STATUS } from '@/types/order';

interface TimelineViewProps {
  orders: Order[];
  onOrderClick?: (order: Order) => void;
  trackingDetails?: Record<string, any>;
  loadingTracking?: Record<string, boolean>;
  onContinuePayment?: (orderId: string) => void;
  continuingPayment?: Record<string, boolean>;
}

export default function TimelineView({ orders, onOrderClick, trackingDetails = {}, loadingTracking = {}, onContinuePayment, continuingPayment = {} }: TimelineViewProps) {
  const timelineCalculations = useTimelineCalculation(orders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const getProductThumbnail = (order: Order) => {
    const artifacts = order.productSpec?.product_specifications?.artifacts;
    const uploadedArtifacts = artifacts?.uploaded_artifacts || [];
    const imageArtifacts = uploadedArtifacts.filter((artifact: any) => 
      artifact.content_type?.startsWith('image/') && artifact.s3_url
    );
    return imageArtifacts[0];
  };

  const limitWords = (text: string, wordLimit: number = 4): string => {
    if (!text) return text;
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Helper function to render the latest tracking update
  const renderLatestTrackingUpdate = (order: Order) => {
    if (loadingTracking[order.orderId]) {
      return (
        <div className="mt-2 py-1 px-2 bg-slate-50 dark:bg-slate-900 rounded-md animate-pulse">
          <p className="text-xs text-muted-foreground">Loading tracking...</p>
        </div>
      );
    }

    if (trackingDetails[order.orderId] && trackingDetails[order.orderId].items?.length > 0) {
      const details = trackingDetails[order.orderId];
      const latestUpdate = details.items[0];
      
      return (
        <div className="mt-2 border-t pt-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-xs font-medium text-blue-700 truncate">{latestUpdate.info || 'Status update'}</p>
              {latestUpdate.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-2 w-2" /> {latestUpdate.location}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Helper function to render full tracking information
  const renderTrackingInfo = (order: Order) => {
    if (loadingTracking[order.orderId]) {
      return (
        <div className="w-full py-2 text-center">
          <p className="text-muted-foreground text-sm">Loading tracking information...</p>
        </div>
      );
    }

    if (trackingDetails[order.orderId]) {
      const details = trackingDetails[order.orderId];
      const isDelivered = details.status === 'Delivered';
      
      return (
        <div className="w-full space-y-4">
          {details.items && details.items.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Tracking History</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 -mr-2">
                {details.items.map((item: any, index: number) => (
                  <div 
                    key={index} 
                    className={`border-l-2 pl-3 py-2 relative ${index === 0 ? (isDelivered ? 'border-green-400' : 'border-blue-400') : 'border-gray-200'}`}
                  >
                    <div 
                      className={`absolute w-2 h-2 rounded-full -left-[5px] top-3 ${index === 0 ? (isDelivered ? 'bg-green-400' : 'bg-blue-400') : 'bg-gray-300'}`}
                    ></div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium">
                        {formatDateTime(item.dateTime)}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${index === 0 ? 'font-medium' : ''}`}>
                      {item.info}
                    </p>
                    {item.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {item.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {details.destination && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Destination:</span> {details.destination}
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full py-4 text-center">
        <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No detailed tracking information available yet.</p>
      </div>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders to display in timeline view
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Legend */}
      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardContent className="p-3 sm:p-6 py-3">
          <div className="flex flex-col items-center  gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
            <div className="flex items-center sm:gap-4 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-blue-500 rounded"></div>
                <span>Production</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-green-500 rounded"></div>
                <span>Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-green-500 opacity-40 rounded"></div>
                <span className="text-xs">Range estimate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-red-500"></div>
                <span>Current Time</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Lighter areas show uncertainty range • Click cards for details
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Rows */}
      <div className="space-y-3">
        {orders.map(order => {
          const calculation = timelineCalculations[order.orderId];
          const thumbnail = getProductThumbnail(order);
          const isExpanded = expandedOrderId === order.orderId;
          
          if (!calculation) return null;

          return (
            <Collapsible
              key={order.orderId}
              open={isExpanded}
              onOpenChange={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
              className="w-full"
            >
              <Card 
                className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
                  calculation.isOverdue && calculation.currentPhase !== 'completed' && order.shipmentStatus !== 'DELIVERED' ? 'border-red-200 bg-red-50/30' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Order Header */}
                    <div className="flex flex-wrap gap-2 items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                          {thumbnail?.s3_url ? (
                            <PresignedImage
                              s3Url={thumbnail.s3_url}
                              alt={thumbnail.filename || "Product"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Order Info */}
                        <div>
                          <h3 className="font-medium text-sm">
                            {limitWords(order.productSpec?.product_specifications?.product_name || order.productSpec?.productName || 'Product')}
                          </h3>
                          <div className="sm:flex items-center gap-2 text-xs text-muted-foreground hidden">
                            <span>#{order.orderId.slice(0, 8)}</span>
                            <span>•</span>
                            <span>Quote #{order.quoteId.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{order.supplierId}</span>
                            {order.orderType && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs px-2 py-0.5 h-5">
                                  {order.orderType.replace('_', ' ')}
                                </Badge>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col items-start text-xs text-muted-foreground sm:hidden">
                            <div className="flex justify-start items-center">
                              <span>•</span>
                              <span>#{order.orderId.slice(0, 8)}</span>
                            </div>
                            <div className="flex justify-start items-center">
                              <span>•</span>
                              <span>Quote #{order.quoteId.slice(0, 8)}</span>
                            </div>
                            <div className="flex justify-start items-center">
                              <span>•</span>
                              <span>{order.supplierId}</span>
                            </div>
                            <div className="flex justify-start items-center">
                              {order.orderType && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs px-2 py-0.5 h-5">
                                  {order.orderType.replace('_', ' ')}
                                </Badge>
                              </>
                              )}  
                            </div>
                            
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">Production:</span>
                            <Badge variant={
                              order.status === ORDER_STATUS.PRODUCTION_COMPLETED ? "success" : "default"
                            } className="text-xs">
                              {order.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          {order.paymentStatus && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-medium">Payment:</span>
                              <Badge variant={
                                order.paymentStatus === PAYMENT_STATUS.PAID ? "success" :
                                order.paymentStatus === PAYMENT_STATUS.PENDING ? "secondary" :
                                order.paymentStatus === PAYMENT_STATUS.FAILED ? "destructive" : "outline"
                              } className="text-xs">
                                {order.paymentStatus === PAYMENT_STATUS.PAID ? 'Paid' :
                                 order.paymentStatus === PAYMENT_STATUS.PENDING ? 'Pending' :
                                 order.paymentStatus === PAYMENT_STATUS.FAILED ? 'Failed' :
                                 order.paymentStatus.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          )}
                          {order.status === ORDER_STATUS.PRODUCTION_COMPLETED && order.shipmentStatus && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-medium">Shipment:</span>
                              <Badge variant={
                                order.shipmentStatus === SHIPMENT_STATUS.DELIVERED ? "success" : "secondary"
                              } className="text-xs">
                                {order.shipmentStatus.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {calculation.isOverdue && calculation.currentPhase !== 'completed' && order.shipmentStatus !== 'DELIVERED' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        
                      </div>
                    </div>

                    {/* Continue Payment Button */}
                    {onContinuePayment && order.paymentStatus && order.paymentStatus !== PAYMENT_STATUS.PAID && order.paymentStatus !== PAYMENT_STATUS.NOT_REQUIRED && (
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => onContinuePayment(order.orderId)}
                          disabled={continuingPayment[order.orderId]}
                          size="sm"
                          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <CreditCard className="h-4 w-4" />
                          {continuingPayment[order.orderId] ? 'Processing...' : 
                           order.paymentStatus === PAYMENT_STATUS.ADJUSTMENT_REQUIRED ? 'Continue with Updated Price' : 
                           'Continue Payment'}
                        </Button>
                      </div>
                    )}

                    {/* Timeline Bar */}
                    <div className="relative">
                      {/* Timeline container */}
                      <div className="relative h-6 bg-gray-100 rounded-md overflow-hidden">
                        {/* Production Bar */}
                        <div 
                          className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${calculation.productionWidth}%` }}
                        >
                          <div 
                            className="h-full bg-blue-600 transition-all duration-500"
                            style={{ width: `${calculation.productionProgress * 100}%` }}
                          />
                        </div>

                        {/* Shipping Bar */}
                        {calculation.shippingWidth > 0 && (
                          <>
                            {/* Guaranteed shipping time (minimum) - solid color */}
                            {calculation.hasShippingRange && calculation.shippingMinWidth && (
                              <div
                                className="absolute top-0 h-full bg-green-500 transition-all duration-300"
                                style={{
                                  left: `${calculation.productionWidth}%`,
                                  width: `${calculation.shippingMinWidth}%`
                                }}
                              >
                                <div
                                  className="h-full bg-green-600 transition-all duration-500"
                                  style={{ width: `${calculation.shippingProgress * 100}%` }}
                                />
                              </div>
                            )}

                            {/* Uncertainty range (max - min) - semi-transparent */}
                            {calculation.hasShippingRange && calculation.shippingRangeWidth && (
                              <div
                                className="absolute top-0 h-full bg-green-500 opacity-40 transition-all duration-300"
                                style={{
                                  left: `${calculation.productionWidth + (calculation.shippingMinWidth || 0)}%`,
                                  width: `${calculation.shippingRangeWidth}%`
                                }}
                              />
                            )}

                            {/* No range - single shipping duration */}
                            {!calculation.hasShippingRange && (
                              <div
                                className="absolute top-0 h-full bg-green-500 transition-all duration-300"
                                style={{
                                  left: `${calculation.productionWidth}%`,
                                  width: `${calculation.shippingWidth}%`
                                }}
                              >
                                <div
                                  className="h-full bg-green-600 transition-all duration-500"
                                  style={{ width: `${calculation.shippingProgress * 100}%` }}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Current Time Indicator - only show if production has started */}
                        {calculation.currentTimePosition > 0 && (
                          <div
                            className="absolute top-0 w-0.5 h-full bg-red-500 z-10 transition-all duration-500"
                            style={{ left: `${calculation.currentTimePosition}%` }}
                          />
                        )}
                      </div>

                      {/* Timeline Labels */}
                      <div className="mt-2 space-y-1">
                        {/* Status line with days remaining - only show for in-progress orders */}
                        {(calculation.currentPhase !== 'completed' && order.shipmentStatus !== 'DELIVERED') && (
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {calculation.daysRemaining > 0
                                ? calculation.hasShippingRange && calculation.daysRemainingMin !== undefined && calculation.daysRemainingMin !== calculation.daysRemaining
                                  ? `${calculation.daysRemainingMin}-${calculation.daysRemaining} days remaining`
                                  : `${calculation.daysRemaining} days remaining`
                                : calculation.isOverdue
                                  ? 'Overdue'
                                  : 'Due today'
                              }
                            </span>
                          </div>
                        )}

                        {/* Date labels */}
                        <div className="flex justify-between text-xs">
                          {(() => {
                            // Check if order has timeline data but hasn't started yet
                            const hasNotStarted = order.timelineData?.has_started === false ||
                                                 (!order.timelineData?.production.start && order.timelineData);

                            if (hasNotStarted && order.timelineData) {
                              // Show duration info without dates
                              const production = order.timelineData.production;
                              const shipping = order.timelineData.shipping;

                              // Format production duration (with or without range)
                              const productionMin = production.duration_days_min || production.duration_days;
                              const productionMax = production.duration_days_max || production.duration_days;
                              const productionText = productionMin !== productionMax
                                ? `${productionMin}-${productionMax} days`
                                : `${productionMin} days`;

                              // Format shipping duration (with or without range)
                              let shippingText = '';
                              let totalMin = productionMin;
                              let totalMax = productionMax;

                              if (shipping) {
                                const shippingMin = shipping.duration_days_min || shipping.duration_days;
                                const shippingMax = shipping.duration_days_max || shipping.duration_days;
                                shippingText = shippingMin !== shippingMax
                                  ? `${shippingMin}-${shippingMax} days`
                                  : `${shippingMin} days`;
                                totalMin += shippingMin;
                                totalMax += shippingMax;
                              }

                              const totalText = totalMin !== totalMax
                                ? `${totalMin}-${totalMax} days`
                                : `${totalMin} days`;

                              return (
                                <div className="w-full text-center space-y-2">
                                  <div className="flex justify-center gap-4 text-muted-foreground">
                                    <span>Production: <span className="font-medium">{productionText}</span></span>
                                    {shipping && (
                                      <span>Shipping: <span className="font-medium">{shippingText}</span></span>
                                    )}
                                    <span>Total: <span className="font-medium">{totalText}</span></span>
                                  </div>
                                  <div className="text-xs italic text-amber-600">
                                    Production start date pending
                                  </div>
                                </div>
                              );
                            }

                            const productionStart = new Date(order.timelineData?.production.start || order.createdAt);

                            if (order.timelineData && order.timelineData.production.start) {
                              // Timeline with dates (may have ranges)
                              const production = order.timelineData.production;
                              const shipping = order.timelineData.shipping;

                              // Check if there's a production range
                              const hasProdRange = !!(production.duration_days_min && production.duration_days_max &&
                                                   production.duration_days_min !== production.duration_days_max);

                              const productionDurationMin = production.duration_days_min || production.duration_days;
                              const productionDurationMax = production.duration_days_max || production.duration_days;

                              // Calculate production end (min and max if range exists)
                              const productionEndMin = production.end
                                ? new Date(production.end)
                                : new Date(productionStart.getTime() + productionDurationMin * 24 * 60 * 60 * 1000);
                              const productionEndMax = production.end
                                ? new Date(production.end)
                                : new Date(productionStart.getTime() + productionDurationMax * 24 * 60 * 60 * 1000);

                              // Calculate shipping dates if exists
                              let shippingEndMin = productionEndMin;
                              let shippingEndMax = productionEndMax;
                              let hasShippingRange = false;

                              if (shipping) {
                                hasShippingRange = !!(shipping.duration_days_min && shipping.duration_days_max &&
                                                   shipping.duration_days_min !== shipping.duration_days_max);

                                const shippingDurationMin = shipping.duration_days_min || shipping.duration_days;
                                const shippingDurationMax = shipping.duration_days_max || shipping.duration_days;

                                shippingEndMin = shipping.end
                                  ? new Date(shipping.end)
                                  : new Date(productionEndMin.getTime() + shippingDurationMin * 24 * 60 * 60 * 1000);
                                shippingEndMax = shipping.end
                                  ? new Date(shipping.end)
                                  : new Date(productionEndMax.getTime() + shippingDurationMax * 24 * 60 * 60 * 1000);
                              }

                              const hasDeliveryRange = hasProdRange || hasShippingRange;

                              return (
                                <>
                                  <div className="text-left">
                                    <div className="font-medium text-blue-700">Production Start</div>
                                    <div className="text-muted-foreground">{formatDate(productionStart.toISOString())}</div>
                                    {production.note && (
                                      <div className="text-xs text-amber-600 mt-0.5 italic">
                                        {production.note}
                                      </div>
                                    )}
                                  </div>
                                  {shipping && (
                                    <div className="text-center">
                                      <div className="font-medium text-green-700">Shipping Start</div>
                                      <div className="text-muted-foreground">
                                        {hasProdRange
                                          ? `${formatDate(productionEndMin.toISOString())} - ${formatDate(productionEndMax.toISOString())}`
                                          : formatDate(productionEndMin.toISOString())
                                        }
                                      </div>
                                      {shipping.note && (
                                        <div className="text-xs text-amber-600 mt-0.5 italic">
                                          {shipping.note}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="text-right">
                                    <div className="font-medium text-foreground">Est. Delivery</div>
                                    <div className="text-muted-foreground">
                                      {hasDeliveryRange
                                        ? `${formatDate(shippingEndMin.toISOString())} - ${formatDate(shippingEndMax.toISOString())}`
                                        : formatDate(shippingEndMin.toISOString())
                                      }
                                    </div>
                                  </div>
                                </>
                              );
                            } else {
                              // Estimated timeline with ranges
                              // Get production duration (could be from sampleDetails or terms)
                              let productionDaysMin = calculation.productionDays;
                              let productionDaysMax = calculation.productionDays;

                              // Calculate production end range
                              const productionEndMin = new Date(productionStart.getTime() + productionDaysMin * 24 * 60 * 60 * 1000);
                              const productionEndMax = new Date(productionStart.getTime() + productionDaysMax * 24 * 60 * 60 * 1000);

                              // Calculate delivery range
                              const shippingDaysMin = order.estimatedShippingDaysMin || calculation.shippingDays;
                              const shippingDaysMax = order.estimatedShippingDaysMax || calculation.shippingDays;

                              const deliveryMin = new Date(productionEndMin.getTime() + shippingDaysMin * 24 * 60 * 60 * 1000);
                              const deliveryMax = new Date(productionEndMax.getTime() + shippingDaysMax * 24 * 60 * 60 * 1000);

                              const hasShipping = order.orderType !== 'VIDEO_SAMPLE' && calculation.shippingDays > 0;
                              const hasProductionRange = productionDaysMin !== productionDaysMax;
                              const hasShippingRange = shippingDaysMin !== shippingDaysMax;
                              const hasDeliveryRange = hasProductionRange || hasShippingRange;

                              return (
                                <>
                                  <div className="text-left">
                                    <div className="font-medium text-blue-700">Production Start</div>
                                    <div className="text-muted-foreground">{formatDate(productionStart.toISOString())}</div>
                                  </div>
                                  {hasShipping && (
                                    <div className="text-center">
                                      <div className="font-medium text-green-700">Shipping Start</div>
                                      <div className="text-muted-foreground">
                                        {hasProductionRange
                                          ? `${formatDate(productionEndMin.toISOString())} - ${formatDate(productionEndMax.toISOString())}`
                                          : formatDate(productionEndMin.toISOString())
                                        }
                                      </div>
                                    </div>
                                  )}
                                  <div className="text-right">
                                    <div className="font-medium text-foreground">Est. Delivery</div>
                                    <div className="text-muted-foreground">
                                      {hasDeliveryRange
                                        ? `${formatDate(deliveryMin.toISOString())} - ${formatDate(deliveryMax.toISOString())}`
                                        : formatDate(deliveryMin.toISOString())
                                      }
                                    </div>
                                  </div>
                                </>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info and Details Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        {order.trackingNumber && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>Tracking: {order.trackingNumber}</span>
                            {order.trackingUrl && (
                              <a 
                                href={order.trackingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end sm:justify-start">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="px-2">
                            <span className="text-xs text-primary sm:hover:underline flex items-center gap-1">
                              {isExpanded ? (
                                <>Hide Details <ChevronUp className="h-3 w-3" /></>
                              ) : (
                                <>View Details <ChevronDown className="h-3 w-3" /></>
                              )}
                            </span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    {/* Latest tracking update for shipped orders */}
                    {order.status === ORDER_STATUS.PRODUCTION_COMPLETED && order.trackingNumber && 
                     !isExpanded && renderLatestTrackingUpdate(order)}
                  </div>
                </CardContent>
                
                <CollapsibleContent>
                  <Separator />
                  <CardContent className="pt-4">
                    {/* Render detailed content based on order status */}
                    <Tabs defaultValue="timeline" className="w-full">
                      <TabsList className={`grid w-full h-auto ${order.status === ORDER_STATUS.PRODUCTION_COMPLETED ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <TabsTrigger value="timeline" className="text-wrap">Production Timeline</TabsTrigger>
                        <TabsTrigger value="payment" className="text-wrap">Payment Status</TabsTrigger>
                        {order.status === ORDER_STATUS.PRODUCTION_COMPLETED && (
                          <TabsTrigger value="tracking">Tracking</TabsTrigger>
                        )}
                      </TabsList>
                      
                      <TabsContent value="timeline" className="mt-4">
                        <div className="space-y-3">
                          <h4 className="font-medium">Production Timeline</h4>
                          {order.updates && order.updates.length > 0 ? (
                            <div className="space-y-3">
                              {order.updates
                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                .map((update, index) => (
                                  <div key={index} className="border-l-2 border-gray-200 pl-4 pb-3 relative">
                                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-0"></div>
                                    <div className="flex items-baseline justify-between">
                                      <span className="text-xs font-medium text-muted-foreground">
                                        {formatDateTime(update.timestamp)}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {update.type.replace(/_/g, ' ')}
                                      </Badge>
                                    </div>
                                    <p className="text-sm mt-1">
                                      {update.description || (update.status ? update.status.replace(/_/g, ' ') : 'Status update')}
                                    </p>
                                    {update.attachments && update.attachments.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-xs text-muted-foreground mb-1">Attachments:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {update.attachments.map((attachment, i) => {
                                            const attachmentUrl = update.attachmentUrls?.[attachment] || '#';
                                            const filename = attachment.split('/').pop() || attachment;
                                            return (
                                              <a 
                                                key={i}
                                                href={attachmentUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs transition-colors"
                                                title={attachment}
                                              >
                                                📎 {filename} <ExternalLink className="h-3 w-3" />
                                              </a>
                                            );
                                          })}  
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              No production updates yet
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="payment" className="mt-4">
                        <div className="space-y-3">
                          <h4 className="font-medium">Payment Information</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total:</span>
                              <p className="font-medium">
                                {order.orderType === 'VIDEO_SAMPLE' 
                                  ? `${order.currency || '¥'}0` 
                                  : (() => {
                                      const totalPrice = Number(order.totalPrice) || 0;
                                      const shippingCost = Number(order.shippingCost) || 0;
                                      const serviceCharge = Number(order.serviceCharge) || 0;
                                      const totalWithCosts = totalPrice + shippingCost + serviceCharge;
                                      return totalWithCosts > 0 
                                        ? `${order.currency || '¥'}${totalWithCosts.toFixed(2)}`
                                        : `${order.currency || '¥'}${order.totalPrice || 'N/A'}`;
                                    })()
                                }
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span>
                              <p>{order.paymentStatus || 'Paid'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Order Date:</span>
                              <p>{formatDateTime(order.createdAt)}</p>
                            </div>
                            {order.status === ORDER_STATUS.PRODUCTION_COMPLETED && (
                              <div>
                                <span className="text-muted-foreground">Completed:</span>
                                <p>{formatDateTime(order.updatedAt)}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Est. Shipping:</span>
                              <p>
                                {order.orderType === 'VIDEO_SAMPLE' 
                                  ? '0 days'
                                  : order.estimatedShippingDaysMin && order.estimatedShippingDaysMax 
                                    ? `${order.estimatedShippingDaysMin}-${order.estimatedShippingDaysMax} days`
                                    : order.estimatedShippingDaysMin 
                                      ? `${order.estimatedShippingDaysMin}+ days`
                                      : order.estimatedShippingDaysMax 
                                        ? `up to ${order.estimatedShippingDaysMax} days`
                                        : 'N/A'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      {order.status === ORDER_STATUS.PRODUCTION_COMPLETED && (
                        <TabsContent value="tracking" className="mt-4">
                          {order.trackingNumber ? renderTrackingInfo(order) : (
                            <div className="text-center py-4 text-muted-foreground">
                              Tracking information will be available once shipped
                            </div>
                          )}
                        </TabsContent>
                      )}
                    </Tabs>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}