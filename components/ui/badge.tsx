import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'high'
    | 'potential'
    | 'low'
    | 'disqualified';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-900 text-white',
    secondary: 'bg-slate-100 text-slate-800 border border-slate-200',
    outline: 'border border-slate-300 text-slate-700',
    destructive: 'bg-red-50 text-red-700 border border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    high: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold',
    potential: 'bg-blue-50 text-blue-700 border border-blue-200',
    low: 'bg-slate-100 text-slate-600 border border-slate-200',
    disqualified: 'bg-red-50 text-red-600 border border-red-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
