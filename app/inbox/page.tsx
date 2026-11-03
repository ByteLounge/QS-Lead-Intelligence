'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  Inbox,
  Mail,
  MessageSquare,
  ShieldAlert,
  Calendar,
  Flame,
  CheckCircle2,
  Send,
  Loader2,
  Plus,
} from 'lucide-react';

export default function InboxPage() {
  const { toast } = useToast();
  const [replies, setReplies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedReply, setSelectedReply] = React.useState<any | null>(null);

  // Simulated Reply Webhook modal state
  const [isSimModalOpen, setIsSimModalOpen] = React.useState(false);
  const [simEmail, setSimEmail] = React.useState('operations@expresslogistics.demo');
  const [simSubject, setSimSubject] = React.useState('Re: Custom Logistics & Inventory Workflow');
  const [simBody, setSimBody] = React.useState(
    'Hi, thanks for reaching out. We are actually facing huge dispatch delays in our warehouse. Can we schedule a 15 min Zoom call next Tuesday at 3 PM to discuss your software?'
  );
  const [simulating, setSimulating] = React.useState(false);

  const fetchReplies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/metrics');
      const data = await res.json();
      setReplies(data.recentReplies || []);
      if (data.recentReplies && data.recentReplies.length > 0 && !selectedReply) {
        setSelectedReply(data.recentReplies[0]);
      }
    } catch (err) {
      console.error('Failed to load replies:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReplies();
  }, []);

  const handleSimulateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);

    try {
      const res = await fetch('/api/email/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_email: simEmail,
          subject: simSubject,
          body: simBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process reply');

      toast({
        title: 'Reply Ingestion & AI Classification Succeeded',
        message: `Intent: ${data.classification.classification.toUpperCase()} (${Math.round(
          data.classification.confidence_score * 100
        )}% confidence). Action: ${data.classification.recommended_action}`,
        type: 'success',
      });

      setIsSimModalOpen(false);
      fetchReplies();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Reply Ingestion Failed', message: msg, type: 'error' });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto hairline-grid-subtle min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e8e8e8]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border border-[#e8e8e8] bg-white text-[#666666]">
                <Inbox className="h-3 w-3 text-[#111111]" />
                <span>Inbound Intent Engine</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#111111] tracking-tight font-display">
                Inbox &amp; Reply Intelligence
              </h2>
              <p className="text-xs text-[#666666]">
                Inbound prospect emails classified by Gemini intent recognition with deterministic opt-out safeguards.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsSimModalOpen(true)}
              className="h-8 gap-1.5 text-xs rounded-full bg-[#111111] hover:bg-[#262626] text-white shadow-xs self-start sm:self-auto"
            >
              <Plus className="h-3 w-3" />
              <span>Simulate Reply</span>
            </Button>
          </div>

          {/* Master Detail Split */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px] md:h-[calc(100vh-220px)]">
            {/* Left Column: Reply List */}
            <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)] flex flex-col overflow-hidden min-h-[260px] md:min-h-0">
              <div className="p-3.5 border-b border-[#e8e8e8] bg-[#fafafa] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#111111] font-display">Inbound Messages</span>
                <span className="text-[10px] text-[#888888] font-mono">{replies.length} total</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {loading ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Loading replies...</div>
                ) : replies.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No replies in inbox.</div>
                ) : (
                  replies.map((rep) => {
                    const isSelected = selectedReply?.id === rep.id;
                    const isMeeting = rep.classification === 'meeting_request';
                    const isOptOut = rep.classification === 'unsubscribe';

                    return (
                      <button
                        key={rep.id}
                        onClick={() => setSelectedReply(rep)}
                        className={`w-full text-left p-3.5 transition-colors ${
                          isSelected ? 'bg-slate-100/80 border-l-4 border-slate-900' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-slate-900 truncate max-w-[140px]">
                            {rep.from_email}
                          </span>
                          <Badge
                            variant={
                              isMeeting
                                ? 'high'
                                : rep.classification === 'interested'
                                ? 'success'
                                : isOptOut
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="text-[9px] py-0"
                          >
                            {rep.classification?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-[11px] font-medium text-slate-700 truncate">{rep.subject}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{rep.body}</p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Message View & Classification Detail */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm p-5 overflow-y-auto space-y-4">
              {selectedReply ? (
                <>
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{selectedReply.subject}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        From: <span className="font-semibold text-slate-700">{selectedReply.from_email}</span>
                      </p>
                    </div>
                    <Badge
                      variant={
                        selectedReply.classification === 'meeting_request'
                          ? 'high'
                          : selectedReply.classification === 'interested'
                          ? 'success'
                          : selectedReply.classification === 'unsubscribe'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      Intent: {selectedReply.classification?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  {/* AI Intent Intelligence Card */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Gemini Intent Summary</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Confidence: {Math.round((selectedReply.confidence_score || 0.9) * 100)}%
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedReply.summary || 'Summary unavailable'}</p>
                    {selectedReply.action_taken && (
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Action Triggered: {selectedReply.action_taken}</span>
                      </div>
                    )}
                  </div>

                  {/* Raw Email Content */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                      Original Inbound Body
                    </label>
                    <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-md text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                      {selectedReply.body}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-24 text-center text-slate-400 text-xs">
                  Select a message from the left to view intelligence analysis.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Simulator Modal */}
      <Modal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        title="Simulate Inbound Email Webhook"
        description="Deliver a simulated incoming reply to test deterministic opt-out rules and Gemini intent classification."
        maxWidth="md"
      >
        <form onSubmit={handleSimulateReply} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Sender Email</label>
            <input
              type="email"
              required
              value={simEmail}
              onChange={(e) => setSimEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Subject</label>
            <input
              type="text"
              required
              value={simSubject}
              onChange={(e) => setSimSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Incoming Body Text</label>
            <textarea
              rows={4}
              required
              value={simBody}
              onChange={(e) => setSimBody(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
            />
            <div className="flex gap-2 mt-1 text-[10px] text-slate-400">
              <span>Quick tests:</span>
              <button
                type="button"
                onClick={() =>
                  setSimBody('Can we set up a 15-minute call next Tuesday at 2 PM to discuss warehouse software?')
                }
                className="text-emerald-700 hover:underline"
              >
                Meeting Request
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setSimBody('Please unsubscribe me from your mailing list immediately.')}
                className="text-red-600 hover:underline"
              >
                Unsubscribe
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsSimModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={simulating} className="bg-slate-900 text-white">
              {simulating && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
              <span>Process Webhook</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
