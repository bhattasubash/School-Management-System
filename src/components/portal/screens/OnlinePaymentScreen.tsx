'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Loader2,
  Sparkles,
  Building2,
  User,
  Receipt,
  Download,
  QrCode,
  Smartphone,
  ChevronRight,
  ExternalLink,
  Printer,
} from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';
import { createRazorpayOrderAction, verifyRazorpayPaymentAction } from '@/actions/payment';

interface OnlinePaymentScreenProps {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    rollNumber: number | null;
    sectionName: string;
    className: string;
    board: string;
    avatarUrl?: string | null;
    email?: string;
    phone?: string;
  };
  feeStatus: {
    isOverdue: boolean;
    pendingAmount: number;
    nextDueDate: string;
    totalPaid: number;
    statusText: string;
  };
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    title: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    dueDate: string;
    status: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
    items: Array<{
      category: string;
      amount: number;
      paid: number;
      status: 'Paid' | 'Pending';
    }>;
  }>;
  initialInvoiceId?: string | null;
  initialAmount?: number | null;
  onPaymentSuccess?: (paidAmount: number, receiptNo: string) => void;
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

export default function OnlinePaymentScreen({
  student,
  feeStatus,
  invoices = [],
  initialInvoiceId,
  initialAmount,
  onPaymentSuccess,
  onBackToDashboard,
  onSelectNav,
}: OnlinePaymentScreenProps) {
  // 1. Dynamic Fee Items based on real invoices or student fee status
  const pendingInvoices = invoices.filter((inv) => inv.balanceAmount > 0);
  const defaultInvoice = pendingInvoices.find((i) => i.id === initialInvoiceId) || pendingInvoices[0];

  const defaultAmount = initialAmount && initialAmount > 0
    ? initialAmount
    : defaultInvoice
    ? defaultInvoice.balanceAmount
    : feeStatus.pendingAmount > 0
    ? feeStatus.pendingAmount
    : 4500;

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    defaultInvoice?.id || initialInvoiceId || null
  );
  const [selectedFeeHead, setSelectedFeeHead] = useState<string>(
    defaultInvoice?.title || 'Annual CBSE Examination Fee (Term 1)'
  );
  const [payableAmount, setPayableAmount] = useState<number>(defaultAmount);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmountInput, setCustomAmountInput] = useState<string>(defaultAmount.toString());

  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('student.parent@upi');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [simulatedOrderData, setSimulatedOrderData] = useState<any>(null);

  const [completedPayment, setCompletedPayment] = useState<{
    receiptNumber: string;
    transactionId: string;
    amount: number;
    date: string;
    studentName: string;
    admissionNumber: string;
    method: string;
    feeDescription: string;
  } | null>(null);

  // Sync if props update
  useEffect(() => {
    if (initialAmount && initialAmount > 0) {
      setPayableAmount(initialAmount);
      setCustomAmountInput(initialAmount.toString());
    }
  }, [initialAmount]);

  // Load Razorpay Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Launch Razorpay Payment Flow
  const handleInitiateRazorpay = async () => {
    if (payableAmount <= 0) {
      alert('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    setIsInitiating(true);

    try {
      // 1. Create Order via Server Action
      const orderRes = await createRazorpayOrderAction({
        invoiceId: selectedInvoiceId || undefined,
        amount: payableAmount,
        description: `Fee: ${selectedFeeHead} for ${student.name}`,
      });

      if (!orderRes.success || !orderRes.orderId) {
        alert(orderRes.error || 'Failed to initialize payment gateway.');
        setIsInitiating(false);
        return;
      }

      // If simulated mode (e.g. placeholder test keys in .env)
      if (orderRes.isDevSimulation) {
        setSimulatedOrderData(orderRes);
        setShowSimulatedModal(true);
        setIsInitiating(false);
        return;
      }

      // 2. Load script for live Razorpay checkout
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        // Fallback to simulated drawer if script fails to load
        setSimulatedOrderData(orderRes);
        setShowSimulatedModal(true);
        setIsInitiating(false);
        return;
      }

      // 3. Configure Razorpay standard options
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amountInPaise,
        currency: 'INR',
        name: 'Sunrise Public School',
        description: `${selectedFeeHead} - ${student.name} (${student.className}-${student.sectionName})`,
        image: '/images/dashboard/ref_avatar.png',
        order_id: orderRes.orderId,
        prefill: {
          name: student.name,
          email: student.email || 'student@dps.edu.in',
          contact: student.phone || '+91 98765 43210',
        },
        notes: {
          admissionNumber: student.admissionNumber,
          studentId: student.id,
          class: `${student.className}-${student.sectionName}`,
          feeHead: selectedFeeHead,
        },
        theme: {
          color: '#2563EB',
        },
        handler: async function (response: any) {
          await finalizePayment({
            orderId: response.razorpay_order_id || orderRes.orderId!,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            invoiceId: orderRes.invoiceId || selectedInvoiceId || '',
          });
        },
        modal: {
          ondismiss: function () {
            setIsInitiating(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (res: any) {
        alert(`Payment Failed: ${res.error.description || 'Transaction declined'}`);
        setIsInitiating(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('[Razorpay Checkout Error]', err);
      alert('Could not start Razorpay checkout. Please try again.');
    } finally {
      setIsInitiating(false);
    }
  };

  // Finalize & Record Payment in DB
  const finalizePayment = async ({
    orderId,
    paymentId,
    signature,
    invoiceId,
  }: {
    orderId: string;
    paymentId: string;
    signature?: string;
    invoiceId: string;
  }) => {
    setIsProcessing(true);
    setShowSimulatedModal(false);

    try {
      const verifyRes = await verifyRazorpayPaymentAction({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        invoiceId,
        amount: payableAmount,
        paymentMethod: selectedMethod,
      });

      if (!verifyRes.success) {
        alert(verifyRes.error || 'Payment verification failed on server.');
        setIsProcessing(false);
        return;
      }

      setCompletedPayment({
        receiptNumber: verifyRes.receiptNumber || `REC-2026-${Date.now().toString().slice(-5)}`,
        transactionId: paymentId,
        amount: payableAmount,
        date: new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        studentName: student.name,
        admissionNumber: student.admissionNumber,
        method: selectedMethod === 'upi' ? 'UPI (Razorpay Gateway)' : selectedMethod === 'card' ? 'Debit/Credit Card' : 'Net Banking',
        feeDescription: selectedFeeHead,
      });

      setPaymentSuccess(true);
      onPaymentSuccess?.(payableAmount, verifyRes.receiptNumber || '');
    } catch (err: any) {
      console.error('[Payment Verification Error]', err);
      alert('Network error while recording payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Online Fee Payment"
        subtitle="Dynamic Razorpay checkout integrated with student assessment ledger and live invoice reconciliation"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('fee-summary')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          Cancel & Return
        </button>
      </PortalPageHeader>

      {/* ==================================================================== */}
      {/* SUCCESS SCREEN WITH OFFICIAL VERIFIED RECEIPT                        */}
      {/* ==================================================================== */}
      {paymentSuccess && completedPayment ? (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-[26px] shadow-[0_12px_40px_rgba(16,185,129,0.12)] border border-emerald-100 p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                Payment Settled & Reconciled
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                ₹{completedPayment.amount.toLocaleString('en-IN')} Paid Successfully!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your payment has been securely confirmed via Razorpay and recorded in the school ERP.
              </p>
            </div>

            {/* Official Itemized Receipt Box */}
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 text-left text-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">Official Electronic Receipt</span>
                </div>
                <span className="font-mono font-bold text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded-md">
                  {completedPayment.receiptNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 text-[12px]">
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Student Name</span>
                  <span className="font-semibold text-slate-800">{completedPayment.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Roll / Admission No</span>
                  <span className="font-semibold text-slate-800">{completedPayment.admissionNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Fee Category</span>
                  <span className="font-semibold text-slate-800">{completedPayment.feeDescription}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Payment Channel</span>
                  <span className="font-semibold text-slate-800">{completedPayment.method}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Razorpay Payment ID</span>
                  <span className="font-mono text-slate-700 text-[11px] truncate block">
                    {completedPayment.transactionId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Transaction Date</span>
                  <span className="font-medium text-slate-700 text-[11px]">{completedPayment.date}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectNav('payment-history')}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                View in Payment Ledger
              </button>
              <button
                type="button"
                onClick={() => onSelectNav('fee-summary')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Back to Fee Summary
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* PAYMENT FORM & DYNAMIC INVOICE BREAKDOWN                            */
        /* ==================================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Left 2 Cols: Student Info, Dynamic Selection & Razorpay Checkout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Verified Profile Badge */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[22px] p-5 text-white shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-lg font-bold border border-white/20">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{student.name}</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                      Class {student.className}-{student.sectionName}
                    </span>
                  </div>
                  <div className="text-xs text-blue-100 flex items-center gap-3 mt-0.5">
                    <span>Admission: <strong>{student.admissionNumber}</strong></span>
                    <span>•</span>
                    <span>Roll No: <strong>#{student.rollNumber || '27'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[10px] uppercase font-bold text-blue-200 block">Academic Session</span>
                <span className="text-sm font-extrabold text-white">2026–27 (CBSE)</span>
              </div>
            </div>

            {/* Dynamic Fee Selection Card */}
            <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 sm:p-7 space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Invoice or Fee Head</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic amount calculated from student's verified academic assessment and billing records.
                </p>
              </div>

              {/* Fee Head Radio Cards */}
              <div className="space-y-2.5">
                <div
                  onClick={() => {
                    setIsCustomAmount(false);
                    setPayableAmount(4500);
                    setSelectedFeeHead('Annual CBSE Examination Fee (Term 1)');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    !isCustomAmount && payableAmount === 4500
                      ? 'border-[#2563EB] bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        !isCustomAmount && payableAmount === 4500
                          ? 'border-[#2563EB] bg-[#2563EB]'
                          : 'border-slate-300'
                      }`}
                    >
                      {!isCustomAmount && payableAmount === 4500 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Annual CBSE Examination Fee (Term 1)
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Due Date: 15 Oct 2026 • Term 1 Assessment & Board Registration
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 block">₹4,500</span>
                    <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  </div>
                </div>

                {/* Option for Full Session Dues */}
                {feeStatus.pendingAmount > 4500 && (
                  <div
                    onClick={() => {
                      setIsCustomAmount(false);
                      setPayableAmount(feeStatus.pendingAmount);
                      setSelectedFeeHead('Full Consolidated Academic Session Dues');
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      !isCustomAmount && payableAmount === feeStatus.pendingAmount
                        ? 'border-[#2563EB] bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          !isCustomAmount && payableAmount === feeStatus.pendingAmount
                            ? 'border-[#2563EB] bg-[#2563EB]'
                            : 'border-slate-300'
                        }`}
                      >
                        {!isCustomAmount && payableAmount === feeStatus.pendingAmount && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          Total Outstanding Balance
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Consolidated settlement across all pending invoices
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 block">
                        ₹{feeStatus.pendingAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                        Full Settlement
                      </span>
                    </div>
                  </div>
                )}

                {/* Custom Amount option */}
                <div
                  onClick={() => setIsCustomAmount(true)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isCustomAmount ? 'border-[#2563EB] bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isCustomAmount ? 'border-[#2563EB] bg-[#2563EB]' : 'border-slate-300'
                        }`}
                      >
                        {isCustomAmount && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="font-bold text-xs text-slate-900">
                        Pay Custom or Installment Amount
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Part Payment</span>
                  </div>

                  {isCustomAmount && (
                    <div className="mt-3 pl-7">
                      <div className="relative max-w-xs">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="100"
                          max={feeStatus.pendingAmount || 45000}
                          value={customAmountInput}
                          onChange={(e) => {
                            setCustomAmountInput(e.target.value);
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              setPayableAmount(val);
                            }
                          }}
                          placeholder="Enter amount"
                          className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Minimum payment: ₹100. Max: ₹{(feeStatus.pendingAmount || 4500).toLocaleString('en-IN')}.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Channel Options */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Preferred Payment Channel
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('upi')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedMethod === 'upi'
                        ? 'border-[#2563EB] bg-blue-50/60 text-[#2563EB] font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5" />
                      <span className="text-xs">UPI / QR</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                      GPay, PhonePe, Paytm
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedMethod === 'card'
                        ? 'border-[#2563EB] bg-blue-50/60 text-[#2563EB] font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-xs">Cards</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                      Debit / Credit (Visa, RuPay)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('netbanking')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedMethod === 'netbanking'
                        ? 'border-[#2563EB] bg-blue-50/60 text-[#2563EB] font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="text-xs">Net Banking</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                      All 50+ Indian Banks
                    </span>
                  </button>
                </div>
              </div>

              {/* Primary Action Button: Integrated Razorpay Button */}
              <button
                type="button"
                onClick={handleInitiateRazorpay}
                disabled={isInitiating || isProcessing || payableAmount <= 0}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-[0_6px_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 cursor-pointer mt-4"
              >
                {isInitiating || isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting to Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{payableAmount.toLocaleString('en-IN')} with Razorpay</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  PCI-DSS 256-Bit Encrypted
                </span>
                <span>•</span>
                <span>Instant Bank Acknowledgment</span>
                <span>•</span>
                <span>Official GST Invoice</span>
              </div>
            </div>
          </div>

          {/* Right Col: Bill Breakdown & Razorpay Badging */}
          <div className="space-y-6">
            <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Payment Summary</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    Direct Gateway
                  </span>
                </h4>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="truncate max-w-[170px]" title={selectedFeeHead}>
                      {selectedFeeHead}
                    </span>
                    <span className="font-semibold text-slate-900">
                      ₹{payableAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Convenience Fee</span>
                    <span className="font-semibold text-emerald-600">₹0 (School Sponsored)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Applicable GST (18%)</span>
                    <span className="font-semibold text-slate-900">Inclusive</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>Total Amount Payable</span>
                    <span className="text-[#2563EB] text-xl font-extrabold">
                      ₹{payableAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Razorpay Trust Banner */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">Powered by Razorpay</span>
                  <span className="text-[9px] font-bold bg-[#0C2340] text-[#3395FF] px-1.5 py-0.5 rounded">
                    RAZORPAY
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed">
                  Supports UPI AutoPay, Google Pay, PhonePe, Credit & Debit Cards, Net Banking & Wallets.
                </p>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p>• Verified instant transaction logging.</p>
                <p>• Zero payment gateway surcharges.</p>
                <p>• Fee clearance updated in student record immediately.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SIMULATED RAZORPAY TEST MODAL (For Development & Instant Review)     */}
      {/* ==================================================================== */}
      {showSimulatedModal && simulatedOrderData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden space-y-0">
            {/* Modal Header mimicking Razorpay Branding */}
            <div className="bg-[#0C2340] p-5 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black tracking-wider text-[#3395FF] text-sm">RAZORPAY</span>
                  <span className="text-[10px] text-slate-300 font-mono">SECURE</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">Sunrise Public School</h3>
                <p className="text-[11px] text-slate-300">{selectedFeeHead}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</span>
                <span className="text-lg font-black text-[#3395FF] block">
                  ₹{payableAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 flex items-start gap-2 text-blue-800">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Developer Test Gateway</span>
                  <span className="text-[11px] text-blue-700 block">
                    Order ID: <code className="font-mono">{simulatedOrderData.orderId}</code>
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block text-[11px]">Select Test Method:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      finalizePayment({
                        orderId: simulatedOrderData.orderId,
                        paymentId: `pay_upi_${Date.now()}`,
                        invoiceId: simulatedOrderData.invoiceId || selectedInvoiceId || '',
                      })
                    }
                    className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-left font-semibold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="block text-xs">Simulate UPI</span>
                      <span className="block text-[10px] font-normal text-emerald-600">Auto Success</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      finalizePayment({
                        orderId: simulatedOrderData.orderId,
                        paymentId: `pay_card_${Date.now()}`,
                        invoiceId: simulatedOrderData.invoiceId || selectedInvoiceId || '',
                      })
                    }
                    className="p-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100/80 text-blue-800 text-left font-semibold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="block text-xs">Simulate Card</span>
                      <span className="block text-[10px] font-normal text-blue-600">Visa / Master</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulatedModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
