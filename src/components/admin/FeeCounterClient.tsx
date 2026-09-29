'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Receipt,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  Layers,
  Calendar,
  Sparkles,
  IndianRupee,
  UserCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { collectCounterFeeAction, generateQuarterlyInvoicesAction } from '@/actions/admin';
import { PaymentMethod } from '@prisma/client';

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  termName: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  lateFee: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  isOverdue: boolean;
  items: {
    category: string;
    amount: number;
    description: string;
  }[];
}

export interface PaymentItem {
  id: string;
  receiptNumber: string;
  invoiceNumber: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  amount: number;
  paymentMethod: string;
  remarks?: string | null;
  date: string;
  collectorName?: string | null;
}

export interface StudentLookupItem {
  id: string;
  name: string;
  admissionNumber: string;
  className: string;
  parentName?: string | null;
  parentPhone?: string | null;
}

export interface FeeCounterClientProps {
  metrics: {
    totalInvoiced: number;
    totalCollected: number;
    totalPending: number;
    overdueCount: number;
  };
  invoices: InvoiceItem[];
  payments: PaymentItem[];
  students: StudentLookupItem[];
  academicYears: { id: string; name: string }[];
  classGrades: { id: string; name: string }[];
  feeTerms: { id: string; name: string; termNumber: number; academicYearId: string }[];
}

