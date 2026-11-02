'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCompanyModal({ isOpen, onClose, onSuccess }: CreateCompanyModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const [name, setName] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [industry, setIndustry] = React.useState('Logistics and Warehousing');
  const [country, setCountry] = React.useState('India');
  const [city, setCity] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          website: website || null,
          industry,
          country,
          city: city || null,
          address: address || null,
          description: description || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add company');

      toast({
        title: 'Company Created',
        message: `${name} added to repository. Ready for AI intelligence research.`,
        type: 'success',
      });

      onSuccess();
      onClose();
      // Reset
      setName('');
      setWebsite('');
      setCity('');
      setAddress('');
      setDescription('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Creation Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Target Business"
      description="Manually register an enterprise prospect for AI intelligence research and outreach."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Company Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apex Cargo Solutions"
            className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Company Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Country *</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="India">India</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Singapore">Singapore</option>
              <option value="Australia">Australia</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">City / Region</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bengaluru"
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Target Sector</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="Logistics and Warehousing">Logistics and Warehousing</option>
            <option value="FMCG distributors and wholesalers">FMCG distributors and wholesalers</option>
            <option value="Hospitality and travel">Hospitality and travel</option>
            <option value="Small and medium enterprises">Small and medium enterprises</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Business Notes / Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key operational details, warehouse capacity, or services..."
            className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 bg-slate-900 text-white">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Company</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
