'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  MailCheck,
  Send,
  XCircle,
  Edit3,
  Check,
  Loader2,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export default function EmailApprovalsPage() {
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editSubject, setEditSubject] = React.useState('');
  const [editBody, setEditBody] = React.useState('');
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null);

  const fetchOutreach = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/metrics');
      const data = await res.json();
      setMessages(data.pendingApprovals || []);
    } catch (err) {
      console.error('Failed to load pending outreach:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOutreach();
  }, []);

  const handleStartEdit = (msg: any) => {
    setEditingId(msg.id);
    setEditSubject(msg.subject);
    setEditBody(msg.body);
  };

  const handleApprove = async (msgId: string) => {
    try {
      setActionInProgress(msgId);
      const res = await fetch('/api/outreach/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: msgId,
          action: 'approve',
          subject: editingId === msgId ? editSubject : undefined,
          body: editingId === msgId ? editBody : undefined,
        }),
      });

      if (!res.ok) throw new Error('Approval failed');
      toast({
        title: 'Draft Approved',
        message: 'Message approved and moved to delivery queue. Concurrency locks active.',
        type: 'success',
      });
      setEditingId(null);
      fetchOutreach();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Approval Error', message: msg, type: 'error' });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (msgId: string) => {
    try {
      setActionInProgress(msgId);
      const res = await fetch('/api/outreach/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: msgId, action: 'reject' }),
      });

      if (!res.ok) throw new Error('Rejection failed');
      toast({
        title: 'Draft Cancelled',
        message: 'Message has been cancelled and removed from active sending sequence.',
        type: 'warning',
      });
      fetchOutreach();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Rejection Error', message: msg, type: 'error' });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSendImmediate = async (msg: any) => {
    try {
      setActionInProgress(msg.id);
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: msg.id,
          to: msg.contact?.email,
          subject: editingId === msg.id ? editSubject : msg.subject,
          body: editingId === msg.id ? editBody : msg.body,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.safeguardTriggered) {
          toast({
            title: 'Compliance Safeguard Triggered',
            message: data.error,
            type: 'warning',
          });
          return;
        }
        throw new Error(data.error || 'Failed to dispatch email');
      }

      toast({
        title: 'Email Dispatched',
        message: `Sent to ${msg.contact?.email} via Gmail API transport.`,
        type: 'success',
      });
      fetchOutreach();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Send Failed', message: msg, type: 'error' });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-6 space-y-5 overflow-y-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Email Safety Approvals</h2>
              <p className="text-xs text-slate-500">
                Human-in-the-loop review queue for AI-generated outreach drafts before transmission.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Badge variant="warning">Human Review Enforced</Badge>
            </div>
          </div>

          {/* Pending Approval List */}
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-500" />
              <p className="text-xs">Loading pending approvals...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-lg shadow-sm">
              <MailCheck className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">Queue is Clear</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No outbound drafts awaiting approval. When new prospects are qualified with score ≥ 80, drafts will appear here.
              </p>
              <Link href="/leads">
                <Button size="sm" variant="outline" className="h-8 text-xs mt-4">
                  Go to Leads & Intelligence
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isEditing = editingId === msg.id;
                const isBusy = actionInProgress === msg.id;

                return (
                  <div
                    key={msg.id}
                    className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4 text-xs transition-shadow hover:shadow-md"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {msg.contact?.company?.name || 'Prospect Company'}
                          </span>
                          <Badge variant="warning" className="text-[10px]">
                            Pending Safety Approval
                          </Badge>
                          <span className="text-[11px] text-slate-400">
                            Sequence {msg.sequence_number == 0 ? '0 (Intro)' : `(${msg.sequence_number})`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Recipient: <span className="font-semibold text-slate-700">{msg.contact?.full_name}</span> &lt;{msg.contact?.email}&gt;
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Quality Score: {msg.quality_score}/100
                        </span>
                      </div>
                    </div>

                    {/* Email Subject & Body View/Edit */}
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Line</label>
                          <input
                            type="text"
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Body (80-130 words)</label>
                          <textarea
                            rows={6}
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <span className="text-[11px] text-slate-400 font-medium">Subject: </span>
                          <span className="font-bold text-slate-900">{msg.subject}</span>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-md font-sans text-slate-800 leading-relaxed whitespace-pre-line text-xs">
                          {msg.body}
                        </div>
                      </div>
                    )}

                    {/* Grounding Explanation */}
                    {msg.personalisation_notes && (
                      <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded text-[11px] text-blue-900 flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Personalisation Grounding: </span>
                          <span>{msg.personalisation_notes}</span>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(null)}
                            className="h-8 text-xs"
                          >
                            Cancel Edit
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEdit(msg)}
                            className="h-8 text-xs gap-1.5"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                            <span>Edit Draft</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(msg.id)}
                          disabled={isBusy}
                          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject / Cancel</span>
                        </Button>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(msg.id)}
                          disabled={isBusy}
                          className="h-8 text-xs gap-1.5"
                        >
                          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-emerald-600" />}
                          <span>Approve for Queue</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleSendImmediate(msg)}
                          disabled={isBusy}
                          className="h-8 text-xs bg-slate-900 text-white gap-1.5"
                        >
                          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          <span>Send Now</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
