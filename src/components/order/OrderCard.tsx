"use client";

import React from 'react';
import { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ExternalLink, ChevronDown, ChevronUp, MapPin, AlertCircle, CreditCard } from 'lucide-react';
import { PresignedImage } from '@/components/quote/PresignedImage';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ORDER_STATUS, SHIPMENT_STATUS, PAYMENT_STATUS } from '@/types/order';

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggleExpand: (orderId: string) => void;
  renderLatestTrackingUpdate: (order: Order) => React.ReactNode;
  renderTrackingInfo: (order: Order) => React.ReactNode;
  onContinuePayment?: (orderId: string) => void;
  continuingPayment?: Record<string, boolean>;
}

export default function OrderCard({ order, isExpanded, onToggleExpand, renderLatestTrackingUpdate, renderTrackingInfo, onContinuePayment, continuingPayment = {} }: OrderCardProps) {
  const getProductThumbnail = () => {
    const artifacts = order.productSpec?.product_specifications?.artifacts;
    const uploadedArtifacts = artifacts?.uploaded_artifacts || [];
    const imageArtifacts = uploadedArtifacts.filter((artifact: any) =>
      artifact.content_type?.startsWith('image/') && artifact.s3_url
    );
    return imageArtifacts[0];
  };

  const thumbnail = getProductThumbnail();

  return (
    <Collapsible open={isExpanded} onOpenChange={() => onToggleExpand(order.orderId)} className="w-full">
      <Card className="overflow-hidden card-elevated soft-transition group">
        <CardHeader className="p-3 sm:p-4 md:p-6 pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0 w-full sm:w-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                {thumbnail?.s3_url ? (
                  <PresignedImage s3Url={thumbnail.s3_url} alt={thumbnail.filename || 'Product'} className="w-full h-full object-cover hover-zoom" />
                ) : (
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-foreground leading-tight">
                  {order.productSpec?.product_specifications?.product_name || order.productSpec?.productName || 'Product'}
                </CardTitle>
                <div className="text-xs sm:text-sm text-muted-foreground">Supplier: {order.supplierId}</div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span>Order #{order.orderId.slice(0, 8)}</span>
                  <span>•</span>
                  <span>Quote #{order.quoteId.slice(0, 8)}</span>
                  <span>•</span>
                  <span>Created {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Production:</span>
                <Badge variant={order.status === ORDER_STATUS.PRODUCTION_COMPLETED ? 'success' : 'default'}>
                  {order.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              {order.paymentStatus && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Payment:</span>
                  <Badge variant={order.paymentStatus === PAYMENT_STATUS.PAID ? 'success' : 'secondary'} className="text-xs">
                    {order.paymentStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>
              )}
              {order.status === ORDER_STATUS.PRODUCTION_COMPLETED && order.shipmentStatus && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Shipment:</span>
                  <Badge variant={order.shipmentStatus === SHIPMENT_STATUS.DELIVERED ? 'success' : 'secondary'} className="text-xs">
                    {order.shipmentStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="space-y-2 flex-1">
              {order.status === ORDER_STATUS.PRODUCTION_COMPLETED && order.trackingNumber && !isExpanded && renderLatestTrackingUpdate(order)}
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2 py-1 h-auto self-start sm:self-center">
                <span className="text-xs text-primary sm:hover:underline flex items-center gap-1 whitespace-nowrap">
                  {isExpanded ? (<>Hide Details <ChevronUp className="h-3 w-3" /></>) : (<>View Details <ChevronDown className="h-3 w-3" /></>)}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardContent>

        <CollapsibleContent>
          <Separator />
          <CardContent className="pt-4">
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
                  <div className="text-center py-4 text-muted-foreground">Timeline details are available in the timeline view.</div>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="mt-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">{order.currency || '\u00a5'}{order.totalPrice || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p>{order.paymentStatus || 'Paid'}</p>
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
}
