import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#111111] text-white hover:bg-[#262626] shadow-[0_1px_2px_rgba(17,17,17,0.08)]',
        destructive:
          'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
        outline:
          'border border-[#e8e8e8] bg-white hover:bg-[#fafafa] hover:border-[#cfcfcf] text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.04)]',
        secondary:
          'bg-[#f4f4f4] text-[#111111] hover:bg-[#ececec] border border-transparent',
        ghost:
          'text-[#666666] hover:text-[#111111] hover:bg-[#f4f4f4]',
        link:
          'text-[#111111] underline-offset-4 hover:underline',
        success:
          'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
        glass:
          'glass text-[#111111] hover:bg-white/90 border border-[rgba(17,17,17,0.08)] shadow-[0_1px_2px_rgba(17,17,17,0.04)]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3.5 text-xs',
        lg: 'h-10 px-6 text-sm',
        icon: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';
