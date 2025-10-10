'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  className?: string;
  children: React.ReactNode;
}

export function AuthButton({
  loading = false,
  loadingText,
  className,
  children,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <Button
      className={cn('w-full', className)}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </Button>
  );
}
