import { cn } from '@/lib/utils';
import type { TextareaHTMLAttributes } from 'react';
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn('min-h-32 w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]', className)} {...props} />; }