export default function FeeCounterClient({
  metrics,
  invoices: initialInvoices,
  payments: initialPayments,
  students,
  academicYears,
  classGrades,
  feeTerms,
}: FeeCounterClientProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'receipts'>('invoices');
  const [invoiceFilter, setInvoiceFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Payment Drawer State
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentLookupItem | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [issuedReceipt, setIssuedReceipt] = useState<{
    receiptNumber: string;
    amount: number;
    studentName: string;
    admissionNumber: string;
    invoiceNumber: string;
    method: string;
    newBalance: number;
    date: string;
  } | null>(null);

  // Batch Invoicing Modal State
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchYearId, setBatchYearId] = useState(academicYears[0]?.id || '');
  const [batchGradeId, setBatchGradeId] = useState(classGrades[0]?.id || '');
  const [batchTermId, setBatchTermId] = useState(feeTerms[0]?.id || '');
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchMessage, setBatchMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return initialInvoices.filter((inv) => {
      const matchSearch =
        searchTerm === '' ||
        inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.className.toLowerCase().includes(searchTerm.toLowerCase());

      const matchFilter =
        invoiceFilter === 'ALL' ||
        (invoiceFilter === 'OVERDUE' ? inv.isOverdue && inv.balanceAmount > 0 : inv.status === invoiceFilter);

      return matchSearch && matchFilter;
    });
  }, [initialInvoices, searchTerm, invoiceFilter]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return initialPayments.filter((p) => {
      return (
        searchTerm === '' ||
        p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [initialPayments, searchTerm]);

  // Filtered student lookup for Counter
  const lookupResults = useMemo(() => {
    if (!studentSearchQuery.trim()) return [];
    const query = studentSearchQuery.toLowerCase();
    return students
      .filter((s) => s.name.toLowerCase().includes(query) || s.admissionNumber.toLowerCase().includes(query))
      .slice(0, 6);
  }, [students, studentSearchQuery]);

  // Invoices for selected student
  const studentInvoices = useMemo(() => {
    if (!selectedStudent) return [];
    return initialInvoices.filter((inv) => inv.studentId === selectedStudent.id && inv.balanceAmount > 0);
  }, [selectedStudent, initialInvoices]);

  // Handler: Select invoice for counter payment
  const handleSelectInvoice = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setPaymentAmount(String(inv.balanceAmount));
    setPaymentError(null);
  };

  // Handler: Quick Launch Counter from Invoices Table
  const openCounterForInvoice = (inv: InvoiceItem) => {
    const student = students.find((s) => s.id === inv.studentId);
    if (student) {
      setSelectedStudent(student);
      setStudentSearchQuery(`${student.name} (${student.admissionNumber})`);
      setSelectedInvoice(inv);
      setPaymentAmount(String(inv.balanceAmount));
      setPaymentError(null);
      setIssuedReceipt(null);
      setIsCounterOpen(true);
    }
  };

  // Handler: Execute Counter Payment
  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) {
      setPaymentError('Please select an invoice to collect payment against.');
      return;
    }

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setPaymentError('Enter a valid payment amount greater than ₹0.');
      return;
    }

    if (amt > selectedInvoice.balanceAmount) {
      setPaymentError(`Amount cannot exceed outstanding balance of ₹${selectedInvoice.balanceAmount.toLocaleString('en-IN')}`);
      return;
    }

    setIsSubmittingPayment(true);
    setPaymentError(null);

    const res = await collectCounterFeeAction({
      feeInvoiceId: selectedInvoice.id,
      amount: amt,
      paymentMethod,
      remarks: paymentRemarks || undefined,
    });

    setIsSubmittingPayment(false);

    if (res.success && res.receiptNumber && res.invoice) {
      setIssuedReceipt({
        receiptNumber: res.receiptNumber,
        amount: amt,
        studentName: selectedStudent?.name || selectedInvoice.studentName,
        admissionNumber: selectedStudent?.admissionNumber || selectedInvoice.admissionNumber,
        invoiceNumber: selectedInvoice.invoiceNumber,
        method: paymentMethod,
        newBalance: res.invoice.balanceAmount,
        date: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      setSelectedInvoice(null);
      setPaymentRemarks('');
    } else {
      setPaymentError(res.error || 'Failed to collect payment.');
    }
  };

  // Handler: Run Batch Invoicing
  const handleRunBatchInvoicing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingBatch(true);
    setBatchMessage(null);

    const res = await generateQuarterlyInvoicesAction({
      academicYearId: batchYearId,
      classGradeId: batchGradeId,
      feeTermId: batchTermId,
    });

    setIsGeneratingBatch(false);

    if (res.success) {
      setBatchMessage({
        type: 'success',
        text: `Success! Generated ${res.count} itemized fee invoices for the selected class grade.`,
      });
      setTimeout(() => {
        setIsBatchOpen(false);
        setBatchMessage(null);
      }, 2500);
    } else {
      setBatchMessage({
        type: 'error',
        text: res.error || 'Failed to generate quarterly invoices.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Action Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Fee Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">AY 2026-27</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111C2D] tracking-tight">Fee Counter & Collections</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time receipting, counter cash/POS settlement, and quarterly billing automation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedStudent(null);
              setSelectedInvoice(null);
              setStudentSearchQuery('');
              setIssuedReceipt(null);
              setPaymentError(null);
              setIsCounterOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF7555] hover:bg-[#ff623d] text-white font-medium text-sm rounded-xl shadow-sm transition-all transform active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            + Record Counter Payment
          </button>

          <button
            onClick={() => setIsBatchOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all"
          >
            <Layers className="w-4 h-4 text-slate-600" />
            Batch Invoices
          </button>
        </div>
      </div>

      {/* 2. Executive Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Billed</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#111C2D]">
            ₹{metrics.totalInvoiced.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-slate-700 font-medium">{initialInvoices.length} invoices</span> issued across terms
          </p>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Collected Cash & POS</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            ₹{metrics.totalCollected.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-medium">
              {metrics.totalInvoiced > 0
                ? `${Math.round((metrics.totalCollected / metrics.totalInvoiced) * 100)}%`
                : '0%'}
            </span>{' '}
            collection efficiency
          </p>
        </div>

        {/* Total Pending Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding Dues</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            ₹{metrics.totalPending.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-amber-700 font-medium">
              {initialInvoices.filter((i) => i.balanceAmount > 0).length} students
            </span>{' '}
            with pending balance
          </p>
        </div>

        {/* Overdue Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue Invoices</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{metrics.overdueCount}</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            Subject to late fine ₹50/quarter
          </p>
        </div>
      </div>

      {/* 3. Main Data Container: Tabs & Search Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Navigation Tabs & Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'invoices'
                  ? 'bg-[#111C2D] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Fee Invoices ({filteredInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'receipts'
                  ? 'bg-[#111C2D] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Payment Receipts ({filteredPayments.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'invoices' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
                {(['ALL', 'PENDING', 'PARTIAL', 'PAID', 'OVERDUE'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setInvoiceFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      invoiceFilter === filter
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter}
                  </button>
                ))}
              </div>
            )}

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'invoices'
                    ? 'Search student, invoice #'
                    : 'Search receipt, student #'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Invoices Table */}
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Student & Class</th>
                  <th className="py-3 px-4">Fee Term</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Billed (₹)</th>
                  <th className="py-3 px-4 text-right">Paid (₹)</th>
                  <th className="py-3 px-4 text-right">Balance (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No invoices found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{inv.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {inv.admissionNumber} • {inv.className}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{inv.termName}</td>
                      <td className="py-3 px-4">
                        <div
                          className={`font-medium ${
                            inv.isOverdue && inv.balanceAmount > 0 ? 'text-rose-600' : 'text-slate-600'
                          }`}
                        >
                          {new Date(inv.dueDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {inv.isOverdue && inv.balanceAmount > 0 && (
                          <span className="text-[10px] text-rose-500 font-semibold block">Overdue</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900">
                        ₹{inv.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-600">
                        ₹{inv.paidAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{inv.balanceAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : inv.status === 'PARTIAL'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : inv.isOverdue
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {inv.status === 'PAID'
                            ? 'PAID'
                            : inv.status === 'PARTIAL'
                            ? 'PARTIAL'
                            : inv.isOverdue
                            ? 'OVERDUE'
                            : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv.balanceAmount > 0 ? (
                          <button
                            onClick={() => openCounterForInvoice(inv)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#111C2D] hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Collect
                          </button>
                        ) : (
                          <span className="text-emerald-600 text-xs font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Payment Receipts Table */}
        {activeTab === 'receipts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Student & Class</th>
                  <th className="py-3 px-4">Against Invoice</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No payment receipts found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(p.date).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{p.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {p.admissionNumber} • {p.className}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{p.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          SUCCESS
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => window.print()}
                          title="Print Receipt Voucher"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL: Counter Fee Collection Drawer */}
      {isCounterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF7555]/10 text-[#FF7555] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111C2D]">Fee Counter Collection</h3>
                  <p className="text-xs text-slate-500">Atomic instant receipt generation for student ledger</p>
                </div>
              </div>
              <button
                onClick={() => setIsCounterOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* If receipt was just issued */}
              {issuedReceipt ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-emerald-900">Payment Successfully Collected</h4>
                    <p className="text-xs text-emerald-700">Official receipt voucher generated and ledger reconciled.</p>

                    <div className="bg-white rounded-xl p-4 border border-emerald-200/80 text-left space-y-2 mt-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Receipt Number:</span>
                        <span className="font-mono font-bold text-slate-900">{issuedReceipt.receiptNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student:</span>
                        <span className="font-semibold text-slate-900">
                          {issuedReceipt.studentName} ({issuedReceipt.admissionNumber})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount Collected:</span>
                        <span className="font-bold text-emerald-600 text-sm">
                          ₹{issuedReceipt.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Mode:</span>
                        <span className="font-medium text-slate-800">{issuedReceipt.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Remaining Balance:</span>
                        <span className="font-semibold text-slate-800">
                          {issuedReceipt.newBalance === 0 ? '₹0 (PAID IN FULL)' : `₹${issuedReceipt.newBalance.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="text-slate-600">{issuedReceipt.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-3 bg-[#111C2D] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Print Receipt Voucher
                    </button>
                    <button
                      onClick={() => {
                        setIssuedReceipt(null);
                        setSelectedInvoice(null);
                        setSelectedStudent(null);
                        setStudentSearchQuery('');
                      }}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                    >
                      Collect Another
                    </button>
                  </div>
                </div>
              ) : (
                /* Collection Form */
                <form onSubmit={handleCollectPayment} className="space-y-4">
                  {paymentError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Step 1: Student Lookup */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">1. Select Student</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search student by name or admission number..."
                        value={studentSearchQuery}
                        onChange={(e) => {
                          setStudentSearchQuery(e.target.value);
                          if (selectedStudent) {
                            setSelectedStudent(null);
                            setSelectedInvoice(null);
                          }
                        }}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                      />
                    </div>

                    {/* Lookup Autocomplete Dropdown */}
                    {lookupResults.length > 0 && !selectedStudent && (
                      <div className="bg-white border border-slate-200 rounded-xl shadow-lg mt-1 divide-y divide-slate-100 max-h-48 overflow-y-auto z-10">
                        {lookupResults.map((s) => (
                          <button
                            type="button"
                            key={s.id}
                            onClick={() => {
                              setSelectedStudent(s);
                              setStudentSearchQuery(`${s.name} (${s.admissionNumber})`);
                              setSelectedInvoice(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs hover:bg-slate-50 flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">{s.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {s.admissionNumber} • {s.className}
                              </div>
                            </div>
                            <span className="text-[11px] text-[#FF7555] font-semibold flex items-center gap-1">
                              Select <ChevronRight className="w-3 h-3" />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Invoices for Selected Student */}
                  {selectedStudent && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">2. Select Pending Invoice</label>
                        <span className="text-[11px] text-slate-500">
                          {studentInvoices.length} unpaid bill{studentInvoices.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {studentInvoices.length === 0 ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>All fee dues for {selectedStudent.name} are cleared in full!</span>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {studentInvoices.map((inv) => (
                            <div
                              key={inv.id}
                              onClick={() => handleSelectInvoice(inv)}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                selectedInvoice?.id === inv.id
                                  ? 'border-[#FF7555] bg-[#FF7555]/5 shadow-xs'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between font-semibold">
                                <span className="text-slate-900">{inv.termName}</span>
                                <span className="font-mono text-slate-700">{inv.invoiceNumber}</span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                                <span>Due: {new Date(inv.dueDate).toLocaleDateString('en-IN')}</span>
                                <span className="font-bold text-amber-700">
                                  Balance: ₹{inv.balanceAmount.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Payment Amount & Method */}
                  {selectedInvoice && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">3. Payment Details</label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div>
                            <span className="text-[11px] text-slate-500 block mb-1">Amount to Collect (₹)</span>
                            <div className="relative">
                              <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="number"
                                step="1"
                                min="1"
                                max={selectedInvoice.balanceAmount}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-500 block mb-1">Payment Method</span>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                            >
                              <option value="CASH">Cash at Counter</option>
                              <option value="POS">POS / Card Swipe</option>
                              <option value="RAZORPAY_UPI">Counter UPI QR</option>
                              <option value="CHEQUE">Cheque / Demand Draft</option>
                              <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block mb-1">
                          Remarks / Cheque / Auth Code (Optional)
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. Counter Cash Paid by Father"
                          value={paymentRemarks}
                          onChange={(e) => setPaymentRemarks(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingPayment}
                        className="w-full py-3 bg-[#FF7555] hover:bg-[#ff623d] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingPayment ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Recording Payment & Printing Receipt...
                          </>
                        ) : (
                          <>
                            <Receipt className="w-4 h-4" />
                            Collect ₹{Number(paymentAmount || 0).toLocaleString('en-IN')} & Issue Receipt
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Batch Quarterly Invoicing */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111C2D]">Batch Invoicing</h3>
                  <p className="text-xs text-slate-500">Generate itemized quarterly bills for an entire class grade</p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRunBatchInvoicing} className="p-6 space-y-4">
              {batchMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    batchMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {batchMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{batchMessage.text}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Year</label>
                <select
                  value={batchYearId}
                  onChange={(e) => setBatchYearId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Class Grade</label>
                <select
                  value={batchGradeId}
                  onChange={(e) => setBatchGradeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                >
                  {classGrades.map((cg) => (
                    <option key={cg.id} value={cg.id}>
                      {cg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Billing Fee Term</label>
                <select
                  value={batchTermId}
                  onChange={(e) => setBatchTermId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                >
                  {feeTerms.map((ft) => (
                    <option key={ft.id} value={ft.id}>
                      {ft.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800 block">Automation Rules:</span>
                <p>• Automatically pulls tuition, lab, library, and sports fees for this grade.</p>
                <p>• Avoids duplicating bills for students who already have an invoice for this term.</p>
                <p>• Enforces unique, monotonic sequential invoice numbering.</p>
              </div>

              <button
                type="submit"
                disabled={isGeneratingBatch}
                className="w-full py-3 bg-[#111C2D] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingBatch ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Invoices...
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    Generate Class Invoices
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
