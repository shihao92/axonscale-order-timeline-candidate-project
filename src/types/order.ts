export interface PurchaseOrder {
    orderId: string;
    productName: string;
    supplier: string;
    quantity: number;
    orderDate: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    totalCost: number;
}

export interface ProductVariation {
    id: string;
    dimensions: Record<string, string>;
    quantity: number;
    color?: string;
}

export const ORDER_STATUS = {
  CREATED: 'CREATED',
  PRODUCTION_PLANNING: 'PRODUCTION_PLANNING',
  INITIAL_PROCESSING: 'INITIAL_PROCESSING',
  PRODUCTION: 'PRODUCTION',
  QUALITY_ASSURANCE: 'QUALITY_ASSURANCE',
  COMPLIANCE_CHECK: 'COMPLIANCE_CHECK',
  PRODUCTION_COMPLETED: 'PRODUCTION_COMPLETED'
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_TYPE = {
  MAIN: 'MAIN',
  PHYSICAL_SAMPLE: 'PHYSICAL_SAMPLE',
  VIDEO_SAMPLE: 'VIDEO_SAMPLE'
} as const;

export type OrderType = typeof ORDER_TYPE[keyof typeof ORDER_TYPE];

export const UPDATE_TYPE = {
  PRODUCTION: 'PRODUCTION',
  SHIPMENT: 'SHIPMENT',
  GENERAL: 'GENERAL'
} as const;

export type UpdateType = typeof UPDATE_TYPE[keyof typeof UPDATE_TYPE];

export enum USER_ROLE {
  BUYER = 'BUYER',
  SUPPLIER = 'SUPPLIER'
}

export type UserRole = USER_ROLE;

export interface OrderUpdate {
  updateId: string;
  orderId: string;
  type: UpdateType;
  status?: string;
  timestamp: string;
  description: string;
  attachments?: string[];
  attachmentUrls?: Record<string, string>;
  metadata?: Record<string, any>;
  userRole?: UserRole;
  updatedBy?: string;
}

export interface TrackingItem {
  dateTime: string;
  location: string;
  info: string;
  content?: string;
}

export interface TrackingInfo {
  billid: string;
  transBillid?: string;
  countryCode?: string;
  country?: string;
  destination?: string;
  dateTime?: string;
  trackstatusSid?: string;
  status?: string;
  items: TrackingItem[];
}

export interface Order {
  orderId: string;
  quoteId: string;
  supplierId: string;
  buyerId: string;
  status: OrderStatus;
  orderType: OrderType;
  productSpec?: Record<string, any>;
  variations?: Record<string, any>[];
  quantity?: number;
  totalPrice?: number;
  currency?: string;
  updates?: OrderUpdate[];
  createdAt: string;
  updatedAt: string;
  shipmentStatus?: ShipmentStatus;
  inTransitStatus?: InTransitStatus;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  trackingDetails?: TrackingInfo;
  paymentStatus?: PaymentStatus;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  estimatedTotal?: number;
  actualTotal?: number;
  shippingCost?: number;
  serviceCharge?: number;
  bufferAmount?: number;
  estimatedShippingDaysMin?: number;
  estimatedShippingDaysMax?: number;
  terms?: Record<string, any>;
  sampleDetails?: Record<string, any>;
  timelineData?: TimelineData;
  priceChanges?: Record<string, any>;
}

export interface TimelineData {
  orderType: 'MAIN' | 'PHYSICAL_SAMPLE' | 'VIDEO_SAMPLE';
  production: TimelinePhase;
  shipping?: TimelinePhase;
  total_duration_days?: number;
  buffer_applied?: number;
  has_started?: boolean;
  error?: string;
}

export interface TimelinePhase {
  start?: string;
  end?: string;
  duration_days: number;
  duration_days_min?: number;
  duration_days_max?: number;
  note?: string;
}

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  PAID: 'PAID',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  FAILED: 'FAILED',
  ADJUSTMENT_REQUIRED: 'ADJUSTMENT_REQUIRED',
  NOT_REQUIRED: 'NOT_REQUIRED'
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export enum ShipmentStatus {
  NOT_STARTED = "NOT_STARTED",
  EXPECTING = "EXPECTING",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED"
}

export const SHIPMENT_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  EXPECTING: 'EXPECTING',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED'
} as const;

export enum InTransitStatus {
  RECEIVED = "RECEIVED",
  LEFT_ORIGIN_COUNTRY = "LEFT_ORIGIN_COUNTRY",
  ARRIVED_DESTINATION_COUNTRY = "ARRIVED_DESTINATION_COUNTRY",
  CUSTOMS_CHECK = "CUSTOMS_CHECK",
  CLEARED_CUSTOMS = "CLEARED_CUSTOMS",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
}
