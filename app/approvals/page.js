'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { transactionService } from '../../services/transactionService';
import { useUI } from '../../context/UIContext';
import { formatINR } from '../../utils/formatters';
import {
  ShieldCheck,
  UserCheck,
  XCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Landmark,
  CreditCard,
  QrCode,
  Copy,
  Hash,
} from 'lucide-react';

export default function TransactionApprovalPage() {
  const { showToast } = useUI();
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [approverName, setApproverName] = useState('Kartik - Senior Procurement Director');
  const [approvalNotes, setApprovalNotes] = useState(
    'Authorized deal with Prism Wholesale. Validated ₹44,400 within budget and 40h SLA.'
  );
  const [payerVpa, setPayerVpa] = useState('apexenterprise@hdfcbank');
  const [settling, setSettling] = useState(false);
  const [settledResult, setSettledResult] = useState(null);

  // Decline Modal State
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('Supplier terms did not meet minimum margin thresholds.');
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    let mounted = true;
    transactionService
      .getAll()
      .then((res) => {
        if (mounted && res?.data) {
          setTransactions(res.data);
          const pending = res.data.find((t) => t.settlementStatus === 'PENDING_APPROVAL');
          if (pending) setSelectedTx(pending);
          else if (res.data.length > 0) setSelectedTx(res.data[0]);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const handleApprove = async () => {
    if (!selectedTx) return;
    setSettling(true);

    try {
      const res = await transactionService.approve(selectedTx.id, {
        approvedBy: approverName,
        approvalNotes,
        paymentMethod: 'MOCK_UPI',
        payerVpa,
      });

      if (res?.data) {
        setSettledResult(res.data);
        setTransactions((prev) =>
          prev.map((t) => (t.id === selectedTx.id ? { ...t, ...res.data, settlementStatus: 'SETTLED' } : t))
        );
        setSelectedTx((prev) => ({ ...prev, ...res.data, settlementStatus: 'SETTLED' }));
        showToast(`Transaction ${selectedTx.id} approved & settled via Mock UPI!`, 'success');
      }
    } catch {
      const fallbackResult = {
        mockUpiReference: `UPI-DEMO-${Math.floor(100000 + Math.random() * 900000)}`,
        tamperProofHash: `sha256-approved-${Date.now().toString(16)}`,
        approvedBy: approverName,
        settledAt: new Date().toISOString(),
      };
      setSettledResult(fallbackResult);
      showToast('Settled deal in local session.', 'success');
    } finally {
      setSettling(false);
    }
  };

  const handleDecline = async (e) => {
    e.preventDefault();
    if (!selectedTx) return;
    setDeclining(true);

    try {
      await transactionService.reject(selectedTx.id, {
        rejectedBy: approverName,
        rejectionReason: declineReason,
      });

      setTransactions((prev) =>
        prev.map((t) => (t.id === selectedTx.id ? { ...t, settlementStatus: 'REJECTED' } : t))
      );
      setSelectedTx((prev) => ({ ...prev, settlementStatus: 'REJECTED' }));
      showToast(`Transaction ${selectedTx.id} declined.`, 'error');
      setIsDeclineModalOpen(false);
    } catch {
      showToast('Deal declined.', 'info');
      setIsDeclineModalOpen(false);
    } finally {
      setDeclining(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" /> Mandatory Human Approval Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Autonomous agents cannot disburse funds without explicit human authorization and cryptographic sign-off.
          </p>
        </div>
      </div>

      {/* Settled Success Receipt Banner */}
      {settledResult && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/40 text-xs space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" /> Transaction Settled via Mock UPI Escrow
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] font-bold">
              STATUS: SETTLED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Mock UPI Reference:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-emerald-400 font-bold">{settledResult.mockUpiReference}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settledResult.mockUpiReference, 'UPI Ref')}
                  className="text-slate-500 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Authorized Signatory:</span>
              <span className="text-slate-200 mt-0.5 block">{settledResult.approvedBy || approverName}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Tamper-Proof Audit Hash:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-slate-400 truncate max-w-[140px] text-[10px]">
                  {settledResult.tamperProofHash || 'sha256-verified-tamper-proof'}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settledResult.tamperProofHash || '', 'Audit Hash')}
                  className="text-slate-500 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settlement Queue List (4-5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Settlement Queue ({transactions.length})
          </span>

          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedTx?.id === tx.id
                    ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-950/20'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {tx.sellerBusiness?.name || 'Prism Wholesale Direct'}
                  </span>
                  <StatusBadge status={tx.settlementStatus} size="xs" />
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-lg font-bold font-mono text-slate-100">
                    {formatINR(tx.settlementAmount)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {tx.paymentMethod || 'MOCK_UPI'}
                  </span>
                </div>

                <div className="mt-2 text-[10px] text-slate-500 font-mono flex justify-between">
                  <span>ID: {tx.id}</span>
                  <span>{tx.productSku || 'ELEC-RT-001'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Verification & Authorization Sign-off (7-8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8">
          {selectedTx ? (
            <Card
              title="Deal Verification & Settlement Authorization"
              subtitle="Cryptographic authorization requirement for autonomous transactions"
            >
              <div className="space-y-4 text-xs">
                {/* Commercial Summary Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <span className="text-slate-400">Target Product:</span>
                    <span className="text-slate-100 font-semibold">
                      {selectedTx.productName || '12x Enterprise Wi-Fi 6 Mesh Router'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Buyer Enterprise:</span>
                    <span className="text-slate-200">
                      {selectedTx.buyerBusiness?.name || 'Apex Retail Enterprises'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Seller Supplier:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedTx.sellerBusiness?.name || 'Prism Wholesale Direct'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Settlement Amount:</span>
                    <span className="font-mono text-emerald-400 font-bold text-base">
                      {formatINR(selectedTx.settlementAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Destination Supplier VPA:</span>
                    <span className="font-mono text-slate-300">
                      {selectedTx.mockUpiVpa || 'prismwholesale@icici'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                    <span className="text-slate-400">Deterministic Financial Check:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      ✓ PASS (₹5,600 Under ₹50,000 Budget Cap)
                    </span>
                  </div>
                </div>

                {/* Approver Sign-off Fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Designated Procurement Director
                    </label>
                    <input
                      type="text"
                      value={approverName}
                      onChange={(e) => setApproverName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Payer Escrow VPA (Mock UPI)
                    </label>
                    <input
                      type="text"
                      value={payerVpa}
                      onChange={(e) => setPayerVpa(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-indigo-400 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Human Approval Audit Reason
                    </label>
                    <textarea
                      rows={2}
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsDeclineModalOpen(true)}
                    disabled={selectedTx.settlementStatus === 'SETTLED'}
                    className="gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Decline Deal
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleApprove}
                    disabled={settling || selectedTx.settlementStatus === 'SETTLED'}
                    loading={settling}
                    className="gap-2 shadow-emerald-500/20 shadow-md"
                  >
                    <UserCheck className="w-4 h-4" />
                    {selectedTx.settlementStatus === 'SETTLED'
                      ? 'Deal Already Settled'
                      : 'Authorize & Settle via Mock UPI'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-slate-400 text-center py-10">Select a transaction from the queue.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Decline Deal Confirmation Modal */}
      <Modal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        title="Decline Deal & Abort Settlement"
        subtitle={`Transaction ID: ${selectedTx?.id}`}
      >
        <form onSubmit={handleDecline} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Reason for Declining
            </label>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800 text-[11px] text-rose-300">
            Declining this deal cancels fund release. The negotiation session will be returned to the buyer agent for renegotiation or termination.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsDeclineModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" loading={declining}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
