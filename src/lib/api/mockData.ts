import { Order, ORDER_STATUS, ORDER_TYPE, PAYMENT_STATUS, SHIPMENT_STATUS } from '@/types/order';

// Mock order data for candidate assessment
export const MOCK_ORDERS: Order[] = [
  {
    orderId: 'ORD-2024-001',
    quoteId: 'QUO-2024-001',
    supplierId: 'Shenzhen Electronics Co.',
    buyerId: 'demo@buyer.com',
    status: ORDER_STATUS.PRODUCTION,
    orderType: ORDER_TYPE.MAIN,
    productSpec: {
      productName: 'Custom Wireless Headphones',
      product_specifications: {
        product_name: 'Custom Wireless Headphones',
        artifacts: {
          uploaded_artifacts: [
            {
              s3_url: '/headphone.png',
              content_type: 'image/png',
              filename: 'headphones.png'
            }
          ]
        }
      }
    },
    quantity: 5000,
    totalPrice: 45000,
    currency: '¥',
    shippingCost: 3000,
    serviceCharge: 2250,
    estimatedShippingDaysMin: 7,
    estimatedShippingDaysMax: 10,
    paymentStatus: PAYMENT_STATUS.PAID,
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2024-10-05T14:30:00Z',
    timelineData: {
      orderType: 'MAIN',
      production: {
        start: '2024-10-02T00:00:00Z',
        duration_days: 45,
        duration_days_min: 40,
        duration_days_max: 50,
        note: 'Production started on schedule'
      },
      shipping: {
        duration_days: 8,
        duration_days_min: 7,
        duration_days_max: 10
      },
      has_started: true
    },
    updates: [
      {
        updateId: 'UPD-001',
        orderId: 'ORD-2024-001',
        type: 'PRODUCTION',
        timestamp: '2024-10-05T14:30:00Z',
        description: 'Production 30% complete. Quality checks passed.',
        attachments: []
      },
      {
        updateId: 'UPD-002',
        orderId: 'ORD-2024-001',
        type: 'PRODUCTION',
        timestamp: '2024-10-02T09:00:00Z',
        description: 'Production started. Materials received and verified.',
        attachments: []
      }
    ]
  },
  {
    orderId: 'ORD-2024-002',
    quoteId: 'QUO-2024-002',
    supplierId: 'Guangzhou Manufacturing Ltd.',
    buyerId: 'demo@buyer.com',
    status: ORDER_STATUS.PRODUCTION_COMPLETED,
    orderType: ORDER_TYPE.MAIN,
    productSpec: {
      productName: 'Bluetooth Speaker with LED Display',
      product_specifications: {
        product_name: 'Bluetooth Speaker with LED Display'
      }
    },
    quantity: 3000,
    totalPrice: 28500,
    currency: '¥',
    shippingCost: 2200,
    serviceCharge: 1500,
    estimatedShippingDaysMin: 10,
    estimatedShippingDaysMax: 14,
    paymentStatus: PAYMENT_STATUS.PAID,
    shipmentStatus: SHIPMENT_STATUS.IN_TRANSIT,
    trackingNumber: 'TRK-2024-9876543210',
    carrier: 'DHL Express',
    trackingUrl: 'https://example.com/track/TRK-2024-9876543210',
    createdAt: '2024-09-15T10:00:00Z',
    updatedAt: '2024-10-08T16:45:00Z',
    timelineData: {
      orderType: 'MAIN',
      production: {
        start: '2024-09-16T00:00:00Z',
        end: '2024-10-05T00:00:00Z',
        duration_days: 19
      },
      shipping: {
        start: '2024-10-05T00:00:00Z',
        duration_days: 12,
        duration_days_min: 10,
        duration_days_max: 14
      },
      has_started: true
    },
    trackingDetails: {
      billid: 'TRK-2024-9876543210',
      status: 'In Transit',
      destination: 'London, UK',
      items: [
        {
          dateTime: '2024-10-08T16:45:00Z',
          location: 'Frankfurt, Germany',
          info: 'Package arrived at sorting facility'
        },
        {
          dateTime: '2024-10-07T08:20:00Z',
          location: 'Shenzhen, China',
          info: 'Package departed from origin country'
        },
        {
          dateTime: '2024-10-05T14:00:00Z',
          location: 'Guangzhou, China',
          info: 'Package picked up by carrier'
        }
      ]
    },
    updates: [
      {
        updateId: 'UPD-003',
        orderId: 'ORD-2024-002',
        type: 'SHIPMENT',
        timestamp: '2024-10-05T14:00:00Z',
        description: 'Package picked up by DHL. Tracking number: TRK-2024-9876543210',
        attachments: []
      },
      {
        updateId: 'UPD-004',
        orderId: 'ORD-2024-002',
        type: 'PRODUCTION',
        timestamp: '2024-10-04T12:00:00Z',
        description: 'Final quality inspection completed. All units passed.',
        attachments: []
      }
    ]
  },
  {
    orderId: 'ORD-2024-003',
    quoteId: 'QUO-2024-003',
    supplierId: 'Dongguan Tech Industries',
    buyerId: 'demo@buyer.com',
    status: ORDER_STATUS.CREATED,
    orderType: ORDER_TYPE.PHYSICAL_SAMPLE,
    productSpec: {
      productName: 'Smart Watch Prototype',
      product_specifications: {
        product_name: 'Smart Watch Prototype'
      }
    },
    quantity: 10,
    totalPrice: 1200,
    currency: '¥',
    shippingCost: 150,
    serviceCharge: 60,
    estimatedShippingDaysMin: 5,
    estimatedShippingDaysMax: 7,
    paymentStatus: PAYMENT_STATUS.PENDING,
    createdAt: '2024-10-09T11:00:00Z',
    updatedAt: '2024-10-09T11:00:00Z',
    timelineData: {
      orderType: 'PHYSICAL_SAMPLE',
      production: {
        duration_days: 5,
        duration_days_min: 5,
        duration_days_max: 7
      },
      shipping: {
        duration_days: 6,
        duration_days_min: 5,
        duration_days_max: 7
      },
      has_started: false
    },
    updates: []
  },
  {
    orderId: 'ORD-2024-004',
    quoteId: 'QUO-2024-004',
    supplierId: 'Beijing Quality Manufacturing',
    buyerId: 'demo@buyer.com',
    status: ORDER_STATUS.QUALITY_ASSURANCE,
    orderType: ORDER_TYPE.MAIN,
    productSpec: {
      productName: 'USB-C Fast Charging Cable',
      product_specifications: {
        product_name: 'USB-C Fast Charging Cable'
      }
    },
    quantity: 10000,
    totalPrice: 15000,
    currency: '¥',
    shippingCost: 1800,
    serviceCharge: 900,
    estimatedShippingDaysMin: 12,
    estimatedShippingDaysMax: 15,
    paymentStatus: PAYMENT_STATUS.ADJUSTMENT_REQUIRED,
    createdAt: '2024-09-20T09:30:00Z',
    updatedAt: '2024-10-09T10:00:00Z',
    timelineData: {
      orderType: 'MAIN',
      production: {
        start: '2024-09-21T00:00:00Z',
        duration_days: 25,
        duration_days_min: 23,
        duration_days_max: 27,
        note: 'Quality assurance in progress'
      },
      shipping: {
        duration_days: 13,
        duration_days_min: 12,
        duration_days_max: 15
      },
      has_started: true
    },
    priceChanges: {
      has_significant_changes: true,
      currency: '¥',
      admin_updated: true,
      updated_by: 'admin@axonscale.com',
      changes: {
        product_price: {
          old: 15000,
          new: 16500,
          difference: 1500,
          percentage_change: 10.0
        },
        shipping_cost: {
          old: 1800,
          new: 2000,
          difference: 200,
          percentage_change: 11.1
        },
        service_charge: {
          old: 900,
          new: 990,
          difference: 90,
          percentage_change: 10.0
        },
        estimated_total: {
          old: 17700,
          new: 19490,
          difference: 1790,
          percentage_change: 10.1
        }
      }
    },
    updates: [
      {
        updateId: 'UPD-005',
        orderId: 'ORD-2024-004',
        type: 'PRODUCTION',
        timestamp: '2024-10-09T10:00:00Z',
        description: 'Quality assurance testing in progress. Random sample testing shows 98% pass rate.',
        attachments: []
      }
    ]
  },
  {
    orderId: 'ORD-2024-005',
    quoteId: 'QUO-2024-005',
    supplierId: 'Shanghai Premium Products',
    buyerId: 'demo@buyer.com',
    status: ORDER_STATUS.PRODUCTION_COMPLETED,
    orderType: ORDER_TYPE.MAIN,
    productSpec: {
      productName: 'Wireless Gaming Mouse',
      product_specifications: {
        product_name: 'Wireless Gaming Mouse'
      }
    },
    quantity: 2000,
    totalPrice: 24000,
    currency: '¥',
    shippingCost: 1500,
    serviceCharge: 1200,
    estimatedShippingDaysMin: 8,
    estimatedShippingDaysMax: 12,
    paymentStatus: PAYMENT_STATUS.PAID,
    shipmentStatus: SHIPMENT_STATUS.DELIVERED,
    trackingNumber: 'TRK-2024-1234567890',
    carrier: 'FedEx',
    trackingUrl: 'https://example.com/track/TRK-2024-1234567890',
    createdAt: '2024-08-15T08:00:00Z',
    updatedAt: '2024-09-25T14:00:00Z',
    timelineData: {
      orderType: 'MAIN',
      production: {
        start: '2024-08-16T00:00:00Z',
        end: '2024-09-10T00:00:00Z',
        duration_days: 25
      },
      shipping: {
        start: '2024-09-10T00:00:00Z',
        end: '2024-09-20T00:00:00Z',
        duration_days: 10
      },
      has_started: true
    },
    trackingDetails: {
      billid: 'TRK-2024-1234567890',
      status: 'Delivered',
      destination: 'New York, USA',
      items: [
        {
          dateTime: '2024-09-20T14:30:00Z',
          location: 'New York, USA',
          info: 'Package delivered successfully'
        },
        {
          dateTime: '2024-09-20T09:15:00Z',
          location: 'New York, USA',
          info: 'Out for delivery'
        },
        {
          dateTime: '2024-09-15T16:00:00Z',
          location: 'Los Angeles, USA',
          info: 'Cleared customs'
        }
      ]
    },
    updates: [
      {
        updateId: 'UPD-006',
        orderId: 'ORD-2024-005',
        type: 'SHIPMENT',
        timestamp: '2024-09-20T14:30:00Z',
        description: 'Package delivered successfully to customer',
        attachments: []
      }
    ]
  }
];
