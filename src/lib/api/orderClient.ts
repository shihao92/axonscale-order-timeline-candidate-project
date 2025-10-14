import { apiRequest } from './client';
import { API_CONFIG } from '@/config/api';
import { Order } from '@/types/order';
import { MOCK_ORDERS } from './mockData';

// Set to true to use mock data instead of real API
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export interface OrderResponse {
  orders: Order[];
}

export interface TrackingInfoResponse {
  orderId: string;
  supplierId: string;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  trackingDetails?: any;
  hasTracking: boolean;
  message?: string;
}

export interface ContinuePaymentRequest {
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentSessionResponse {
  checkout_session_id: string;
  checkout_url: string;
  amount_cny: number;
  payment_currency: string;
  settlement_currency: string;
  currency_conversion_enabled: boolean;
}

export interface ContinuePaymentResponse {
  payment: PaymentSessionResponse;
  message: string;
  order_id: string;
}

export interface PriceChanges {
  has_significant_changes: boolean;
  currency: string;
  admin_updated?: boolean;
  updated_by?: string;
  changes: {
    product_price: PriceChange;
    shipping_cost: PriceChange;
    service_charge: PriceChange;
    estimated_total: PriceChange;
  };
}

export interface PriceChange {
  old: number;
  new: number;
  difference: number;
  percentage_change: number;
}

class OrderClient {
  private baseUrl: string;
  // Simple in-memory caches
  private ordersCache: Map<string, { data: OrderResponse; expires: number }> = new Map();
  private trackingCache: Map<string, { data: TrackingInfoResponse; expires: number }> = new Map();

  // Default cache TTL in ms
  private defaultTtl = 60 * 1000; // 60 seconds

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  private createUrl(path: string = '', params: Record<string, string> = {}): string {
    const queryString = new URLSearchParams(params).toString();
    return `${this.baseUrl}/orders${path}${queryString ? `?${queryString}` : ''}`;
  }

  private createAdminUrl(path: string = '', params: Record<string, string> = {}, endpoint: 'shipments' | 'orders' = 'shipments'): string {
    const queryString = new URLSearchParams(params).toString();
    return `${this.baseUrl}/admin/${endpoint}${path}${queryString ? `?${queryString}` : ''}`;
  }

  private async handleRequest<T>(
    path: string,
    options: RequestInit = {},
    params: Record<string, string> = {},
    token?: string,
    isAdmin: boolean = false,
    adminEndpoint: 'shipments' | 'orders' = 'shipments'
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers['Authorization'] = tokenWithBearer;
    }

    const url = isAdmin ? this.createAdminUrl(path, params, adminEndpoint) : this.createUrl(path, params);

    return await apiRequest<T>(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  }

  async getOrdersByBuyer(buyerId: string, token?: string): Promise<OrderResponse> {
    const cacheKey = `orders:${buyerId}`;
    const now = Date.now();
    const cached = this.ordersCache.get(cacheKey);
    if (cached && cached.expires > now) {
      return cached.data;
    }

    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log('📦 Using mock data for orders');
      const data: OrderResponse = { orders: MOCK_ORDERS };
      this.ordersCache.set(cacheKey, { data, expires: now + this.defaultTtl });
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, 500); // Simulate network delay
      });
    }

    const data = await this.handleRequest<OrderResponse>('', {
      method: 'GET',
    }, { buyerId }, token);

    this.ordersCache.set(cacheKey, { data, expires: now + this.defaultTtl });
    return data;
  }

  async getTrackingInfo(
    orderId: string,
    supplierId: string,
    token?: string
  ): Promise<TrackingInfoResponse> {
    const cacheKey = `tracking:${orderId}:${supplierId}`;
    const now = Date.now();
    const cached = this.trackingCache.get(cacheKey);
    if (cached && cached.expires > now) {
      return cached.data;
    }

    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      const order = MOCK_ORDERS.find(o => o.orderId === orderId);
      const response: TrackingInfoResponse = {
        orderId,
        supplierId,
        trackingNumber: order?.trackingNumber,
        carrier: order?.carrier,
        trackingUrl: order?.trackingUrl,
        trackingDetails: order?.trackingDetails,
        hasTracking: !!order?.trackingNumber
      };
      this.trackingCache.set(cacheKey, { data: response, expires: now + this.defaultTtl });
      return new Promise((resolve) => setTimeout(() => resolve(response), 300));
    }

    const data = await this.handleRequest<TrackingInfoResponse>(
      `/${orderId}/tracking`,
      {
        method: 'GET',
      },
      { supplierId: supplierId },
      token,
      true
    );

    this.trackingCache.set(cacheKey, { data, expires: now + this.defaultTtl });
    return data;
  }

  async continuePayment(
    orderId: string,
    request: ContinuePaymentRequest,
    token?: string
  ): Promise<ContinuePaymentResponse> {
    // Mock response for demo
    if (USE_MOCK_DATA) {
      console.log('💳 Mock payment continuation for order:', orderId);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            payment: {
              checkout_session_id: 'mock_session_123',
              checkout_url: '#payment-demo',
              amount_cny: 1000,
              payment_currency: 'GBP',
              settlement_currency: 'GBP',
              currency_conversion_enabled: false
            },
            message: 'Payment session created',
            order_id: orderId
          });
        }, 500);
      });
    }

    return await this.handleRequest<ContinuePaymentResponse>(
      `/${orderId}/continue-payment`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      {},
      token
    );
  }

  async approvePriceChanges(
    orderId: string,
    request: ContinuePaymentRequest,
    token?: string
  ): Promise<ContinuePaymentResponse> {
    // Mock response for demo
    if (USE_MOCK_DATA) {
      console.log('✅ Mock price change approval for order:', orderId);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            payment: {
              checkout_session_id: 'mock_session_456',
              checkout_url: '#payment-demo',
              amount_cny: 1200,
              payment_currency: 'GBP',
              settlement_currency: 'GBP',
              currency_conversion_enabled: false
            },
            message: 'Price changes approved',
            order_id: orderId
          });
        }, 500);
      });
    }

    return await this.handleRequest<ContinuePaymentResponse>(
      `/${orderId}/approve-price-changes`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      {},
      token
    );
  }
}

export const orderApi = new OrderClient(API_CONFIG.ORDER_API_URL);
