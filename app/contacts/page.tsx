'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  Users,
  Search,
  Plus,
  Loader2,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

export default function ContactsPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [companies, setCompanies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  // New Contact form state
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
  const [companyId, setCompanyId] = React.useState('');
  const [country, setCountry] = React.useState('India');
  const [submitting, setSubmitting] = React.useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const [cRes, compRes] = await Promise.all([
        fetch(`/api/contacts?${params.toString()}`),
        fetch('/api/companies'),
      ]);

      const cData = await cRes.json();
      const compData = await compRes.json();

      setContacts(cData.contacts || []);
      setCompanies(compData.companies || []);
      if (compData.companies && compData.companies.length > 0 && !companyId) {
        setCompanyId(compData.companies[0].id);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchContacts();
  }, [search, statusFilter]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !companyId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          full_name: fullName,
          email,
          job_title: jobTitle || null,
          country,
          source_type: 'manual',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add contact');

      toast({
        title: 'Contact Saved',
        message: `${fullName} registered with status ${data.contact.marketing_eligibility_status}.`,
        type: 'success',
      });

      setIsAddOpen(false);
      setFullName('');
      setEmail('');
      setJobTitle('');
      fetchContacts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
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
                <Users className="h-3 w-3 text-[#111111]" />
                <span>Stakeholders</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#111111] tracking-tight font-display">
                Contact Management
              </h2>
              <p className="text-xs text-[#666666]">
                Verified business stakeholders, deliverability health, and suppression list enforcement.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="h-8 gap-1.5 text-xs rounded-full bg-[#111111] hover:bg-[#262626] text-white shadow-xs self-start sm:self-auto"
            >
              <Plus className="h-3 w-3" />
              <span>Add Contact</span>
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
            <div className="flex items-center space-x-2.5 flex-1 min-w-0">
              <Search className="h-4 w-4 text-[#888888] shrink-0" />
              <input
                type="text"
                placeholder="Search by contact name, email, or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none bg-transparent font-medium"
              />
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-medium text-[11px]">Verification:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-700"
                >
                  <option value="">All Statuses</option>
                  <option value="valid">Valid</option>
                  <option value="pending">Pending</option>
                  <option value="unknown">Unknown</option>
                  <option value="risky">Risky</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Full Name & Role</th>
                    <th className="p-3.5">Company Association</th>
                    <th className="p-3.5">Normalized Email</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5">Marketing Eligibility</th>
                    <th className="p-3.5">Source Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-500" />
                        <span>Loading contact directory...</span>
                      </td>
                    </tr>
                  ) : contacts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400">
                        <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">No contacts recorded</p>
                        <p className="text-[11px] text-slate-400 mt-1">Add contacts manually or associate them during AI research.</p>
                      </td>
                    </tr>
                  ) : (
                    contacts.map((c) => {
                      const isSuppressed = c.marketing_eligibility_status === 'suppressed';

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-900 block">{c.full_name}</span>
                            <span className="text-[11px] text-slate-500">{c.job_title || 'Decision Maker'}</span>
                          </td>

                          <td className="p-3.5 text-slate-700">
                            {c.company ? (
                              <Link href={`/companies/${c.company.id}`} className="hover:underline font-medium text-slate-900">
                                {c.company.name}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="p-3.5 font-mono text-[11px] text-slate-700">
                            {c.normalized_email || c.email}
                          </td>

                          <td className="p-3.5">
                            <Badge
                              variant={
                                c.verification_status === 'valid'
                                  ? 'success'
                                  : c.verification_status === 'pending'
                                  ? 'potential'
                                  : c.verification_status === 'risky'
                                  ? 'warning'
                                  : 'destructive'
                              }
                              className="capitalize text-[10px]"
                            >
                              {c.verification_status}
                            </Badge>
                          </td>

                          <td className="p-3.5">
                            {isSuppressed ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                <ShieldAlert className="h-3 w-3" />
                                <span>Suppressed</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="h-3 w-3" />
                                <span>Eligible</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-500 capitalize text-[11px]">
                            {c.source_type?.replace('_', ' ')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Verified Contact Stakeholder"
        description="Register a decision maker. Deliverability and suppression checks are enforced automatically."
        maxWidth="md"
      >
        <form onSubmit={handleCreateContact} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Associated Company *</label>
            <select
              required
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
            >
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} ({comp.city || comp.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Vikram Singhania"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Work Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. v.singhania@company.com"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. VP Operations"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
              >
                <option value="India">India</option>
                <option value="United Arab Emirates">UAE</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Singapore">Singapore</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-slate-900 text-white">
              {submitting && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
              <span>Save Contact</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
