import React from 'react';
import { render, screen } from '@testing-library/react';
import OrderStatus from '@/components/order/OrderStatus';

describe('OrderStatus', () => {
  it('renders segments and humanized labels', () => {
    const segments = [
      { key: 'PRODUCTION_COMPLETED', count: 3, pct: 60, color: '#0ea5e9' },
      { key: 'INITIAL_PROCESSING', count: 2, pct: 40, color: '#ef4444' }
    ];

    render(<OrderStatus segments={segments} />);

    expect(screen.getByText('Order Status')).toBeInTheDocument();
    expect(screen.getByText('Production Completed')).toBeInTheDocument();
    expect(screen.getByText('Initial Processing')).toBeInTheDocument();
  });
});
