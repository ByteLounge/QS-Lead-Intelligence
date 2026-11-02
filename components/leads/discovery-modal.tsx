'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Search, Upload, Loader2, CheckCircle2 } from 'lucide-react';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DiscoveryModal({ isOpen, onClose, onSuccess }: DiscoveryModalProps) {
  const { toast } = useToast();
  const [tab, setTab] = React.useState<'places' | 'csv'>('places');
  const [loading, setLoading] = React.useState(false);

  // Places Form State
  const [keyword, setKeyword] = React.useState('warehouse 3PL logistics freight forwarder');
  const [country, setCountry] = React.useState('India');
  const [city, setCity] = React.useState('Bengaluru');
  const [industry, setIndustry] = React.useState('Logistics and Warehousing');
  const [maxResults, setMaxResults] = React.useState('5');

  // CSV Form State
  const [csvContent, setCsvContent] = React.useState('');
  const [csvFileName, setCsvFileName] = React.useState('');

  const handlePlacesSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          country,
          city,
          industry,
          maxResults: parseInt(maxResults, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Discovery search failed');

      toast({
        title: 'Lead Discovery Completed',
        message: `Discovered ${data.totalFound} companies. Added ${data.newlyAddedCount} new deduplicated records.`,
        type: 'success',
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Discovery Error',
        message: msg,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent) {
      toast({ title: 'Validation Error', message: 'Please select a CSV file first.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/discovery/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'CSV import failed');

      toast({
        title: 'CSV Import Completed',
        message: `Parsed ${data.totalParsed} rows. Successfully imported ${data.newlyAddedCount} new companies.`,
        type: 'success',
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Import Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Discover Potential Businesses"
      description="Query verified discovery providers or import bulk lead CSV files."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Tab switch */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('places')}
            className={`flex items-center space-x-2 py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'places'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Google Places Discovery</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('csv')}
            className={`flex items-center space-x-2 py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'csv'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>CSV Batch Import</span>
          </button>
        </div>

        {tab === 'places' ? (
          <form onSubmit={handlePlacesSearch} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Search Query Keyword
              </label>
              <input
                type="text"
                required
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. 3PL logistics warehouse cold storage"
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
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
                <label className="block text-xs font-medium text-slate-700 mb-1">City / Hub</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru, Dubai, London"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Batch Limit (Quota Safety)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxResults}
                  onChange={(e) => setMaxResults(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600">
              <p className="font-semibold text-slate-800 mb-0.5">Deduplication & Provenance Guard</p>
              Companies are deduplicated automatically by Place ID and domain. Verified source URLs are saved for audit compliance.
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 bg-slate-900 text-white">
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Execute Discovery</span>
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCsvImport} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors">
              <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-medium text-slate-700 mb-1">
                {csvFileName ? (
                  <span className="text-emerald-700 font-semibold">{csvFileName}</span>
                ) : (
                  'Click to upload or drag and drop a CSV file'
                )}
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Expected columns: company_name, website, industry, country, city, address
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Select File
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !csvContent} className="gap-2 bg-slate-900 text-white">
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Import CSV Leads</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
