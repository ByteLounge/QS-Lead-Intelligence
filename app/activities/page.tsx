'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Badge } from '@/components/ui/badge';
import { History, ShieldCheck, Mail, Sparkles, UserPlus, Flag, Loader2 } from 'lucide-react';

export default function ActivitiesPage() {
  const [activities, setActivities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true);
        const res = await fetch('/api/activities');
        const data = await res.json();
        setActivities(data.activities || []);
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'email_sent':
        return <Mail className="h-4 w-4 text-emerald-600" />;
      case 'reply_received':
        return <Flag className="h-4 w-4 text-purple-600" />;
      case 'lead_researched':
      case 'scored':
        return <Sparkles className="h-4 w-4 text-blue-600" />;
      case 'contact_added':
        return <UserPlus className="h-4 w-4 text-slate-700" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-6 space-y-5 overflow-y-auto max-w-4xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">System Audit & Activity Timeline</h2>
            <p className="text-xs text-slate-500">
              Immutable chronological record of lead discoveries, AI scores, sending operations, and reply events.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-500" />
                <span>Loading activity stream...</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <History className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p>No audit entries recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 last:border-none">
                    <div className="p-2 rounded-full bg-slate-100 flex-shrink-0 mt-0.5">
                      {getIcon(act.activity_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{act.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.created_at).toLocaleString()}
                        </span>
                      </div>
                      {act.description && (
                        <p className="text-slate-600 text-[11px] mt-0.5">{act.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <Badge variant="outline" className="text-[9px] py-0">
                          {act.activity_type}
                        </Badge>
                        <span>Actor: {act.created_by}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
