import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn('flex h-11 w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]', className)} {...props} />; }
