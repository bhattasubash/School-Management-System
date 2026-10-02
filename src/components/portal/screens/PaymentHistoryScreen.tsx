'use client';

import React from 'react';
import { Download, CheckCircle2, History, ArrowRight } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface PaymentHistoryScreenProps {
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

const TRANSACTIONS = [
  { id: 'TXN-20260714-9921', date: '14 Jul 2026, 11:32 AM', method: 'UPI (GPay / Axis Bank)', amount: 16000, status: 'Successful', receiptNo: 'RCP-2026-8812', term: 'Quarter 2 Tuition' },
  { id: 'TXN-20260410-3312', date: '10 Apr 2026, 04:15 PM', method: 'Net Banking (HDFC Bank)', amount: 16000, status: 'Successful', receiptNo: 'RCP-2026-4401', term: 'Quarter 1 Tuition & Labs' },
  { id: 'TXN-20260228-1109', date: '28 Feb 2026, 10:05 AM', method: 'Debit Card (SBI RuPay)', amount: 5000, status: 'Successful', receiptNo: 'RCP-2026-1022', term: 'Registration & Books' },
];

export default function PaymentHistoryScreen({
  onBackToDashboard,
  onSelectNav,
}: PaymentHistoryScreenProps) {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Payment History"
        subtitle="Complete ledger of fee transactions, online receipts, and banking reconciliation"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('fee-summary')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          Fee Summary
        </button>
      </PortalPageHeader>

      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <History className="w-5 h-5 text-blue-600" />
            <span>Transaction Ledger</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">3 Verified Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Transaction ID & Date</th>
                <th className="py-3 px-4">Fee Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-center">Amount Paid (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TRANSACTIONS.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-800 block">{txn.id}</span>
                    <span className="text-[11px] text-slate-400">{txn.date}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{txn.term}</td>
                  <td className="py-3.5 px-4 text-slate-600">{txn.method}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                    ₹{txn.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{txn.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Downloading official receipt for ${txn.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Receipt</span>
                    </button>
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
