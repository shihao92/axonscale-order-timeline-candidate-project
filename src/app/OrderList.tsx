"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderSortSelect } from '@/components/order/OrderSortSelect';
import { Input } from '@/components/ui/input';
import OrderDashboard from '@/components/order/OrderDashboard';
import { useOrderSort } from '@/components/order/useOrderSort';
import { ORDER_STATUS, SHIPMENT_STATUS, PAYMENT_STATUS } from '@/types/order';
import { orderApi } from '@/lib/api/orderClient';
import { Order } from '@/types/order';
import { useAuth } from '@/lib/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ExternalLink, ChevronDown, ChevronUp, MapPin, AlertCircle, CreditCard, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { PresignedImage } from '@/components/quote/PresignedImage';
import { Button } from '@/components/ui/button';
import { FixedSizeList } from 'react-window';
// using inline props type for react-window child renderer
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TimelineView from '@/components/order/TimelineView';
import CalendarView from '@/components/order/CalendarView';
import { PriceChangeModal } from '@/components/order/PriceChangeModal';
import { PriceChanges } from '@/lib/api/orderClient';
import OrderCard from '@/components/order/OrderCard';

export default function BuyerOrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [trackingDetails, setTrackingDetails] = useState<Record<string, any>>({});
  const [loadingTracking, setLoadingTracking] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'calendar'>('timeline');
  const { sortedOrders, sortOption, setSortOption } = useOrderSort(orders);
  // Search state (debounced)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const filteredSortedOrders = useMemo(() => {
    if (!debouncedQuery) return sortedOrders;
    const q = debouncedQuery.toLowerCase();
    return sortedOrders.filter((order) => {
      const productName = (
        order.productSpec?.product_specifications?.product_name ||
        order.productSpec?.productName ||
        ''
      ).toString().toLowerCase();
      const orderId = (order.orderId || '').toLowerCase();
      const quoteId = (order.quoteId || '').toLowerCase();
      const supplierId = (order.supplierId || '').toLowerCase();

      return (
        productName.includes(q) ||
        orderId.includes(q) ||
        quoteId.includes(q) ||
        supplierId.includes(q)
      );
    });
  }, [sortedOrders, debouncedQuery]);

  // Continue payment modal state
  const [priceChangeModal, setPriceChangeModal] = useState<{
    isOpen: boolean;
    orderId: string;
    priceChanges: PriceChanges | null;
  }>({
    isOpen: false,
    orderId: '',
    priceChanges: null
  });
  const [continuingPayment, setContinuingPayment] = useState<Record<string, boolean>>({});

  const fetchOrders = useCallback(async () => {
    if (!user?.email) return;

    try {
      const buyerId = user.email;
      const response = await orderApi.getOrdersByBuyer(buyerId);
      console.log('API Response:', response);

      // Handle the response properly based on its shape
      const orderArray = response && typeof response === 'object' && 'orders' in response
        ? (response as { orders: Order[] }).orders
        : [];

      setOrders(orderArray);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      console.log('Fetching orders for buyer:', user.email);
      fetchOrders();
    }
  }, [user?.email, fetchOrders]);

  // Fetch tracking details for all shipping orders when orders are loaded
  useEffect(() => {
    const fetchAllTrackingDetails = async () => {
      const shippingOrdersWithTracking = orders.filter(order =>
        order.status === ORDER_STATUS.PRODUCTION_COMPLETED &&
        order.trackingNumber &&
        !trackingDetails[order.orderId] &&
        !loadingTracking[order.orderId]
      );

      if (shippingOrdersWithTracking.length === 0) return;

      console.log(`Fetching tracking details for ${shippingOrdersWithTracking.length} shipping orders`);

      // Create a new loading state object
      const newLoadingState: Record<string, boolean> = {};
      shippingOrdersWithTracking.forEach(order => {
        newLoadingState[order.orderId] = true;
      });

      setLoadingTracking(prev => ({ ...prev, ...newLoadingState }));

      // Fetch tracking details for each order
      const trackingPromises = shippingOrdersWithTracking.map(async (order) => {
        try {
          const response = await orderApi.getTrackingInfo(order.orderId, order.supplierId);
          if (response.trackingDetails) {
            return { orderId: order.orderId, details: response.trackingDetails };
          }
        } catch (error) {
          console.error(`Error fetching tracking for order ${order.orderId}:`, error);
        }
        return null;
      });

      const results = await Promise.all(trackingPromises);

      // Update tracking details
      const newTrackingDetails: Record<string, any> = {};
      results.forEach(result => {
        if (result) {
          newTrackingDetails[result.orderId] = result.details;
        }
      });

      setTrackingDetails(prev => ({ ...prev, ...newTrackingDetails }));

      // Reset loading state
      const resetLoadingState: Record<string, boolean> = {};
      shippingOrdersWithTracking.forEach(order => {
        resetLoadingState[order.orderId] = false;
      });

      setLoadingTracking(prev => ({ ...prev, ...resetLoadingState }));
    };

    if (orders.length > 0) {
      fetchAllTrackingDetails();
    }
  }, [orders, trackingDetails, loadingTracking]);

  // Handler for continuing payment
  const handleContinuePayment = async (orderId: string) => {
    setContinuingPayment(prev => ({ ...prev, [orderId]: true }));

    try {
      const currentUrl = window.location.origin;
      const successUrl = `${currentUrl}/buyer/payment/success?orderId=${orderId}`;
      const cancelUrl = `${currentUrl}/buyer/orders`;

      // Check if order has admin-triggered price changes
      const order = orders.find(o => o.orderId === orderId);
      if (order?.paymentStatus === PAYMENT_STATUS.ADJUSTMENT_REQUIRED) {
        if (order.priceChanges) {
          // Show price change modal with admin-updated prices
          setPriceChangeModal({
            isOpen: true,
            orderId,
            priceChanges: order.priceChanges as PriceChanges
          });
          return;
        } else {
          // No price changes data available, proceed directly to payment
          // This handles cases where admin updated price but priceChanges data is missing
          console.warn('Order has ADJUSTMENT_REQUIRED status but missing priceChanges data, proceeding with payment');
        }
      }

      // No admin price changes, proceed directly to payment
      const result = await orderApi.continuePayment(orderId, {
        successUrl,
        cancelUrl
      });

      if (result.payment?.checkout_url) {
        // Redirect to payment
        window.location.href = result.payment.checkout_url;
      }
    } catch (error) {
      console.error('Error continuing payment:', error);
      // TODO: Add proper error handling with toast
    } finally {
      setContinuingPayment(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Handler for approving price changes
  const handleApprovePriceChanges = async () => {
    if (!priceChangeModal.orderId) return;

    setContinuingPayment(prev => ({ ...prev, [priceChangeModal.orderId]: true }));

    try {
      const currentUrl = window.location.origin;
      const successUrl = `${currentUrl}/buyer/payment/success?orderId=${priceChangeModal.orderId}`;
      const cancelUrl = `${currentUrl}/buyer/orders`;

      const result = await orderApi.approvePriceChanges(priceChangeModal.orderId, {
        successUrl,
        cancelUrl
      });

      if (result.payment?.checkout_url) {
        // Close modal and redirect to payment
        setPriceChangeModal({ isOpen: false, orderId: '', priceChanges: null });
        window.location.href = result.payment.checkout_url;
      }
    } catch (error) {
      console.error('Error approving price changes:', error);
      // TODO: Add proper error handling with toast
    } finally {
      setContinuingPayment(prev => ({ ...prev, [priceChangeModal.orderId]: false }));
    }
  };

  // Handler for closing price change modal
  const handleClosePriceChangeModal = () => {
    setPriceChangeModal({ isOpen: false, orderId: '', priceChanges: null });
  };

  const formatDate = (dateString: string) => {
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

  // Helper function to limit product name to specific number of words
  const limitWords = (text: string, wordLimit: number = 7): string => {
    if (!text) return text;
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Helper function to get product thumbnail image
  const getProductThumbnail = (order: Order) => {
    // Check for artifacts in productSpec (similar to quote list)
    const artifacts = order.productSpec?.product_specifications?.artifacts;
    const uploadedArtifacts = artifacts?.uploaded_artifacts || [];
    const imageArtifacts = uploadedArtifacts.filter((artifact: any) =>
      artifact.content_type?.startsWith('image/') && artifact.s3_url
    );

    // Get the first image artifact for thumbnail
    return imageArtifacts[0];
  };


  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4 md:pb-3">
              <div className="flex gap-3 flex-col sm:flex-row sm:justify-between items-start">
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                  {/* Thumbnail skeleton */}
                  <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-md flex-shrink-0" />

                  {/* Content skeleton */}
                  <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-5 w-32 sm:h-6 sm:w-48" />
                    </div>
                    <Skeleton className="h-3.5 sm:h-4 w-32 sm:w-40 mb-1" />
                    <div className="hidden sm:flex items-center gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-2" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex flex-col gap-1 sm:hidden">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </div>

                {/* Status badges skeleton */}
                <div className="flex flex-col gap-1.5 sm:gap-2 w-full sm:w-auto sm:self-start">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-16 sm:w-20" />
                    <Skeleton className="h-5 w-20 sm:w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-12 sm:w-16" />
                    <Skeleton className="h-5 w-16 sm:w-20" />
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const activeOrders = filteredSortedOrders.filter(order => order.status !== ORDER_STATUS.PRODUCTION_COMPLETED);
  const shippingOrders = filteredSortedOrders.filter(order =>
    order.status === ORDER_STATUS.PRODUCTION_COMPLETED &&
    (!order.shipmentStatus || order.shipmentStatus !== SHIPMENT_STATUS.DELIVERED)
  );
  const completedOrders = filteredSortedOrders.filter(order => order.status === ORDER_STATUS.PRODUCTION_COMPLETED && order.shipmentStatus === SHIPMENT_STATUS.DELIVERED);

  // Helper function to render the latest tracking update only (for direct display in the card)
  const renderLatestTrackingUpdate = (order: Order) => {
    if (loadingTracking[order.orderId]) {
      return (
        <div className="mt-3 py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-md animate-pulse">
          <p className="text-sm text-muted-foreground">Loading tracking information...</p>
        </div>
      );
    }

    if (trackingDetails[order.orderId] && trackingDetails[order.orderId].items?.length > 0) {
      const details = trackingDetails[order.orderId];
      const isDelivered = details.status === 'Delivered';

      // Show only the latest update
      const latestUpdate = details.items[0];

      return (
        <div className="mt-3 border-t pt-3 border-dashed border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Latest Update</h4>
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <div className={`w-3 h-3 rounded-full ${isDelivered ? 'bg-green-500' : 'bg-blue-500'}`} />
            </div>
            <div className="flex-grow">
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-xs font-medium ${isDelivered ? 'text-green-700' : 'text-blue-700'}`}>
                  {latestUpdate.dateTime ? formatDate(latestUpdate.dateTime) : ''}
                </span>
              </div>
              <p className="text-sm font-medium">{latestUpdate.info || 'Status update'}</p>
              {latestUpdate.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {latestUpdate.location}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Helper function to render full tracking information (for the expanded view)
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
          {/* Tracking History - Skip the blue banner since it's already shown in the card */}
          {details.items && details.items.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Tracking History</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 -mr-2">
                {details.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`border-l-2 pl-4 py-2 relative ${index === 0 ? (isDelivered ? 'border-green-400' : 'border-blue-400') : 'border-gray-200'}`}
                  >
                    <div
                      className={`absolute w-3 h-3 rounded-full -left-[6.5px] top-3 ${index === 0 ? (isDelivered ? 'bg-green-400' : 'bg-blue-400') : 'bg-gray-300'}`}
                    ></div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium">
                        {formatDate(item.dateTime)}
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

          {/* Additional Details */}
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
        <p className="text-sm text-muted-foreground mt-1">Please check back later for updates.</p>
      </div>
    );
  };

  // renderOrderSummaryCard removed; OrderCard component is used instead

  return (
    <Tabs defaultValue="active" className="w-full">
  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between items-center mb-4">
        <TabsList className="h-auto">
          <TabsTrigger value="active" className="text-wrap">Active Orders</TabsTrigger>
          <TabsTrigger value="shipping" className="text-wrap">Shipping Orders</TabsTrigger>
          <TabsTrigger value="completed" className="text-wrap">Completed Orders</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-3 self-end w-full sm:w-auto">
          <div className="w-full max-w-md">
            <Input
              placeholder="Search orders, product name, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="hidden sm:block">
            <OrderSortSelect value={sortOption} onChange={setSortOption} />
          </div>
        </div>
      </div>

  {/* Dashboard visualizations */}
  <OrderDashboard orders={filteredSortedOrders} />

  <div className="mt-3 flex items-center gap-2">
    <button
      aria-label="Timeline view"
      onClick={() => setViewMode('timeline')}
      className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
    >
      <Clock className="w-4 h-4" />
    </button>
    <button
      aria-label="Calendar view"
      onClick={() => setViewMode('calendar')}
      className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
    >
      <CalendarIcon className="w-4 h-4" />
    </button>
  </div>

      <TabsContent value="active">
        {viewMode === 'timeline' ? (
          <TimelineView
            orders={activeOrders}
            onOrderClick={(order) => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
            trackingDetails={trackingDetails}
            loadingTracking={loadingTracking}
            onContinuePayment={handleContinuePayment}
            continuingPayment={continuingPayment}
          />
        ) : viewMode === 'calendar' ? (
          <CalendarView
            orders={activeOrders}
            onOrderClick={(order) => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
            dayMaxEvents={3}
          />
        ) : ( (activeOrders.length > 20) ? (
            <FixedSizeList
              height={600}
              itemCount={activeOrders.length}
              itemSize={170}
              width={'100%'}
            >
                {(props: { index: number; style: React.CSSProperties }) => {
                  const { index, style } = props;
                  const order = activeOrders[index];
                  return (
                    <div style={style} key={order.orderId}>
                      <OrderCard
                        order={order}
                        isExpanded={expandedOrderId === order.orderId}
                        onToggleExpand={(id) => setExpandedOrderId(expandedOrderId === id ? null : id)}
                        renderLatestTrackingUpdate={renderLatestTrackingUpdate}
                        renderTrackingInfo={renderTrackingInfo}
                        onContinuePayment={handleContinuePayment}
                        continuingPayment={continuingPayment}
                      />
                    </div>
                  );
                }}
            </FixedSizeList>
          ) : (
            <div className="grid gap-4">
              {activeOrders.length > 0 ? (
                activeOrders.map(order => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    isExpanded={expandedOrderId === order.orderId}
                    onToggleExpand={(id) => setExpandedOrderId(expandedOrderId === id ? null : id)}
                    renderLatestTrackingUpdate={renderLatestTrackingUpdate}
                    renderTrackingInfo={renderTrackingInfo}
                    onContinuePayment={handleContinuePayment}
                    continuingPayment={continuingPayment}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No active orders found
                </p>
              )}
            </div>
          )
        )}
      </TabsContent>

      <TabsContent value="shipping">
        {viewMode === 'timeline' ? (
          <TimelineView
            orders={shippingOrders}
            onOrderClick={(order) => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
            trackingDetails={trackingDetails}
            loadingTracking={loadingTracking}
            onContinuePayment={handleContinuePayment}
            continuingPayment={continuingPayment}
          />
        ) : viewMode === 'calendar' ? (
          <CalendarView
            orders={shippingOrders}
            onOrderClick={(order) => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
            dayMaxEvents={3}
          />
        ) : ( (shippingOrders.length > 20) ? (
            <FixedSizeList
              height={600}
              itemCount={shippingOrders.length}
              itemSize={170}
              width={'100%'}
            >
              {(props: { index: number; style: React.CSSProperties }) => {
                const { index, style } = props;
                const order = shippingOrders[index];
                return (
                  <div style={style} key={order.orderId}>
                    <OrderCard
                      order={order}
                      isExpanded={expandedOrderId === order.orderId}
                      onToggleExpand={(id) => setExpandedOrderId(expandedOrderId === id ? null : id)}
                      renderLatestTrackingUpdate={renderLatestTrackingUpdate}
                      renderTrackingInfo={renderTrackingInfo}
                      onContinuePayment={handleContinuePayment}
                      continuingPayment={continuingPayment}
                    />
                  </div>
                );
              }}
            </FixedSizeList>
          ) : (
            <div className="grid gap-4">
              {shippingOrders.length > 0 ? (
                shippingOrders.map(order => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    isExpanded={expandedOrderId === order.orderId}
                    onToggleExpand={(id) => setExpandedOrderId(expandedOrderId === id ? null : id)}
                    renderLatestTrackingUpdate={renderLatestTrackingUpdate}
                    renderTrackingInfo={renderTrackingInfo}
                    onContinuePayment={handleContinuePayment}
                    continuingPayment={continuingPayment}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No orders in shipping or delivery
                </p>
              )}
            </div>
          )
        )}
      </TabsContent>

      <TabsContent value="completed">
        {viewMode === 'timeline' ? (
          <TimelineView
            orders={completedOrders}
            onOrderClick={(order) => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
            trackingDetails={trackingDetails}
            loadingTracking={loadingTracking}
            onContinuePayment={handleContinuePayment}
            continuingPayment={continuingPayment}
          />
        ) : viewMode === 'calendar' ? (
          <CalendarView
            orders={completedOrders}
            onOrderClick={(order) => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
            dayMaxEvents={3}
          />
        ) : ( (completedOrders.length > 20) ? (
            <FixedSizeList
              height={600}
              itemCount={completedOrders.length}
              itemSize={170}
              width={'100%'}
            >
              {(props: { index: number; style: React.CSSProperties }) => {
                const { index, style } = props;
                const order = completedOrders[index];
                return (
                  <div style={style} key={order.orderId}>
                    <OrderCard
                      order={order}
                      isExpanded={expandedOrderId === order.orderId}
                      onToggleExpand={(id) => setExpandedOrderId(expandedOrderId === id ? null : id)}
                      renderLatestTrackingUpdate={renderLatestTrackingUpdate}
                      renderTrackingInfo={renderTrackingInfo}
                      onContinuePayment={handleContinuePayment}
                      continuingPayment={continuingPayment}
                    />
                  </div>
                );
              }}
            </FixedSizeList>
          ) : (
            <div className="grid gap-4">
              {completedOrders.length > 0 ? (
                  completedOrders.map(order => (
                    <OrderCard
                      key={order.orderId}
                      order={order}
                      isExpanded={expandedOrderId === order.orderId}
                      onToggleExpand={(id) => setExpandedOrderId(expandedOrderId === id ? null : id)}
                      renderLatestTrackingUpdate={renderLatestTrackingUpdate}
                      renderTrackingInfo={renderTrackingInfo}
                      onContinuePayment={handleContinuePayment}
                      continuingPayment={continuingPayment}
                    />
                  ))
                ) : (
                <p className="text-center text-muted-foreground py-8">
                  No completed orders found
                </p>
              )}
            </div>
          )
        )}
      </TabsContent>

      {/* Price Change Modal */}
      <PriceChangeModal
        isOpen={priceChangeModal.isOpen}
        onClose={handleClosePriceChangeModal}
        onApprove={handleApprovePriceChanges}
        priceChanges={priceChangeModal.priceChanges!}
        orderId={priceChangeModal.orderId}
        loading={continuingPayment[priceChangeModal.orderId]}
      />
    </Tabs>
  );
}
