'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface OnlinePaymentScreenProps {
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

export default function OnlinePaymentScreen({
  onBackToDashboard,
  onSelectNav,
}: OnlinePaymentScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('subash@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Online Fee Payment"
        subtitle="Secure payment gateway for tuition fees, examination assessments, and institutional dues"
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

      {paymentSuccess ? (
        <div className="max-w-xl mx-auto bg-white rounded-[24px] shadow-[0_6px_30px_rgba(0,100,200,0.08)] border border-emerald-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Transaction ID: <strong>TXN-{Date.now().toString().slice(-8)}</strong> for ₹4,500 has been verified.
            A confirmation receipt has been sent to your registered email.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onSelectNav('payment-history')}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              View in Payment Ledger
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Left 2 Cols: Payment Form */}
          <div className="lg:col-span-2 bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Choose Payment Method</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All transactions are encrypted with PCI-DSS Compliant 256-bit SSL security.
              </p>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedMethod === 'upi'
                    ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">UPI / QR</span>
                <span className="text-[10px] text-slate-400 block font-normal mt-0.5">GPay, PhonePe</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedMethod === 'card'
                    ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">Cards</span>
                <span className="text-[10px] text-slate-400 block font-normal mt-0.5">Debit / Credit</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedMethod === 'netbanking'
                    ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">Net Banking</span>
                <span className="text-[10px] text-slate-400 block font-normal mt-0.5">All Banks</span>
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-4 text-xs">
              {selectedMethod === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Virtual Payment Address (UPI ID)
                    </label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>A collect request will be pushed to your UPI mobile app.</span>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Expiry</label>
                      <input
                        type="text"
                        required
                        placeholder="MM / YY"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Select Bank</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#2563EB] outline-none">
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 mt-4"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹4,500 Securely</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Col: Bill Summary */}
          <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Order & Fee Summary
              </h4>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>CBSE Exam Fee (Term 1)</span>
                  <span className="font-semibold text-slate-900">₹4,500</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Convenience Surcharge</span>
                  <span className="font-semibold text-emerald-600">₹0 (Waived)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Applicable GST (18%)</span>
                  <span className="font-semibold text-slate-900">Inclusive</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-[#2563EB] text-lg font-extrabold">₹4,500</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
              <p>• Immediate confirmation generated.</p>
              <p>• Razorpay / HDFC Payment Gateway enabled.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
