'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { transactionService } from '../../services/transactionService';
import { useUI } from '../../context/UIContext';
import { formatINR } from '../../utils/formatters';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  AlertTriangle,
  Clock,
  Package,
  Layers,
  FileCheck,
  Info,
  Calendar,
  ExternalLink,
} from 'lucide-react';

function QueueSkeleton() {
  return (
    <div className="space-y-2.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 animate-pulse space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-3.5 bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-800 rounded-full w-16" />
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <div className="h-5 bg-slate-800 rounded w-1/2" />
            <div className="h-3 bg-slate-800 rounded w-16" />
          </div>
          <div className="flex justify-between text-[10px] pt-1">
            <div className="h-2.5 bg-slate-800/70 rounded w-24" />
            <div className="h-2.5 bg-slate-800/70 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <Card
      title="Deal Verification & Settlement Authorization"
      subtitle="Fetching cryptographically validated transaction details..."
    >
      <div className="space-y-4 text-xs animate-pulse">
        {/* Commercial Summary Box Skeleton */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-900">
            <div className="h-3 bg-slate-800 rounded w-28" />
            <div className="h-4 bg-slate-800 rounded w-56" />
          </div>

          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-800 rounded w-24" />
            <div className="h-3 bg-slate-800 rounded w-44" />
          </div>

          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-800 rounded w-24" />
            <div className="h-3 bg-slate-800 rounded w-44" />
          </div>

          <div className="flex justify-between items-center py-2.5 bg-slate-900/40 px-3 rounded-lg border border-slate-800">
            <div className="h-3.5 bg-slate-800 rounded w-36" />
            <div className="h-6 bg-emerald-950/60 rounded w-32 border border-emerald-900/30" />
          </div>

          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-800 rounded w-32" />
            <div className="h-3 bg-slate-800 rounded w-40" />
          </div>

          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-800 rounded w-28" />
            <div className="h-3 bg-slate-800 rounded w-32" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-900">
            <div className="h-3 bg-slate-800 rounded w-40" />
            <div className="h-4 bg-slate-800 rounded w-60" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900 text-[10px]">
            <div className="h-2.5 bg-slate-800/60 rounded" />
            <div className="h-2.5 bg-slate-800/60 rounded" />
            <div className="h-2.5 bg-slate-800/60 rounded" />
          </div>
        </div>

        {/* Form Inputs Skeleton */}
        <div className="space-y-3 pt-2">
          <div>
            <div className="h-2.5 bg-slate-800 rounded w-40 mb-1.5" />
            <div className="h-9 bg-slate-950 border border-slate-800 rounded-lg w-full" />
          </div>
          <div>
            <div className="h-2.5 bg-slate-800 rounded w-36 mb-1.5" />
            <div className="h-9 bg-slate-950 border border-slate-800 rounded-lg w-full" />
          </div>
          <div>
            <div className="h-2.5 bg-slate-800 rounded w-44 mb-1.5" />
            <div className="h-16 bg-slate-950 border border-slate-800 rounded-lg w-full" />
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
          <div className="h-9 bg-slate-850 rounded-lg w-28" />
          <div className="h-9 bg-emerald-950/60 border border-emerald-900/40 rounded-lg w-48" />
        </div>
      </div>
    </Card>
  );
}

function TransactionApprovalContent() {
  const searchParams = useSearchParams();
  const paramId = searchParams.get('id');
  const paramNegId = searchParams.get('negotiationId');

  const { showToast } = useUI();
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null); // null | 'INVALID_TRANSACTION_ID' | 'FETCH_ERROR'
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [approverName, setApproverName] = useState('Kartik - Senior Procurement Director');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [payerVpa, setPayerVpa] = useState('apexenterprise@hdfcbank');
  const [settling, setSettling] = useState(false);
  const [settledResult, setSettledResult] = useState(null);

  // Decline Modal State
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('Supplier terms did not meet minimum margin thresholds.');
  const [declining, setDeclining] = useState(false);

  // Fetch Transaction Data from Database
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setErrorState(null);
      setSelectedTx(null); // Never show stale or unrelated data during load

      try {
        // Mode 1: Exact Transaction ID provided in URL (?id=...)
        if (paramId) {
          try {
            const singleRes = await transactionService.getById(paramId);
            if (mounted && singleRes?.data) {
              const tx = singleRes.data;
              setSelectedTx(tx);

              // Also load list for sidebar queue
              const listRes = await transactionService.getAll();
              if (mounted) {
                const list = Array.isArray(listRes?.data) ? listRes.data : [];
                if (!list.some((t) => t.id === tx.id)) {
                  setTransactions([tx, ...list]);
                } else {
                  setTransactions(list);
                }
                setLoading(false);
              }
              return;
            }
          } catch (singleErr) {
            console.error('Error fetching transaction by ID:', singleErr);
            if (mounted) {
              setErrorState('INVALID_TRANSACTION_ID');
              setLoading(false);
            }
            return;
          }
        }

        // Mode 2: Negotiation ID provided in URL (?negotiationId=...)
        if (paramNegId) {
          try {
            const listRes = await transactionService.getAll();
            const list = Array.isArray(listRes?.data) ? listRes.data : [];
            if (mounted) setTransactions(list);

            const match =
              list.find((t) => t.negotiationId === paramNegId && t.settlementStatus === 'PENDING_APPROVAL') ||
              list.find((t) => t.negotiationId === paramNegId);

            if (match) {
              if (mounted) {
                setSelectedTx(match);
                setLoading(false);
              }
              return;
            }

            // Create pending transaction for winning offer if not existing
            const createRes = await transactionService.create({ negotiationId: paramNegId });
            if (mounted && createRes?.data) {
              const newTx = createRes.data;
              setSelectedTx(newTx);
              setTransactions((prev) => [newTx, ...prev.filter((t) => t.id !== newTx.id)]);
              setLoading(false);
              return;
            }
          } catch (negErr) {
            console.error('Error establishing transaction for negotiation:', negErr);
            if (mounted) {
              setErrorState('FETCH_ERROR');
              setLoading(false);
            }
            return;
          }
        }

        // Mode 3: Direct Navigation to /approvals without query params
        const listRes = await transactionService.getAll();
        if (mounted) {
          const list = Array.isArray(listRes?.data) ? listRes.data : [];
          setTransactions(list);

          if (list.length > 0) {
            // Prioritize deal that is pending approval
            const pending = list.find((t) => t.settlementStatus === 'PENDING_APPROVAL');
            setSelectedTx(pending || list[0]);
          } else {
            setSelectedTx(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load transaction data:', err);
        if (mounted) {
          setErrorState('FETCH_ERROR');
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [paramId, paramNegId]);

  // Update dynamic audit default note & settled receipt whenever selectedTx changes
  useEffect(() => {
    if (selectedTx) {
      const seller = selectedTx.sellerBusiness?.name || selectedTx.offer?.sellerBusiness?.name || 'supplier';
      const amount = formatINR(selectedTx.settlementAmount);
      const hours = selectedTx.offer?.deliveryHours || selectedTx.negotiation?.maxDeliveryHours || 48;
      setApprovalNotes(
        `Authorized procurement with ${seller}. Validated ${amount} within budget and ${hours}h SLA.`
      );

      if (selectedTx.settlementStatus === 'SETTLED') {
        setSettledResult({
          mockUpiReference: selectedTx.mockUpiReference,
          tamperProofHash: selectedTx.tamperProofHash,
          approvedBy: selectedTx.approverSignature || approverName,
          settledAt: selectedTx.settledAt,
        });
      } else {
        setSettledResult(null);
      }
    }
  }, [selectedTx?.id]);

  const handleApprove = async () => {
    if (!selectedTx || selectedTx.settlementStatus === 'SETTLED') return;
    setSettling(true);

    try {
      const res = await transactionService.approve(selectedTx.id, {
        approvedBy: approverName,
        approvalNotes,
        paymentMethod: selectedTx.paymentMethod || 'MOCK_UPI',
        payerVpa,
      });

      if (res?.data) {
        const updated = res.data;
        setSettledResult({
          mockUpiReference: updated.mockUpiReference,
          tamperProofHash: updated.tamperProofHash,
          approvedBy: updated.approverSignature || approverName,
          settledAt: updated.settledAt,
        });
        setTransactions((prev) =>
          prev.map((t) => (t.id === selectedTx.id ? { ...t, ...updated, settlementStatus: 'SETTLED' } : t))
        );
        setSelectedTx((prev) => ({ ...prev, ...updated, settlementStatus: 'SETTLED' }));
        showToast(`Transaction ${selectedTx.id.substring(0, 8)}... approved & settled via Mock UPI!`, 'success');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to approve transaction', 'error');
    } finally {
      setSettling(false);
    }
  };

  const handleDecline = async (e) => {
    e.preventDefault();
    if (!selectedTx || selectedTx.settlementStatus === 'SETTLED') return;
    setDeclining(true);

    try {
      const res = await transactionService.reject(selectedTx.id, {
        rejectedBy: approverName,
        rejectionReason: declineReason,
      });

      if (res?.data) {
        const updated = res.data;
        setTransactions((prev) =>
          prev.map((t) => (t.id === selectedTx.id ? { ...t, ...updated, settlementStatus: 'REJECTED' } : t))
        );
        setSelectedTx((prev) => ({ ...prev, ...updated, settlementStatus: 'REJECTED' }));
        showToast(`Transaction ${selectedTx.id.substring(0, 8)}... declined.`, 'error');
        setIsDeclineModalOpen(false);
      }
    } catch (err) {
      showToast(err?.message || 'Failed to decline transaction', 'error');
    } finally {
      setDeclining(false);
    }
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
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
            Autonomous agents cannot disburse enterprise funds without explicit human authorization and cryptographic sign-off.
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

      {/* Rejected Status Receipt Banner */}
      {selectedTx?.settlementStatus === 'REJECTED' && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-xs flex items-center justify-between gap-3 text-rose-300">
          <div className="flex items-center gap-2 font-medium">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              This transaction has been declined by a human operator: {selectedTx.rejectionReason || 'No reason specified'}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono text-[10px] font-bold">
            STATUS: REJECTED
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settlement Queue List (4-5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Settlement Queue ({transactions.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">PostgreSQL</span>
          </div>

          {loading ? (
            <QueueSkeleton />
          ) : transactions.length === 0 ? (
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">No transactions currently in queue.</p>
              <Link href="/marketplace" className="inline-block pt-1">
                <Button size="xs" variant="primary">Launch RFQ</Button>
              </Link>
            </div>
          ) : (
            <>
              {transactions.every((t) => t.settlementStatus !== 'PENDING_APPROVAL') && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>All transactions in queue are settled or resolved</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Initiate a new procurement from the Marketplace to negotiate and approve a new deal.
                  </p>
                  <Link href="/marketplace" className="inline-block">
                    <Button size="xs" variant="primary" className="text-xs">
                      New Procurement RFQ
                    </Button>
                  </Link>
                </div>
              )}

              <div className="space-y-2.5">
                {transactions.map((tx) => {
                  const isSelected = selectedTx?.id === tx.id;
                  const sellerName = tx.sellerBusiness?.name || tx.offer?.sellerBusiness?.name || 'Seller Supplier';
                  const prodName = tx.offer?.product?.name || tx.negotiation?.targetProduct?.name || 'Product';
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-950/20'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {sellerName}
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

                      <div className="mt-2 text-[10px] text-slate-500 font-mono flex justify-between items-center">
                        <span className="truncate max-w-[130px]">{prodName}</span>
                        <span>ID: {tx.id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Verification & Authorization Sign-off (7-8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8">
          {loading ? (
            <DetailSkeleton />
          ) : errorState === 'INVALID_TRANSACTION_ID' ? (
            <Card>
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-100">Transaction Not Found in Database</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    No database transaction matches ID <span className="font-mono text-indigo-400">{paramId}</span>. The deal may not have been persisted yet or the session was refreshed.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <Link href="/marketplace">
                    <Button size="sm" variant="primary">Browse Marketplace</Button>
                  </Link>
                  <Link href="/approvals">
                    <Button size="sm" variant="secondary">View All Approvals</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : errorState === 'FETCH_ERROR' ? (
            <Card>
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-100">Failed to Retrieve Transaction Record</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    The platform could not load transaction details from the PostgreSQL database. Check backend connectivity.
                  </p>
                </div>
                <div className="pt-2">
                  <Button size="sm" variant="primary" onClick={() => window.location.reload()}>
                    Retry Connection
                  </Button>
                </div>
              </div>
            </Card>
          ) : selectedTx ? (
            <Card
              title="Deal Verification & Settlement Authorization"
              subtitle="Cryptographic authorization requirement for autonomous transactions"
            >
              <div className="space-y-4 text-xs">
                {/* Commercial Summary Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  {/* Target Product */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <span className="text-slate-400">Target Product:</span>
                    <span className="text-slate-100 font-semibold text-right">
                      {selectedTx.offer?.quantity || selectedTx.negotiation?.targetQuantity || 1}x{' '}
                      {selectedTx.offer?.product?.name ||
                        selectedTx.negotiation?.targetProduct?.name ||
                        selectedTx.productName ||
                        'Enterprise Hardware SKU'}
                    </span>
                  </div>

                  {/* SKU & Category */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">SKU & Category:</span>
                    <span className="text-slate-300 font-mono">
                      {selectedTx.offer?.product?.sku || selectedTx.negotiation?.targetProduct?.sku || 'SKU-STANDARD'} (
                      {selectedTx.offer?.product?.category || selectedTx.negotiation?.targetProduct?.category || 'Hardware'})
                    </span>
                  </div>

                  {/* Buyer Enterprise */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Buyer Enterprise:</span>
                    <span className="text-slate-200">
                      {selectedTx.buyerBusiness?.name || selectedTx.negotiation?.buyerBusiness?.name || 'Apex Retail Enterprises'}
                      <span className="text-slate-500 text-[10px] ml-1.5 font-mono">
                        ({selectedTx.buyerBusiness?.registrationNumber || 'IN-APX-2024-8891'})
                      </span>
                    </span>
                  </div>

                  {/* Seller Supplier */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Seller Supplier:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedTx.sellerBusiness?.name || selectedTx.offer?.sellerBusiness?.name || 'Prism Wholesale Direct'}
                      <span className="text-slate-500 text-[10px] ml-1.5 font-mono">
                        ({selectedTx.sellerBusiness?.registrationNumber || 'IN-SUP-2024-001'})
                      </span>
                    </span>
                  </div>

                  {/* Total Settlement Amount */}
                  <div className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                    <div>
                      <span className="text-emerald-300 font-semibold block text-xs">Total Negotiated Settlement:</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Unit Rate: {formatINR(selectedTx.offer?.unitPrice || (selectedTx.settlementAmount / (selectedTx.offer?.quantity || 12)))}
                      </span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-lg sm:text-xl">
                      {formatINR(selectedTx.settlementAmount)}
                    </span>
                  </div>

                  {/* Lead Time & SLA */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Fulfillment SLA Lead Time:</span>
                    <span className="font-mono text-slate-200">
                      {selectedTx.offer?.deliveryHours || selectedTx.negotiation?.maxDeliveryHours || 40} Hours Guaranteed
                      <span className="text-emerald-400 ml-1.5 text-[10px] font-bold">✓ Passes SLA</span>
                    </span>
                  </div>

                  {/* Projected Resale Margin & Quality */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Commercial Margin & QA:</span>
                    <span className="font-mono text-slate-200">
                      {selectedTx.offer?.resaleMarginProjected ? `${selectedTx.offer.resaleMarginProjected}%` : '24.5%'} Margin
                      <span className="text-slate-400 ml-1.5 font-sans">• {selectedTx.offer?.qualityGrade || 'Enterprise Grade'}</span>
                    </span>
                  </div>

                  {/* Destination Supplier VPA */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Destination Supplier VPA:</span>
                    <span className="font-mono text-slate-300">
                      {selectedTx.mockUpiVpa || 'supplier@icici'}
                    </span>
                  </div>

                  {/* Deterministic Financial Check */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                    <span className="text-slate-400">Deterministic Financial Check:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {(() => {
                        const budget = Number(selectedTx.negotiation?.maxBudget || 0);
                        const total = Number(selectedTx.settlementAmount || 0);
                        if (budget > 0) {
                          const diff = budget - total;
                          if (diff >= 0) {
                            return `✓ PASS (${formatINR(diff)} Under ${formatINR(budget)} Budget Cap)`;
                          }
                          return `⚠ OVER BUDGET (${formatINR(Math.abs(diff))} Above Limit)`;
                        }
                        return '✓ PASS (Authorized Enterprise Procurement)';
                      })()}
                    </span>
                  </div>

                  {/* Immutable Identifiers */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                    <div className="truncate">
                      <span>Tx: </span>
                      <span className="text-slate-400 cursor-pointer hover:text-white" onClick={() => copyToClipboard(selectedTx.id, 'Transaction ID')}>
                        {selectedTx.id.substring(0, 10)}...
                      </span>
                    </div>
                    <div className="truncate">
                      <span>Neg: </span>
                      <span className="text-slate-400 cursor-pointer hover:text-white" onClick={() => copyToClipboard(selectedTx.negotiationId, 'Negotiation ID')}>
                        {selectedTx.negotiationId.substring(0, 10)}...
                      </span>
                    </div>
                    <div className="truncate text-right">
                      <span>Offer: </span>
                      <span className="text-slate-400 cursor-pointer hover:text-white" onClick={() => copyToClipboard(selectedTx.offerId, 'Offer ID')}>
                        {selectedTx.offerId ? selectedTx.offerId.substring(0, 10) + '...' : 'N/A'}
                      </span>
                    </div>
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
                      disabled={selectedTx.settlementStatus === 'SETTLED'}
                      onChange={(e) => setApproverName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-medium disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Payer Escrow VPA (Mock UPI)
                    </label>
                    <input
                      type="text"
                      value={payerVpa}
                      disabled={selectedTx.settlementStatus === 'SETTLED'}
                      onChange={(e) => setPayerVpa(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-indigo-400 font-mono text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Human Approval Audit Reason
                    </label>
                    <textarea
                      rows={2}
                      value={approvalNotes}
                      disabled={selectedTx.settlementStatus === 'SETTLED'}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsDeclineModalOpen(true)}
                    disabled={selectedTx.settlementStatus === 'SETTLED' || selectedTx.settlementStatus === 'REJECTED' || settling || declining}
                    className="gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    {selectedTx.settlementStatus === 'REJECTED' ? 'Deal Rejected' : 'Decline Deal'}
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleApprove}
                    disabled={settling || selectedTx.settlementStatus === 'SETTLED' || selectedTx.settlementStatus === 'REJECTED'}
                    loading={settling}
                    className="gap-2 shadow-emerald-500/20 shadow-md"
                  >
                    <UserCheck className="w-4 h-4" />
                    {selectedTx.settlementStatus === 'SETTLED'
                      ? '✓ Deal Already Settled'
                      : selectedTx.settlementStatus === 'REJECTED'
                      ? 'Deal Rejected'
                      : 'Authorize & Settle via Mock UPI'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-100">No Transactions in Approval Queue</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    All commercial bids have been settled or no negotiations have completed yet.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/marketplace">
                    <Button size="sm" variant="primary">Launch Procurement RFQ</Button>
                  </Link>
                </div>
              </div>
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
            Declining this deal cancels fund release. The negotiation will be marked as REJECTED in the database and audit logs will record the human rejection reason.
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

export default function ApprovalsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 font-mono text-sm">
          Loading approval portal...
        </div>
      }
    >
      <TransactionApprovalContent />
    </React.Suspense>
  );
}
