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
    default: 'bg-[#111111] text-white border border-[#111111]',
    secondary: 'bg-[#f4f4f4] text-[#333333] border border-[#e8e8e8]',
    outline: 'border border-[#e8e8e8] text-[#666666] bg-white',
    destructive: 'bg-rose-50 text-rose-800 border border-rose-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    high: 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold',
    potential: 'bg-blue-50 text-blue-800 border border-blue-200',
    low: 'bg-[#f4f4f4] text-[#666666] border border-[#e8e8e8]',
    disqualified: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-tight transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
