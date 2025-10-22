import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import OrderCard from '@/components/order/OrderCard';

// Mock UI primitives and heavy components so tests remain focused and deterministic
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>
}));

vi.mock('lucide-react', () => ({
  Package: (p: any) => <span {...p}>[pkg]</span>,
  ExternalLink: (p: any) => <span {...p}>[ext]</span>,
  ChevronDown: (p: any) => <span {...p}>[v]</span>,
  ChevronUp: (p: any) => <span {...p}>[^]</span>,
  MapPin: (p: any) => <span {...p}>[pin]</span>,
  AlertCircle: (p: any) => <span {...p}>[!]</span>,
  CreditCard: (p: any) => <span {...p}>[$]</span>
}));

vi.mock('@/components/quote/PresignedImage', () => ({
  PresignedImage: ({ alt }: any) => <img alt={alt} src="/mock.png" />
}));

vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children }: any) => <div>{children}</div>,
  CollapsibleContent: ({ children }: any) => <div>{children}</div>,
  CollapsibleTrigger: ({ children, asChild }: any) => <div>{children}</div>
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>
}));

vi.mock('@/components/ui/separator', () => ({ Separator: () => <hr /> }));

vi.mock('@/components/ui/button', () => ({ Button: ({ children }: any) => <button>{children}</button> }));

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

    // Basic summary and supplier
    expect(screen.getByText(/Supplier:/)).toBeInTheDocument();
    // Product title (defaults to 'Product' because mockOrder has no productSpec)
    expect(screen.getByText(/^Product$/)).toBeInTheDocument();
    // View details button should be present
    expect(screen.getByText(/View Details/)).toBeInTheDocument();
  });
});
