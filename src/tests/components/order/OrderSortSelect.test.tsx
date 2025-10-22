import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { OrderSortSelect } from '@/components/order/OrderSortSelect';

// Mock the select primitives. The factory captures the most recent onValueChange and
// the SelectItem calls it when clicked so tests can simulate user selection.
vi.mock('@/components/ui/select', () => {
  let onValueChangeGlobal: any = null;

  return {
    Select: ({ children, value, onValueChange }: any) => {
      onValueChangeGlobal = onValueChange;
      return <div data-testid="select-root" data-value={value}>{children}</div>;
    },
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ value, children }: any) => (
      <button data-value={value} onClick={() => onValueChangeGlobal?.(value)}>{children}</button>
    )
  };
});

describe('OrderSortSelect', () => {
  it('renders options and calls onChange with parsed value (user interaction)', () => {
    const onChange = vi.fn();
    render(<OrderSortSelect value={{ value: 'createdAt', direction: 'desc' }} onChange={onChange} />);

    const root = screen.getByTestId('select-root');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-value', 'createdAt-desc');

    // Click the option that corresponds to 'createdAt-asc' (Oldest First)
    const opt = screen.getByText('Oldest First');
    fireEvent.click(opt);

    expect(onChange).toHaveBeenCalledWith({ value: 'createdAt', direction: 'asc' });
  });
});
