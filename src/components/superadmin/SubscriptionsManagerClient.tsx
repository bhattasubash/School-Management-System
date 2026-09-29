'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Plus,
  Check,
  X,
  IndianRupee,
  Building2,
  Users,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { createSubscriptionPlanAction } from '@/actions/superadmin';

export interface PlanItem {
  id: string;
  name: string;
  maxStudents: number;
  maxStaff: number;
  features: Record<string, boolean>;
  priceMonthly: number;
  priceAnnual: number;
  isActive: boolean;
  tenantCount: number;
  totalMonthlyRevenue: number;
}

interface SubscriptionsManagerClientProps {
  plans: PlanItem[];
  totalMrr: number;
  totalArr: number;
}

export default function SubscriptionsManagerClient({
  plans,
  totalMrr,
  totalArr,
}: SubscriptionsManagerClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [maxStudents, setMaxStudents] = useState(1000);
  const [maxStaff, setMaxStaff] = useState(100);
  const [priceMonthly, setPriceMonthly] = useState(4999);
  const [priceAnnual, setPriceAnnual] = useState(49999);
  const [features, setFeatures] = useState<Record<string, boolean>>({
    fees: true,
    exams: true,
    timetable: true,
    attendance: true,
    notices: true,
    customDomain: true,
    pwa: true,
    whatsapp: false,
    analytics: false,
  });

  const handleFeatureToggle = (featureKey: string) => {
    setFeatures((prev) => ({
      ...prev,
      [featureKey]: !prev[featureKey],
    }));
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const res = await createSubscriptionPlanAction({
        name,
        maxStudents: Number(maxStudents),
        maxStaff: Number(maxStaff),
        priceMonthly: Number(priceMonthly),
        priceAnnual: Number(priceAnnual),
        features,
      });

      if (res.success) {
        setIsModalOpen(false);
        setName('');
        router.refresh();
      } else {
        setFormError(res.error || 'Failed to create plan.');
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Subscription Plans & MRR Engine
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              SaaS Monetization
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure institutional SaaS tiers, feature entitlements, pricing metrics, and track platform subscription cashflow.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-purple-600/20 transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscription Plan</span>
        </button>
      </div>

      {/* Revenue & Tier Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Platform MRR
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{totalMrr.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-2">Active contracted monthly billings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Platform ARR
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{totalArr.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-2">Annualized contractual platform run-rate</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Active SaaS Tiers
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{plans.length}</div>
          <p className="text-xs text-slate-400 mt-2">Tiered plans active in market</p>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{plan.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {plan.tenantCount} {plan.tenantCount === 1 ? 'school' : 'schools'} enrolled
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ACTIVE TIER
                </span>
              </div>

              {/* Price Tag */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{plan.priceMonthly.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-medium text-slate-500">/ month</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Annual billed: ₹{plan.priceAnnual.toLocaleString('en-IN')}/yr
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                  <div className="text-[10px] text-purple-600 font-bold uppercase">
                    Max Students
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {plan.maxStudents.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="text-[10px] text-blue-600 font-bold uppercase">Max Faculty</div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {plan.maxStaff.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Included Features
                </div>
                {Object.entries(plan.features).map(([featureName, isEnabled]) => (
                  <div key={featureName} className="flex items-center gap-2">
                    {isEnabled ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span
                      className={`capitalize ${
                        isEnabled ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {featureName.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Footer: Monthly Revenue */}
            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Monthly Revenue:</span>
              <span className="font-extrabold text-purple-700 font-mono">
                ₹{plan.totalMonthlyRevenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isPending && setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Create Subscription Tier
                  </h2>
                  <p className="text-xs text-slate-400">
                    Define limits, monthly/annual fee, and feature entitlements.
                  </p>
                </div>
              </div>

              {!isPending && (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Campus Plan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Students *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Staff *</label>
                  <input
                    type="number"
                    required
                    min={2}
                    value={maxStaff}
                    onChange={(e) => setMaxStaff(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Monthly Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Annual Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceAnnual}
                    onChange={(e) => setPriceAnnual(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700">Included Features</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(features).map((featKey) => (
                    <label
                      key={featKey}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={features[featKey]}
                        onChange={() => handleFeatureToggle(featKey)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="capitalize font-medium text-slate-700 text-xs">
                        {featKey.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsModalOpen(false)}
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
                      <span>Creating Plan...</span>
                    </>
                  ) : (
                    <span>Save Plan</span>
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
