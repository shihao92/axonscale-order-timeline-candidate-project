"use client";

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type OrderSortOption = {
  value: 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
};

interface OrderSortSelectProps {
  value: OrderSortOption;
  onChange: (value: OrderSortOption) => void;
}

export function OrderSortSelect({ value, onChange }: OrderSortSelectProps) {
  const handleChange = (newValue: string) => {
    const [field, direction] = newValue.split('-') as [OrderSortOption['value'], OrderSortOption['direction']];
    onChange({ value: field, direction });
  };

  const currentValue = `${value.value}-${value.direction}`;

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="createdAt-desc">Newest First</SelectItem>
        <SelectItem value="createdAt-asc">Oldest First</SelectItem>
        <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
        <SelectItem value="updatedAt-asc">Least Recently Updated</SelectItem>
      </SelectContent>
    </Select>
  );
}
