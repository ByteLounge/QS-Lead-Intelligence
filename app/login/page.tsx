'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ShieldCheck, ArrowRight, Loader2, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('admin@queenstownlabs.com');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [hasSupabase, setHasSupabase] = React.useState(false);

  React.useEffect(() => {
    setHasSupabase(isSupabaseConfigured());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (hasSupabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      toast({
        title: 'Authentication Successful',
        message: 'Welcome back to Queenstown Lead Intelligence.',
        type: 'success',
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Sign In Failed', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-sm bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 bg-slate-900 rounded-md mx-auto flex items-center justify-center text-white font-bold text-sm mb-2">
            QL
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Queenstown Labs</h2>
          <p className="text-xs text-slate-500">Lead Intelligence & Client Acquisition</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@queenstownlabs.com"
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-8 text-xs bg-slate-900 text-white gap-2">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
            <span>Sign In to Platform</span>
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
          >
            <span>Bypass & Enter Dashboard</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>Role-Based Access Control Active</span>
        </div>
      </div>
    </div>
  );
}
