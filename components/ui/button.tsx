import * as React from 'react';
import { cn } from '@/lib/utils';

export function Button({ className, variant = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' }) {
  return <button className={cn('inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed', variant === 'default' && 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90', variant === 'outline' && 'border bg-transparent', variant === 'ghost' && 'bg-transparent hover:bg-[var(--muted)]', className)} {...props} />;
}
