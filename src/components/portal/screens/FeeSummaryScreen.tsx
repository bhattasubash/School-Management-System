'use client';

import React from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle, Download, ArrowRight } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface FeeSummaryScreenProps {
  feeStatus: {
    isOverdue: boolean;
    pendingAmount: number;
    nextDueDate: string;
    totalPaid: number;
    statusText: string;
  };
  onPayInvoice?: (invoiceId?: string, amount?: number) => void;
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

const FEE_BREAKDOWN = [
  { category: 'Tuition Fee (Q3: Oct - Dec 2026)', amount: 24500, paid: 24500, status: 'Paid' },
  { category: 'Computer & AI Science Lab Fee', amount: 3500, paid: 3500, status: 'Paid' },
  { category: 'Library & Learning Resource Fee', amount: 1800, paid: 1800, status: 'Paid' },
  { category: 'Co-Curricular & Sports Wing Fee', amount: 2200, paid: 2200, status: 'Paid' },
  { category: 'Annual CBSE Examination Fee (Term 1)', amount: 4500, paid: 0, status: 'Pending', dueDate: '15 Oct 2026' },
];

export default function FeeSummaryScreen({
  feeStatus,
  onPayInvoice,
  onBackToDashboard,
  onSelectNav,
}: FeeSummaryScreenProps) {
  const pending = feeStatus.pendingAmount;
  const isPaid = pending === 0;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Fee Summary"
        subtitle="Annual tuition fees, quarterly billing breakdown, and outstanding balance status"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('payment-history')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          Payment Ledger
        </button>
        <button
          type="button"
          onClick={() => (onPayInvoice ? onPayInvoice(undefined, pending) : onSelectNav('online-payment'))}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay Online Now</span>
        </button>
      </PortalPageHeader>

      {/* Top Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Outstanding Due */}
        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Outstanding Balance</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isPaid ? 'Fully Paid' : 'Payment Due'}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3">
            ₹{pending.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Next Due Date: <span className="font-semibold text-slate-700">15 Oct 2026</span>
          </p>
        </div>

        {/* Total Paid */}
        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Paid (Session 2026-27)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-3">
            ₹32,000
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Receipts verified & approved
          </p>
        </div>

        {/* Academic Session Annual Fee */}
        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Annual Assessment</span>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
              Class 10
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mt-3">
            ₹36,500
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Including tuition, labs, and activities
          </p>
        </div>
      </div>

      {/* Fee Heads Breakdown Table */}
      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Current Session Fee Heads</h3>
          <button
            type="button"
            onClick={() => onSelectNav('fee-invoices')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Fee Head Category</th>
                <th className="py-3 px-4 text-center">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Paid Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {FEE_BREAKDOWN.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{row.category}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                    ₹{row.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    ₹{row.paid.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        row.status === 'Paid' || (row.category.includes('Annual CBSE') && isPaid)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {row.status === 'Paid' || (row.category.includes('Annual CBSE') && isPaid) ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {row.status === 'Paid' || (row.category.includes('Annual CBSE') && isPaid) ? (
                      <button
                        type="button"
                        onClick={() => alert(`Downloading receipt for ${row.category}`)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Receipt PDF
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => (onPayInvoice ? onPayInvoice(undefined, 4500) : onSelectNav('online-payment'))}
                        className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
