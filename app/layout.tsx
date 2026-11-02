import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'Queenstown Lead Intelligence | AI Client Acquisition Platform',
  description:
    'Autonomous B2B client acquisition, AI intelligence research, and CRM sales engine for Queenstown Labs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
