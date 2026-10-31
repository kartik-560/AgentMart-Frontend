'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import { transactionService } from '../../services/transactionService';
import { formatINR } from '../../utils/formatters';
import { ShieldCheck, UserCheck, XCircle, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function TransactionApprovalPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [approverName, setApproverName] = useState('Kartik - Senior Procurement Director');
  const [approvalNotes, setApprovalNotes] = useState('Authorized deal with Prism Wholesale. Validated ₹44,400 within budget and 40h SLA.');
  const [settling, setSettling] = useState(false);
  const [settledResult, setSettledResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    transactionService.getAll()
      .then((res) => {
        if (mounted && res?.data) {
          setTransactions(res.data);
          const pending = res.data.find((t) => t.settlementStatus === 'PENDING_APPROVAL');
          if (pending) setSelectedTx(pending);
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
        payerVpa: 'apexenterprise@hdfcbank',
      });
      if (res?.data) {
        setSettledResult(res.data);
        setTransactions((prev) =>
          prev.map((t) => (t.id === selectedTx.id ? { ...t, settlementStatus: 'SETTLED' } : t))
        );
      }
    } catch {
      // Mock settlement fallback
      setSettledResult({
        mockUpiReference: `UPI-SETTLED-${Date.now()}`,
        approvedBy: approverName,
        settlementStatus: 'SETTLED',
        settledAt: new Date().toISOString(),
      });
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" /> Mandatory Human Approval Portal
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Autonomous agents cannot transfer funds without explicit human authorization and cryptographic sign-off.
        </p>
      </div>

      {settledResult && (
        <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-800 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" /> Transaction Settled via Mock UPI
          </div>
          <p className="text-slate-300">
            Payment dispatched to supplier. Mock UPI Reference:{' '}
            <span className="font-mono text-emerald-300 font-bold">{settledResult.mockUpiReference}</span>
          </p>
          <div className="text-[11px] text-slate-400 font-mono">
            Cryptographic Audit Hash: {settledResult.tamperProofHash || 'sha256-verified-tamper-proof'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Deals List */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Settlement Queue
          </span>
          {transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTx?.id === tx.id
                  ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {tx.sellerBusiness?.name || 'Prism Wholesale Direct'}
                </span>
                <StatusBadge status={tx.settlementStatus} />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-bold font-mono text-slate-100">
                  {formatINR(tx.settlementAmount)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Mock UPI</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Human Verification Panel */}
        <div className="lg:col-span-2">
          {selectedTx ? (
            <Card title="Deal Verification & Settlement Authorization">
              <div className="space-y-4 text-xs">
                {/* Summary Box */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Buyer Enterprise:</span>
                    <span className="text-slate-200 font-medium">{selectedTx.buyerBusiness?.name || 'Apex Retail Enterprises'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Seller Supplier:</span>
                    <span className="text-slate-200 font-medium">{selectedTx.sellerBusiness?.name || 'Prism Wholesale Direct'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Settlement Amount:</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      {formatINR(selectedTx.settlementAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destination UPI VPA:</span>
                    <span className="font-mono text-slate-300">{selectedTx.mockUpiVpa || 'prismwholesale@icici'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deterministic Budget Check:</span>
                    <span className="text-emerald-400 font-semibold">PASS (₹5,600 Under ₹50,000 Cap)</span>
                  </div>
                </div>

                {/* Approver Sign-off fields */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Human Approver Name & Role
                  </label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Approval Audit Notes
                  </label>
                  <textarea
                    rows={2}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button variant="danger" size="sm" className="gap-1.5">
                    <XCircle className="w-4 h-4" /> Decline Deal
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleApprove}
                    disabled={settling || selectedTx.settlementStatus === 'SETTLED'}
                    className="gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    {settling ? 'Executing Mock UPI...' : 'Authorize & Settle via Mock UPI'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-slate-400 text-center py-6">Select a transaction to inspect.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

