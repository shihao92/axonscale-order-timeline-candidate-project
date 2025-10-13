import React from 'react';
import { render, screen } from '@testing-library/react';
import OrderCard from '@/components/order/OrderCard';

const mockOrder = {
  orderId: 'ORD-123456',
  quoteId: 'Q-1',
  supplierId: 'SUP-1',
  buyerId: 'BUY-1',
  status: 'PRODUCTION',
  orderType: 'MAIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('OrderCard', () => {
  it('renders summary and supplier info', () => {
    render(
      <OrderCard
        order={mockOrder as any}
        isExpanded={false}
        onToggleExpand={() => {}}
        renderLatestTrackingUpdate={() => null}
        renderTrackingInfo={() => null}
      />
    );

    expect(screen.getByText(/Supplier:/)).toBeInTheDocument();
  });
});
