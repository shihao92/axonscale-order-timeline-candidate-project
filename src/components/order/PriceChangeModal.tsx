"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { PriceChanges } from '@/lib/api/orderClient';

interface PriceChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  priceChanges: PriceChanges;
  orderId: string;
  loading?: boolean;
}

export function PriceChangeModal({ 
  isOpen, 
  onClose, 
  onApprove, 
  priceChanges, 
  orderId, 
  loading = false 
}: PriceChangeModalProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return `${currency === 'CNY' ? '¥' : '£'}${amount.toFixed(2)}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  if (!priceChanges || !priceChanges.changes) {
    return null;
  }

  const hasIncrease = priceChanges.changes.estimated_total.difference > 0;
  const totalChange = Math.abs(priceChanges.changes.estimated_total.difference);
  const totalPercentage = Math.abs(priceChanges.changes.estimated_total.percentage_change);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <DialogTitle>Price Changes Detected</DialogTitle>
          </div>
          <DialogDescription>
            {priceChanges.admin_updated ? (
              <>The prices for order #{orderId.slice(0, 8)} have been updated by our team. 
              Please review the changes below before continuing with payment.</>
            ) : (
              <>The prices for order #{orderId.slice(0, 8)} have changed since you created the order. 
              Please review the changes below before continuing with payment.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Banner */}
          <div className={`p-4 rounded-lg border-l-4 ${
            hasIncrease 
              ? 'bg-orange-50 border-orange-400 dark:bg-orange-950' 
              : 'bg-green-50 border-green-400 dark:bg-green-950'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasIncrease ? (
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                )}
                <span className="font-medium">
                  Total {hasIncrease ? 'Increase' : 'Decrease'}: {formatCurrency(totalChange, priceChanges.currency)}
                </span>
              </div>
              <Badge variant={hasIncrease ? 'destructive' : 'success'} className="text-xs">
                {formatPercentage(priceChanges.changes.estimated_total.percentage_change)}
              </Badge>
            </div>
          </div>

          {/* Detailed Changes */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Price Breakdown</h4>
            
            {/* Product Price */}
            {Math.abs(priceChanges.changes.product_price.difference) > 0.01 && (
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded">
                <span className="text-sm">Product Price</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(priceChanges.changes.product_price.old, priceChanges.currency)}
                  </span>
                  <span>→</span>
                  <span className="font-medium">
                    {formatCurrency(priceChanges.changes.product_price.new, priceChanges.currency)}
                  </span>
                  <Badge variant={priceChanges.changes.product_price.difference > 0 ? 'destructive' : 'success'} className="text-xs">
                    {formatPercentage(priceChanges.changes.product_price.percentage_change)}
                  </Badge>
                </div>
              </div>
            )}

            {/* Shipping Cost */}
            {Math.abs(priceChanges.changes.shipping_cost.difference) > 0.01 && (
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded">
                <span className="text-sm">Shipping Cost</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(priceChanges.changes.shipping_cost.old, priceChanges.currency)}
                  </span>
                  <span>→</span>
                  <span className="font-medium">
                    {formatCurrency(priceChanges.changes.shipping_cost.new, priceChanges.currency)}
                  </span>
                  <Badge variant={priceChanges.changes.shipping_cost.difference > 0 ? 'destructive' : 'success'} className="text-xs">
                    {formatPercentage(priceChanges.changes.shipping_cost.percentage_change)}
                  </Badge>
                </div>
              </div>
            )}

            {/* Service Charge */}
            {Math.abs(priceChanges.changes.service_charge.difference) > 0.01 && (
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded">
                <span className="text-sm">Service Charge</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(priceChanges.changes.service_charge.old, priceChanges.currency)}
                  </span>
                  <span>→</span>
                  <span className="font-medium">
                    {formatCurrency(priceChanges.changes.service_charge.new, priceChanges.currency)}
                  </span>
                  <Badge variant={priceChanges.changes.service_charge.difference > 0 ? 'destructive' : 'success'} className="text-xs">
                    {formatPercentage(priceChanges.changes.service_charge.percentage_change)}
                  </Badge>
                </div>
              </div>
            )}

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded font-medium">
              <span>New Total</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground line-through">
                  {formatCurrency(priceChanges.changes.estimated_total.old, priceChanges.currency)}
                </span>
                <span className="text-lg">
                  {formatCurrency(priceChanges.changes.estimated_total.new, priceChanges.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded">
            <strong>Why did prices change?</strong> {priceChanges.admin_updated ? (
              <>Our team has updated the pricing for this order. This may be due to material cost changes, 
              shipping rate adjustments, or other factors. We always notify you before processing payment with updated pricing.</>
            ) : (
              <>Prices may change due to material cost fluctuations, shipping rate updates, or supplier adjustments. 
              We always inform you of any significant changes before processing payment.</>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel Order
          </Button>
          <Button onClick={onApprove} disabled={loading}>
            {loading ? 'Processing...' : `Accept Changes & Pay ${formatCurrency(priceChanges.changes.estimated_total.new, priceChanges.currency)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}