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
  Megaphone,
  Plus,
  Play,
  Pause,
  Loader2,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function CampaignsPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = React.useState<any[]>([
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Logistics & Warehouse Digitalization 2026',
      description: 'Targeting 3PL, FMCG and warehouse distributors for custom ERP and inventory automation software.',
      status: 'active',
      target_country: 'India',
      target_industry: 'Logistics and Warehousing',
      daily_limit: 5,
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      name: 'UAE FMCG Distributor Order Portals',
      description: 'Outreach to consumer goods wholesalers across Dubai and Abu Dhabi for custom B2B ordering portals.',
      status: 'active',
      target_country: 'United Arab Emirates',
      target_industry: 'FMCG distributors and wholesalers',
      daily_limit: 5,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [country, setCountry] = React.useState('India');
  const [industry, setIndustry] = React.useState('Logistics and Warehousing');
  const [dailyLimit, setDailyLimit] = React.useState('5');

  const handleToggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = c.status === 'active' ? 'paused' : 'active';
          toast({
            title: `Campaign ${next === 'active' ? 'Resumed' : 'Paused'}`,
            message: `${c.name} is now ${next}.`,
            type: next === 'active' ? 'success' : 'warning',
          });
          return { ...c, status: next };
        }
        return c;
      })
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCamp = {
      id: `camp_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      status: 'active',
      target_country: country,
      target_industry: industry,
      daily_limit: parseInt(dailyLimit, 10) || 5,
      created_at: new Date().toISOString(),
    };

    setCampaigns([newCamp, ...campaigns]);
    toast({
      title: 'Campaign Created',
      message: `${newCamp.name} initialized with daily limit of ${newCamp.daily_limit} emails.`,
      type: 'success',
    });
    setIsAddOpen(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto hairline-grid-subtle">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e8e8e8]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border border-[#e8e8e8] bg-white text-[#666666]">
                <Megaphone className="h-3 w-3 text-[#111111]" />
                <span>Sequences</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#111111] tracking-tight font-display">
                Outreach Campaigns
              </h2>
              <p className="text-xs text-[#666666]">
                Segmented outreach sequences configured with daily volume pacing and country compliance rules.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="h-8 gap-1.5 text-xs rounded-full bg-[#111111] hover:bg-[#262626] text-white shadow-xs"
            >
              <Plus className="h-3 w-3" />
              <span>Create Campaign</span>
            </Button>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => {
              const isActive = camp.status === 'active';

              return (
                <div
                  key={camp.id}
                  className="p-6 bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)] hover:border-[#cfcfcf] transition-all space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900">{camp.name}</h3>
                        <Badge variant={isActive ? 'success' : 'secondary'} className="capitalize text-[10px]">
                          {camp.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{camp.description}</p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(camp.id)}
                      className="h-7 px-2 text-[11px] gap-1"
                    >
                      {isActive ? (
                        <>
                          <Pause className="h-3 w-3 text-amber-600" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 text-emerald-600" />
                          <span>Resume</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block font-medium">Target Country</span>
                      <span className="font-semibold text-slate-800">{camp.target_country}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Sector</span>
                      <span className="font-semibold text-slate-800">{camp.target_industry}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Daily Limit</span>
                      <span className="font-semibold text-slate-800">{camp.daily_limit} emails/day</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>3-Touch Sequence: Day 0, Day 4, Day 9</span>
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="font-semibold text-slate-900 hover:text-emerald-700 inline-flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Outreach Campaign"
        description="Configure target country, sector, and pacing limit for Queenstown Labs service offerings."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Campaign Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. UK Freight Forwarder Customs Software 2026"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Description & Objective</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Promoting custom manifest integration engines..."
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Target Country</label>
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

            <div>
              <label className="block text-slate-700 font-medium mb-1">Pacing Daily Limit</label>
              <input
                type="number"
                min="1"
                max="20"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-slate-900 text-white">
              Initialize Campaign
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
