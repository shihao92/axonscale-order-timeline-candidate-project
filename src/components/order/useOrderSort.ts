import { useState, useMemo } from 'react';
import { Order } from '@/types/order';
import { OrderSortOption } from './OrderSortSelect';

export function useOrderSort(orders: Order[]) {
  const [sortOption, setSortOption] = useState<OrderSortOption>({
    value: 'createdAt',
    direction: 'desc'
  });

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aValue = new Date(a[sortOption.value]).getTime();
      const bValue = new Date(b[sortOption.value]).getTime();

      return sortOption.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });
  }, [orders, sortOption]);

  return {
    sortedOrders,
    sortOption,
    setSortOption
  };
}
