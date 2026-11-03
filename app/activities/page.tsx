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
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto hairline-grid-subtle max-w-4xl">
          <div className="space-y-1 pb-2 border-b border-[#e8e8e8]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border border-[#e8e8e8] bg-white text-[#666666]">
              <History className="h-3 w-3 text-[#111111]" />
              <span>Audit Trail</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#111111] tracking-tight font-display">
              System Audit &amp; Activity Timeline
            </h2>
            <p className="text-xs text-[#666666]">
              Immutable chronological record of lead discoveries, AI scores, sending operations, and reply events.
            </p>
          </div>

          <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)] p-6">
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
