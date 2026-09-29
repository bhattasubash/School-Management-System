'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Lock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ChevronRight,
  Layers,
  Copy,
  Check,
  Power,
  RefreshCw,
} from 'lucide-react';
import {
  provisionSchoolTenantAction,
  toggleTenantStatusAction,
  ProvisionSchoolInput,
} from '@/actions/superadmin';

export interface TenantListItem {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  board: string;
  subscriptionPlanId: string;
  subscriptionPlanName: string;
  subscriptionPlanPrice: number;
  maxStudents: number;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  studentCount: number;
  teacherCount: number;
  domains: {
    id: string;
    domain: string;
    isPrimary: boolean;
    isVerified: boolean;
  }[];
  branding?: {
    primaryColor: string;
    tagline: string | null;
  } | null;
  createdAt: string;
}

export interface PlanOption {
  id: string;
  name: string;
  priceMonthly: number;
  maxStudents: number;
  maxStaff: number;
}

interface TenantsManagerClientProps {
  tenants: TenantListItem[];
  plans: PlanOption[];
}

export default function TenantsManagerClient({
  tenants,
  plans,
}: TenantsManagerClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL state
  const initialModalOpen = searchParams.get('action') === 'new';
  const selectedTenantIdFromUrl = searchParams.get('tenantId');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal & Drawer State
  const [isWizardOpen, setIsWizardOpen] = useState(initialModalOpen);
  const [selectedTenant, setSelectedTenant] = useState<TenantListItem | null>(
    selectedTenantIdFromUrl
      ? tenants.find((t) => t.id === selectedTenantIdFromUrl) || null
      : null
  );

  // Form State for Provisioning Wizard
  const [formData, setFormData] = useState<ProvisionSchoolInput>({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    board: 'CBSE',
    subscriptionPlanId: plans[0]?.id || '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    customDomain: '',
    tagline: 'Service Before Self',
    primaryColor: '#111C2D',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [provisionSuccess, setProvisionSuccess] = useState<{
    name: string;
    slug: string;
    adminEmail: string;
    adminPassword: string;
  } | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered tenants calculation
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      if (selectedBoard !== 'ALL' && tenant.board !== selectedBoard) return false;
      if (selectedStatus !== 'ALL' && tenant.subscriptionStatus !== selectedStatus)
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tenant.name.toLowerCase().includes(q);
        const matchesSlug = tenant.slug.toLowerCase().includes(q);
        const matchesCity = tenant.city.toLowerCase().includes(q);
        const matchesEmail = tenant.email.toLowerCase().includes(q);
        if (!matchesName && !matchesSlug && !matchesCity && !matchesEmail) return false;
      }

      return true;
    });
  }, [tenants, selectedBoard, selectedStatus, searchQuery]);

  // Slug generator helper
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug === '' || prev.slug === generatedSlug.slice(0, -1) ? generatedSlug : prev.slug,
    }));
  };

  // Status toggle handler
  const handleToggleStatus = (tenant: TenantListItem) => {
    const nextStatus = tenant.subscriptionStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const nextActive = nextStatus === 'ACTIVE';

    startTransition(async () => {
      const res = await toggleTenantStatusAction({
        tenantId: tenant.id,
        status: nextStatus,
        isActive: nextActive,
      });

      if (res.success) {
        if (selectedTenant && selectedTenant.id === tenant.id) {
          setSelectedTenant({
            ...selectedTenant,
            subscriptionStatus: nextStatus,
            isActive: nextActive,
          });
        }
        router.refresh();
      } else {
        alert(res.error || 'Failed to update status');
      }
    });
  };

  // Form submission
  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await provisionSchoolTenantAction(formData);
      if (res.success) {
        setProvisionSuccess({
          name: formData.name,
          slug: formData.slug,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
        });
        router.refresh();
      } else {
        setFormError(res.error || 'Failed to provision tenant.');
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              School Tenants & Campuses
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {tenants.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision, inspect, manage domains, and monitor row-level isolation across all onboarded schools.
          </p>
        </div>

        <button
          onClick={() => {
            setProvisionSuccess(null);
            setFormError(null);
            setIsWizardOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-purple-600/20 transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New School</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by institution name, slug, city, or admin email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Board Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Board:</span>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold"
            >
              <option value="ALL">All Boards</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="STATE_BOARD">State Board</option>
              <option value="CAMBRIDGE">Cambridge</option>
              <option value="IB">IB</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <th className="py-3.5 pl-6">School / Tenant</th>
                <th className="py-3.5 px-4">Board & Location</th>
                <th className="py-3.5 px-4">Subscription Plan</th>
                <th className="py-3.5 px-4">Utilization</th>
                <th className="py-3.5 px-4">Domains</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No school tenants match your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const primaryDomain =
                    tenant.domains.find((d) => d.isPrimary)?.domain ||
                    tenant.domains[0]?.domain ||
                    `${tenant.slug}.schoolerp.in`;

                  return (
                    <tr
                      key={tenant.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-xs"
                            style={{
                              backgroundColor: tenant.branding?.primaryColor || '#111C2D',
                            }}
                          >
                            {tenant.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                              {tenant.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <span>slug: {tenant.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{tenant.board}</div>
                        <div className="text-[11px] text-slate-400">
                          {tenant.city}, {tenant.state}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-100 text-[11px]">
                          {tenant.subscriptionPlanName}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ₹{tenant.subscriptionPlanPrice.toLocaleString('en-IN')}/mo
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">
                          {tenant.studentCount}{' '}
                          <span className="text-slate-400 font-normal">
                            / {tenant.maxStudents}
                          </span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((tenant.studentCount / (tenant.maxStudents || 1)) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-slate-700 font-mono text-[11px]">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[140px]">{primaryDomain}</span>
                        </div>
                        {tenant.domains.some((d) => !d.isVerified) && (
                          <span className="text-[9px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            DNS Pending
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tenant.subscriptionStatus === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tenant.subscriptionStatus === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {tenant.subscriptionStatus}
                        </span>
                      </td>

                      <td
                        className="py-4 pr-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedTenant(tenant)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-[11px]"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => handleToggleStatus(tenant)}
                            disabled={isPending}
                            title={
                              tenant.subscriptionStatus === 'ACTIVE'
                                ? 'Suspend School Access'
                                : 'Reactivate School Access'
                            }
                            className={`p-1.5 rounded-xl border transition-colors ${
                              tenant.subscriptionStatus === 'ACTIVE'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200 hover:border-rose-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Inspection Drawer */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedTenant(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-6 bg-[#0B132B] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-sm"
                    style={{
                      backgroundColor: selectedTenant.branding?.primaryColor || '#7C3AED',
                    }}
                  >
                    {selectedTenant.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white truncate max-w-[200px]">
                      {selectedTenant.name}
                    </h2>
                    <p className="text-xs text-purple-300 font-mono">
                      id: {selectedTenant.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTenant(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600">
                {/* Status & Plan Quick Badge */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Contract & Status
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {selectedTenant.subscriptionPlanName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ₹{selectedTenant.subscriptionPlanPrice.toLocaleString('en-IN')}/month
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedTenant.subscriptionStatus === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {selectedTenant.subscriptionStatus}
                  </span>
                </div>

                {/* Institution Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    School Coordinates
                  </h3>
                  <div className="space-y-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>
                        {selectedTenant.address}, {selectedTenant.city},{' '}
                        {selectedTenant.state} - {selectedTenant.pincode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{selectedTenant.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedTenant.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Subdomains & Custom Domains */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Hostnames & DNS Mapping
                  </h3>
                  <div className="space-y-2">
                    {selectedTenant.domains.map((dom) => (
                      <div
                        key={dom.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <div className="flex items-center gap-2 font-mono text-slate-800">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dom.domain}</span>
                          {dom.isPrimary && (
                            <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dom.isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {dom.isVerified ? 'Verified' : 'Pending DNS'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row-Level Isolation Audit Verification */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Multi-Tenant DB Partitioning</span>
                  </div>
                  <p className="text-[11px] text-purple-700 leading-relaxed">
                    All queries for student profiles, staff attendance, fee structures, and notices are strictly partitioned by tenantId <code className="bg-white/80 px-1 py-0.2 rounded font-mono">{selectedTenant.id}</code>.
                  </p>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
                <button
                  onClick={() => handleToggleStatus(selectedTenant)}
                  disabled={isPending}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                    selectedTenant.subscriptionStatus === 'ACTIVE'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>
                    {selectedTenant.subscriptionStatus === 'ACTIVE'
                      ? 'Suspend Tenant'
                      : 'Activate Tenant'}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedTenant(null)}
                  className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 60-Second School Provisioning Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isPending && setIsWizardOpen(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    60-Second School Provisioning Wizard
                  </h2>
                  <p className="text-xs text-slate-400">
                    Creates isolated tenant, branding, DNS subdomain, academic year, and admin user atomically.
                  </p>
                </div>
              </div>

              {!isPending && (
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Success View */}
            {provisionSuccess ? (
              <div className="space-y-6 py-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    School Successfully Provisioned!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Tenant <strong>{provisionSuccess.name}</strong> is live and partitioned in the multi-tenant PostgreSQL cluster.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500">School Subdomain:</span>
                    <span className="font-mono font-bold text-purple-700">
                      {provisionSuccess.slug}.schoolerp.in
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500">Admin Email:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-800">
                        {provisionSuccess.adminEmail}
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(provisionSuccess.adminEmail, 'email')
                        }
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {copiedKey === 'email' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Admin Password:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-800">
                        {provisionSuccess.adminPassword}
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(provisionSuccess.adminPassword, 'pw')
                        }
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {copiedKey === 'pw' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setProvisionSuccess(null);
                      setIsWizardOpen(false);
                    }}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Done & Return to Directory
                  </button>
                </div>
              </div>
            ) : (
              /* Provision Form */
              <form onSubmit={handleProvisionSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* School Name */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Institution Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Heritage Public School"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      Tenant Slug (Subdomain) *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        required
                        placeholder="heritage"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                      />
                      <span className="bg-slate-100 border border-l-0 border-slate-200 px-2.5 py-2 text-slate-400 font-mono rounded-r-xl">
                        .schoolerp.in
                      </span>
                    </div>
                  </div>

                  {/* Education Board */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Education Board *</label>
                    <select
                      value={formData.board}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          board: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold"
                    >
                      <option value="CBSE">CBSE (Central Board)</option>
                      <option value="ICSE">ICSE / CISCE</option>
                      <option value="STATE_BOARD">State Board</option>
                      <option value="CAMBRIDGE">Cambridge (IGCSE)</option>
                      <option value="IB">International Baccalaureate (IB)</option>
                    </select>
                  </div>

                  {/* Subscription Plan */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Subscription Tier *</label>
                    <select
                      value={formData.subscriptionPlanId}
                      onChange={(e) =>
                        setFormData({ ...formData, subscriptionPlanId: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ₹{p.priceMonthly.toLocaleString('en-IN')}/mo (Max {p.maxStudents} Students)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Official Email */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Official School Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="principal@school.edu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* Official Phone */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Official Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* City & State */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delhi"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Campus Road, Sector 5"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Pincode *</label>
                    <input
                      type="text"
                      required
                      placeholder="110001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                {/* Administrator Initial Login Credentials */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      School Principal / Admin Account
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Admin First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ramesh"
                        value={formData.adminFirstName}
                        onChange={(e) =>
                          setFormData({ ...formData, adminFirstName: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Admin Last Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Sharma"
                        value={formData.adminLastName}
                        onChange={(e) =>
                          setFormData({ ...formData, adminLastName: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Admin Email Login *</label>
                      <input
                        type="email"
                        required
                        placeholder="admin@heritage.edu.in"
                        value={formData.adminEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, adminEmail: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Admin Initial Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Min 8 characters"
                        value={formData.adminPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, adminPassword: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setIsWizardOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Provisioning Campus...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Execute Provisioning</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
