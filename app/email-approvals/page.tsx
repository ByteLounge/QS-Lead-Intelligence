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
  Phone,
  MessageCircle,
  Instagram,
  Copy,
  ExternalLink,
  Smartphone,
  Share2,
  AlertTriangle,
  Mail,
} from 'lucide-react';

export default function EmailApprovalsPage() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState<'all' | 'pending'>('all');
  const [pendingMessages, setPendingMessages] = React.useState<any[]>([]);
  const [allMessages, setAllMessages] = React.useState<any[]>([]);
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
      setPendingMessages(data.pendingApprovals || []);
      setAllMessages(data.allOutreach || []);
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied`,
      message: 'Copied to clipboard. Ready to paste directly into chat at $0 cost.',
      type: 'success',
    });
  };

  const handleOpenWhatsApp = (phone: string, pitch: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean) {
      toast({
        title: 'No Phone Number',
        message: 'No verified phone or WhatsApp number available for this contact.',
        type: 'warning',
      });
      return;
    }
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(pitch)}`;
    window.open(url, '_blank');
    toast({
      title: 'Opening WhatsApp Web',
      message: 'Personalized pitch pre-filled at $0 cost.',
      type: 'success',
    });
  };

  const handleOpenInstagram = (handle: string, pitch: string) => {
    const clean = handle.replace(/^@/, '').trim();
    if (!clean) {
      toast({
        title: 'No Instagram Handle',
        message: 'No Instagram profile mapped for this contact.',
        type: 'warning',
      });
      return;
    }
    navigator.clipboard.writeText(pitch);
    const url = `https://ig.me/m/${clean}`;
    window.open(url, '_blank');
    toast({
      title: 'Opening Instagram DM',
      message: 'Custom pitch copied to clipboard! Paste directly into their direct message.',
      type: 'success',
    });
  };

  const handleOpenGmailWeb = (to: string, subject: string, body: string) => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
    toast({
      title: 'Opening Gmail Web',
      message: 'Email pre-filled in your Gmail composer tab. Click Send in Gmail to bypass bot filters at $0 cost!',
      type: 'success',
    });
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
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto hairline-grid-subtle max-w-5xl min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e8e8e8]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border border-[#e8e8e8] bg-white text-[#666666]">
                <MailCheck className="h-3 w-3 text-[#111111]" />
                <span>Safety Guardrail</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#111111] tracking-tight font-display">
                Email Safety Approvals &amp; Omni-Channel Outbox
              </h2>
              <p className="text-xs text-[#666666]">
                Review outreach copy and choose your delivery channel: 1-Click WhatsApp, 1-Click Instagram DM, or Gmail.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Badge variant="warning">Human Review Enforced</Badge>
            </div>
          </div>

          {/* Explanation Alert: Why Google SMTP blocks rapid cold emails & 3 Free Solutions */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl space-y-2 text-xs text-amber-900 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Why Google SMTP shows &quot;Message Blocked&quot; &amp; How to Send at $0 Cost:</span>
              </div>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                Spam Filter Alert
              </span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Google&apos;s anti-abuse filters strictly flag free consumer <code>@gmail.com</code> accounts when automated scripts blast cold emails in rapid bursts via SMTP. To achieve 100% deliverability with zero blocks at <strong>$0 cost</strong>, use these 3 direct options:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="bg-white p-3 rounded-xl border border-emerald-200/80 space-y-1">
                <div className="font-semibold text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Direct
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">Recommended</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Over 90% open rates in India &amp; UAE. Bypasses all corporate email firewalls directly into their phone.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-200/80 space-y-1">
                <div className="font-semibold text-purple-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5 text-purple-600" /> Instagram Direct
                  </span>
                  <span className="text-[9px] font-mono bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">$0 Cost</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Opens their official brand Instagram inbox in 1 click and auto-copies your tailored pitch to your clipboard.
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-200/80 space-y-1">
                <div className="font-semibold text-blue-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-600" /> 1-Click Gmail Web
                  </span>
                  <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">No SMTP Block</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Opens your real Gmail web composer tab pre-filled with the exact pitch. Because it sends via browser, Google never blocks it.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-[#e8e8e8] pb-1 text-xs">
            <button
              onClick={() => setTab('all')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                tab === 'all'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'text-[#666666] hover:text-[#111111] bg-white border border-[#e8e8e8]'
              }`}
            >
              All Outreach Leads ({allMessages.length})
            </button>
            <button
              onClick={() => setTab('pending')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                tab === 'pending'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'text-[#666666] hover:text-[#111111] bg-white border border-[#e8e8e8]'
              }`}
            >
              Pending Safety Approvals ({pendingMessages.length})
            </button>
          </div>

          {/* Outreach Messages List */}
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-500" />
              <p className="text-xs">Loading outreach records...</p>
            </div>
          ) : (tab === 'pending' ? pendingMessages : allMessages).length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-lg shadow-sm">
              <MailCheck className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">
                {tab === 'pending' ? 'Pending Safety Queue is Clear' : 'No Outreach Records Found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {tab === 'pending'
                  ? 'All drafts have been processed or moved to outbox. Click "All Outreach Leads" above to view active fallback channels.'
                  : 'Run intelligence discovery to generate prospect accounts and customized outreach.'}
              </p>
              <Link href="/leads">
                <Button size="sm" variant="outline" className="h-8 text-xs mt-4">
                  Go to Leads &amp; Intelligence
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {(tab === 'pending' ? pendingMessages : allMessages).map((msg) => {
                const isEditing = editingId === msg.id;
                const isBusy = actionInProgress === msg.id;
                const company = msg.contact?.company || msg.lead?.company || {};
                const phone = msg.contact?.whatsapp || msg.contact?.phone || company.whatsapp || company.phone || '';
                const igHandle = (msg.contact?.instagram_handle || company.instagram_handle || '').replace(/^@/, '').trim();

                let notesObj: any = {};
                try {
                  notesObj = JSON.parse(msg.personalisation_notes || '{}');
                } catch {
                  notesObj = { opportunity: msg.personalisation_notes };
                }

                const whatsappPitch = notesObj.whatsapp_pitch || `Hi ${msg.contact?.full_name || 'Team'}, we noticed ${company.name || 'your enterprise'}'s operations. At Queenstown Labs, we build custom mobile apps & client portals to streamline customer bookings and operations. Would you be open to a 5-min demo this week?`;
                const instagramPitch = notesObj.instagram_pitch || `Love what you're doing with ${company.name || 'your brand'}! Quick question: have you explored having a dedicated mobile app for your direct clients? We build high-converting mobile apps at Queenstown Labs.`;
                const opportunityText = notesObj.opportunity || notesObj.service_needed || msg.personalisation_notes;

                return (
                  <div
                    key={msg.id}
                    className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4 text-xs transition-shadow hover:shadow-md"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {company.name || 'Prospect Company'}
                          </span>
                          <Badge variant="warning" className="text-[10px]">
                            Pending Safety Approval
                          </Badge>
                          <span className="text-[11px] text-slate-400">
                            Sequence {msg.sequence_number == 0 ? '0 (Intro)' : `(${msg.sequence_number})`}
                          </span>

                          {phone && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Phone className="h-2.5 w-2.5 text-emerald-600" />
                              <span>{phone}</span>
                            </span>
                          )}

                          {igHandle && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              <Instagram className="h-2.5 w-2.5 text-purple-600" />
                              <span>@{igHandle}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 mt-1">
                          Recipient: <span className="font-semibold text-slate-700">{msg.contact?.full_name}</span> &lt;{msg.contact?.email}&gt;
                          {company.city && <span className="text-slate-400 ml-1.5">• {company.city}, {company.country}</span>}
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
                    {opportunityText && (
                      <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded text-[11px] text-blue-900 flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Personalisation Grounding: </span>
                          <span>{opportunityText}</span>
                        </div>
                      </div>
                    )}

                    {/* Free Multi-Channel Outreach Fallback ($0 Cost: WhatsApp & Instagram) */}
                    <div className="p-3.5 bg-[#fcfcfc] border border-slate-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px]">
                          <Share2 className="h-3.5 w-3.5 text-slate-700" />
                          <span>Zero-Cost Direct Channels (100% Free WhatsApp &amp; Instagram DM)</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          $0 Cost • No API Fees
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* WhatsApp Box */}
                        <div className="p-3 bg-white border border-emerald-100 rounded-md space-y-2 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-emerald-900 text-[11px] flex items-center gap-1">
                                <MessageCircle className="h-3 w-3 text-emerald-600" />
                                <span>WhatsApp Direct</span>
                              </span>
                              {phone ? (
                                <span className="font-mono text-[10px] text-slate-500">{phone}</span>
                              ) : (
                                <span className="text-[10px] text-amber-600">No phone</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100 italic">
                              &ldquo;{whatsappPitch}&rdquo;
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenWhatsApp(phone, whatsappPitch)}
                              disabled={!phone}
                              className="h-7 px-2.5 text-[11px] gap-1 text-emerald-800 border-emerald-200 hover:bg-emerald-50 flex-1"
                            >
                              <MessageCircle className="h-3 w-3 text-emerald-600" />
                              <span>Open WhatsApp</span>
                              <ExternalLink className="h-2.5 w-2.5 ml-auto text-emerald-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(whatsappPitch, 'WhatsApp Pitch')}
                              className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900"
                              title="Copy pitch to clipboard"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Instagram DM Box */}
                        <div className="p-3 bg-white border border-purple-100 rounded-md space-y-2 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-purple-900 text-[11px] flex items-center gap-1">
                                <Instagram className="h-3 w-3 text-purple-600" />
                                <span>Instagram Direct</span>
                              </span>
                              {igHandle ? (
                                <span className="font-mono text-[10px] text-purple-700 font-medium">@{igHandle}</span>
                              ) : (
                                <span className="text-[10px] text-amber-600">No handle</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100 italic">
                              &ldquo;{instagramPitch}&rdquo;
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenInstagram(igHandle, instagramPitch)}
                              disabled={!igHandle}
                              className="h-7 px-2.5 text-[11px] gap-1 text-purple-800 border-purple-200 hover:bg-purple-50 flex-1"
                            >
                              <Instagram className="h-3 w-3 text-purple-600" />
                              <span>Open Instagram DM</span>
                              <ExternalLink className="h-2.5 w-2.5 ml-auto text-purple-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(instagramPitch, 'Instagram DM Pitch')}
                              className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900"
                              title="Copy pitch to clipboard"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
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

                      <div className="flex flex-wrap items-center gap-2">
                        {msg.status === 'sent' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span>Dispatched via Gmail</span>
                          </span>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenGmailWeb(msg.contact?.email, isEditing ? editSubject : msg.subject, isEditing ? editBody : msg.body)}
                          className="h-8 text-xs gap-1.5 border-slate-300 hover:bg-slate-50 text-slate-800"
                          title="Opens Gmail compose tab pre-filled with this email to send directly from Gmail Web without SMTP script blocks"
                        >
                          <Mail className="h-3.5 w-3.5 text-rose-500" />
                          <span>Gmail Web (No-Block)</span>
                          <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(msg.id)}
                          disabled={isBusy}
                          className="h-8 text-xs gap-1.5"
                        >
                          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-emerald-600" />}
                          <span>Approve Queue</span>
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
