import type { Metadata } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { MobileNavProvider } from '@/components/layout/mobile-nav-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Queenstown Labs — Lead Intelligence Platform',
  description:
    'Autonomous B2B client acquisition, AI intelligence research, and CRM sales engine for Queenstown Labs, Software Studio in Goa.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body className="antialiased min-h-screen bg-[#fafafa] text-[#111111]">
        <ToastProvider>
          <MobileNavProvider>{children}</MobileNavProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
