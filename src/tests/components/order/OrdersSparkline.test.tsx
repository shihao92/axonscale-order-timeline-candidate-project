import React from 'react';
import { render, screen } from '@testing-library/react';
import OrdersSparkline from '@/components/order/OrdersSparkline';

describe('OrdersSparkline', () => {
  it('renders SVG with circles and polyline based on points and has a heading', () => {
    const points = [1, 3, 2, 5];
    render(<OrdersSparkline points={points} />);

    // Use semantic query for heading
    const heading = screen.getByRole('heading', { name: /Orders \(last 14 days\)/i });
    expect(heading).toBeInTheDocument();

    // svg should be present
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // circles count should equal points length
    const circles = svg?.querySelectorAll('circle') || [];
    expect(circles.length).toBe(points.length);
    // polyline should exist
    const polyline = svg?.querySelector('polyline');
    expect(polyline).toBeTruthy();
  });
});
