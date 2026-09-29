'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Server,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  X,
  Info,
} from 'lucide-react';
import {
  verifyDomainAction,
  addTenantDomainAction,
  deleteTenantDomainAction,
} from '@/actions/superadmin';

export interface DomainRecordItem {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  domain: string;
  isPrimary: boolean;
  isVerified: boolean;
  verificationToken: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface TenantSimpleOption {
  id: string;
  name: string;
  slug: string;
}

interface DomainsManagerClientProps {
  domains: DomainRecordItem[];
  tenants: TenantSimpleOption[];
}

export default function DomainsManagerClient({
  domains,
  tenants,
}: DomainsManagerClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [domainInput, setDomainInput] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Copied helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Actions
  const handleVerify = (domainId: string) => {
    startTransition(async () => {
      const res = await verifyDomainAction(domainId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || 'Failed to verify domain.');
      }
    });
  };

  const handleDelete = (domainId: string, domainName: string) => {
    if (!confirm(`Are you sure you want to remove domain "${domainName}"?`)) return;

    startTransition(async () => {
      const res = await deleteTenantDomainAction(domainId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || 'Failed to delete domain.');
      }
    });
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await addTenantDomainAction({
        tenantId: selectedTenantId,
        domain: domainInput,
        isPrimary,
      });

      if (res.success) {
        setIsAddModalOpen(false);
        setDomainInput('');
        router.refresh();
      } else {
        setFormError(res.error || 'Failed to add domain.');
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Domain Mapping & DNS CNAME Engine
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              White-Label Hostnames
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage custom branded domains, DNS CNAME propagation, Let's Encrypt SSL certificates, and multi-tenant routing.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-purple-600/20 transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Map Custom Domain</span>
        </button>
      </div>

      {/* DNS Configuration Instructions Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-[#0B132B] text-white p-6 rounded-3xl shadow-md space-y-4">
        <div className="flex items-center gap-2.5 text-blue-300 font-bold text-xs">
          <Server className="w-4 h-4" />
          <span>Global CNAME Routing Standard</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          To connect a custom domain or subdomain (e.g. <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-purple-300">portal.schoolname.edu.in</code>), the school IT administrator must add the following CNAME record in their DNS registrar (GoDaddy, Cloudflare, Namecheap, etc.):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Record Type</div>
            <div className="font-bold text-white">CNAME</div>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
            <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Host / Name</div>
            <div className="font-bold text-white">portal (or subdomain)</div>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Target Value</div>
              <div className="font-bold text-emerald-400">cname.schoolerp.in</div>
            </div>
            <button
              onClick={() => handleCopy('cname.schoolerp.in', 'cname-target')}
              className="text-slate-300 hover:text-white"
            >
              {copiedKey === 'cname-target' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <th className="py-3.5 pl-6">Domain Hostname</th>
                <th className="py-3.5 px-4">Assigned Institution</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">DNS Verification</th>
                <th className="py-3.5 px-4">SSL Certificate</th>
                <th className="py-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No domains registered yet.</p>
                  </td>
                </tr>
              ) : (
                domains.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {record.domain}
                        </span>
                      </div>
                      {record.verificationToken && !record.isVerified && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          token: {record.verificationToken}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{record.tenantName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        slug: {record.tenantSlug}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {record.isPrimary ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200 text-[10px]">
                          PRIMARY
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                          ALIAS / CNAME
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {record.isVerified ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>CNAME Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending DNS Propagation</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 text-[11px]">
                        <ShieldCheck
                          className={`w-3.5 h-3.5 ${
                            record.isVerified ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{record.isVerified ? 'Let’s Encrypt TLS' : 'Pending Verification'}</span>
                      </div>
                    </td>

                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!record.isVerified && (
                          <button
                            onClick={() => handleVerify(record.id)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] shadow-xs cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Verify DNS</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(record.id, record.domain)}
                          disabled={isPending}
                          title="Remove Domain"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Domain Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isPending && setIsAddModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Map Custom Domain
                  </h2>
                  <p className="text-xs text-slate-400">
                    Attach custom school domain for white-label routing.
                  </p>
                </div>
              </div>

              {!isPending && (
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleAddDomain} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Select School *</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug}.schoolerp.in)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Custom Domain Hostname *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. portal.schoolname.edu.in"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value.toLowerCase().trim())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Do not include https:// or trailing slashes.
                </p>
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="font-bold text-slate-700 text-xs">
                  Set as Primary Hostname for this School
                </span>
              </label>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register Domain</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
