import * as React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function QueenstownMark({ size = 28, className = '', ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={(size * 120) / 168}
      viewBox="0 0 168 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M42.8 36.2 120.6 8.6" />
      <circle cx="72.8" cy="21.2" r="5.4" />
      <circle cx="90.4" cy="14.9" r="5.8" />
      <path d="M70.4 23.6 73.6 12.4 89.0 15.4Z" />
      <path d="M76.4 20.4C72.6 30 71.2 36.4 71.6 42.2c.6 8.2 6.4 12.8 14.4 13.4v-5.8c-5.4-.6-8.4-3.4-8.8-8.2-.4-5 1-11.2 4.6-20Z" />
      <path d="M83.6 51.8h8.6v6.4h-8.6z" />
      <path d="M60.6 61c7.8-2.8 16.8-3.6 23.6-3.6s15.8.8 23.6 3.6c4.8 5.6 6.8 15.2 6.8 24.6s-2 19-6.8 24.6c-7.8 2.8-16.8 3.6-23.6 3.6s-15.8-.8-23.6-3.6c-4.8-5.6-6.8-15.2-6.8-24.6s2-19 6.8-24.6Z" />
      <path d="M67.8 58.4c-4 13.6-4.2 39.6 2.8 53.4" />
      <path d="M77.8 57.6c-3.8 14-4 40 2.2 55" />
      <rect x="76.4" y="79.2" width="4" height="9" rx="2" fill="currentColor" stroke="none" />
      <rect x="111.6" y="79.2" width="4" height="9" rx="2" fill="currentColor" stroke="none" />
      <path d="M55 107.2 63.6 97.6 71 105.6" />
      <path d="M74.2 113.6 92 85.8 103 97.6 107.4 93 114.2 101.6" />
      <path d="M91 94.4 86.6 101l3.8 1.2-3.6 6.6" />
    </svg>
  );
}

export function QueenstownLogo({
  showBadge = true,
  className = '',
}: {
  showBadge?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center p-1.5 shadow-sm">
        <QueenstownMark size={20} className="text-white" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-[#111111] font-display">
            Queenstown Labs
          </span>
          {showBadge && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-[#fafafa] text-[#666666] border border-[#e8e8e8]">
              Studio
            </span>
          )}
        </div>
        <p className="text-[10px] text-[#888888] font-mono tracking-wide">
          Lead Intelligence Engine
        </p>
      </div>
    </div>
  );
}
