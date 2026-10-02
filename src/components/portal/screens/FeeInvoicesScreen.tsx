'use client';

import React from 'react';
import { Download, FileText, ArrowRight, Eye, CheckCircle2, Clock } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface FeeInvoicesScreenProps {
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

const INVOICES = [
  { id: 'INV-2026-Q3-0428', quarter: 'Quarter 3 (Oct - Dec 2026)', date: '01 Oct 2026', dueDate: '15 Oct 2026', totalAmount: 4500, balanceAmount: 4500, status: 'Pending' },
  { id: 'INV-2026-Q2-0428', quarter: 'Quarter 2 (Jul - Sep 2026)', date: '01 Jul 2026', dueDate: '15 Jul 2026', totalAmount: 16000, balanceAmount: 0, status: 'Paid', receiptNo: 'RCP-2026-8812' },
  { id: 'INV-2026-Q1-0428', quarter: 'Quarter 1 (Apr - Jun 2026)', date: '01 Apr 2026', dueDate: '15 Apr 2026', totalAmount: 16000, balanceAmount: 0, status: 'Paid', receiptNo: 'RCP-2026-4401' },
];

export default function FeeInvoicesScreen({
  onBackToDashboard,
  onSelectNav,
}: FeeInvoicesScreenProps) {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Fee Invoices"
        subtitle="Itemized billing invoices issued for Academic Session 2026-27"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('fee-summary')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          Fee Summary
        </button>
        <button
          type="button"
          onClick={() => onSelectNav('online-payment')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Pay Outstanding Invoices</span>
        </button>
      </PortalPageHeader>

      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Billing Quarter</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-center">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-blue-600">{inv.id}</td>
                  <td className="py-4 px-4 font-bold text-slate-900">{inv.quarter}</td>
                  <td className="py-4 px-4 text-slate-600">{inv.date}</td>
                  <td className="py-4 px-4 font-medium text-slate-700">{inv.dueDate}</td>
                  <td className="py-4 px-4 text-center font-bold text-slate-900 text-sm">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inv.status === 'Paid' ? (
                        <button
                          type="button"
                          onClick={() => alert(`Downloading invoice ${inv.id}`)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectNav('online-payment')}
                          className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold"
                        >
                          Pay
                        </button>
                      )}
                    </div>
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
