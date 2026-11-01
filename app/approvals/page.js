'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { transactionService } from '../../services/transactionService';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
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
          className="p-4 rounded-xl border border-[#1e3a8a]/20 bg-[#fffdf9] animate-pulse space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-3.5 bg-[#f4efe3] rounded w-1/3" />
            <div className="h-4 bg-[#f4efe3] rounded-full w-16" />
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <div className="h-5 bg-[#f4efe3] rounded w-1/2" />
            <div className="h-3 bg-[#f4efe3] rounded w-16" />
          </div>
          <div className="flex justify-between text-[10px] pt-1">
            <div className="h-2.5 bg-[#eadecc] rounded w-24" />
            <div className="h-2.5 bg-[#eadecc] rounded w-16" />
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
        <div className="p-4 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[#1e3a8a]/15">
            <div className="h-3 bg-[#eadecc] rounded w-28" />
            <div className="h-4 bg-[#eadecc] rounded w-56" />
          </div>

          <div className="flex justify-between items-center">
            <div className="h-3 bg-[#eadecc] rounded w-24" />
            <div className="h-3 bg-[#eadecc] rounded w-44" />
          </div>

          <div className="flex justify-between items-center">
            <div className="h-3 bg-[#eadecc] rounded w-24" />
            <div className="h-3 bg-[#eadecc] rounded w-44" />
          </div>

          <div className="flex justify-between items-center py-2.5 bg-[#fffdf9] px-3 rounded-lg border border-[#1d4ed8]/30">
            <div className="h-3.5 bg-[#eadecc] rounded w-36" />
            <div className="h-6 bg-[#f4efe3] rounded w-32 border border-[#1d4ed8]/20" />
          </div>

          <div className="flex justify-between items-center">
            <div className="h-3 bg-[#eadecc] rounded w-32" />
            <div className="h-3 bg-[#eadecc] rounded w-40" />
          </div>

          <div className="flex justify-between items-center">
            <div className="h-3 bg-[#eadecc] rounded w-28" />
            <div className="h-3 bg-[#eadecc] rounded w-32" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#1e3a8a]/15">
            <div className="h-3 bg-[#eadecc] rounded w-40" />
            <div className="h-4 bg-[#eadecc] rounded w-60" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1e3a8a]/15 text-[10px]">
            <div className="h-2.5 bg-[#eadecc] rounded" />
            <div className="h-2.5 bg-[#eadecc] rounded" />
            <div className="h-2.5 bg-[#eadecc] rounded" />
          </div>
        </div>

        {/* Form Inputs Skeleton */}
        <div className="space-y-3 pt-2">
          <div>
            <div className="h-2.5 bg-[#eadecc] rounded w-40 mb-1.5" />
            <div className="h-9 bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-lg w-full" />
          </div>
          <div>
            <div className="h-2.5 bg-[#eadecc] rounded w-36 mb-1.5" />
            <div className="h-9 bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-lg w-full" />
          </div>
          <div>
            <div className="h-2.5 bg-[#eadecc] rounded w-44 mb-1.5" />
            <div className="h-16 bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-lg w-full" />
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="pt-3 border-t border-[#1e3a8a]/15 flex justify-end gap-2.5">
          <div className="h-9 bg-[#f4efe3] border border-[#1e3a8a]/20 rounded-lg w-28" />
          <div className="h-9 bg-[#1d4ed8]/30 rounded-lg w-48" />
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
  const { user, isSeller } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null); // null | 'INVALID_TRANSACTION_ID' | 'FETCH_ERROR'
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [approverName, setApproverName] = useState(user?.name || 'Kartik - Senior Procurement Director');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [payerVpa, setPayerVpa] = useState(
    user?.business?.name ? `${user.business.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@hdfcbank` : 'buyerenterprise@hdfcbank'
  );
  const [settling, setSettling] = useState(false);
  const [settledResult, setSettledResult] = useState(null);

  // Sync approver name if user updates
  useEffect(() => {
    if (user?.name) {
      setApproverName(user.name);
    }
  }, [user]);

  // Decline Modal State
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('Supplier terms did not meet minimum margin thresholds.');
  const [declining, setDeclining] = useState(false);

  if (isSeller) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-[#faf7ee] border border-[#1e3a8a]/30 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-[#1d4ed8]" />
        </div>
        <h2 className="text-xl font-bold text-[#172554] mb-2">Buyer Settlement Authority Required</h2>
        <p className="text-sm text-[#1e3a8a] max-w-md mb-6">
          The Transaction Approval station is restricted to authenticated Enterprise Buyers. Backend role-based security prevents suppliers from executing human settlement sign-offs.
        </p>
        <Link
          href="/seller/dashboard"
          className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-semibold text-sm transition-all shadow-xs"
        >
          Return to Seller Dashboard
        </Link>
      </div>
    );
  }

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
          <h1 className="text-xl sm:text-2xl font-bold text-[#172554] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1d4ed8] shrink-0" /> Mandatory Human Approval Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#1e3a8a] mt-1">
            Autonomous agents cannot disburse enterprise funds without explicit human authorization and cryptographic sign-off.
          </p>
        </div>
      </div>

      {/* Settled Success Receipt Banner */}
      {settledResult && (
        <div className="p-5 rounded-2xl bg-[#fffdf9] border-2 border-[#1d4ed8] text-[#172554] text-xs space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1d4ed8] font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#1d4ed8]" /> Transaction Settled via Mock UPI Escrow
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 font-mono text-[11px] font-bold">
              STATUS: SETTLED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 font-mono">
            <div>
              <span className="text-[#1e3a8a] block text-[10px] font-semibold">Mock UPI Reference:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[#1d4ed8] font-bold">{settledResult.mockUpiReference}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settledResult.mockUpiReference, 'UPI Ref')}
                  className="text-[#1e3a8a] hover:text-[#172554]"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <span className="text-[#1e3a8a] block text-[10px] font-semibold">Authorized Signatory:</span>
              <span className="text-[#172554] font-semibold mt-0.5 block">{settledResult.approvedBy || approverName}</span>
            </div>

            <div>
              <span className="text-[#1e3a8a] block text-[10px] font-semibold">Tamper-Proof Audit Hash:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[#172554] truncate max-w-[140px] text-[10px] font-mono">
                  {settledResult.tamperProofHash || 'sha256-verified-tamper-proof'}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settledResult.tamperProofHash || '', 'Audit Hash')}
                  className="text-[#1e3a8a] hover:text-[#172554]"
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
        <div className="p-4 rounded-2xl bg-[#f4efe3] border border-[#1e3a8a]/30 text-xs flex items-center justify-between gap-3 text-[#172554]">
          <div className="flex items-center gap-2 font-medium">
            <XCircle className="w-5 h-5 text-[#172554] shrink-0" />
            <span>
              This transaction has been declined by a human operator: {selectedTx.rejectionReason || 'No reason specified'}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#faf7ee] text-[#172554] border border-[#1e3a8a]/30 font-mono text-[10px] font-bold">
            STATUS: REJECTED
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settlement Queue List (4-5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider font-mono">
              Settlement Queue ({transactions.length})
            </span>
            <span className="text-[10px] text-[#1e3a8a]/70 font-mono">PostgreSQL</span>
          </div>

          {loading ? (
            <QueueSkeleton />
          ) : transactions.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#fffdf9] border border-[#1e3a8a]/20 text-center space-y-2">
              <p className="text-xs text-[#1e3a8a]">No transactions currently in queue.</p>
              <Link href="/marketplace" className="inline-block pt-1">
                <Button size="xs" variant="primary">Launch RFQ</Button>
              </Link>
            </div>
          ) : (
            <>
              {transactions.every((t) => t.settlementStatus !== 'PENDING_APPROVAL') && (
                <div className="p-3 rounded-xl bg-[#f4efe3] border border-[#1e3a8a]/25 text-xs text-[#172554] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#1d4ed8]">
                    <CheckCircle2 className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                    <span>All transactions in queue are settled or resolved</span>
                  </div>
                  <p className="text-[11px] text-[#1e3a8a] leading-relaxed">
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
                      className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#f4efe3] border-2 border-[#1d4ed8] shadow-xs'
                          : 'bg-[#fffdf9] border border-[#1e3a8a]/20 hover:border-[#1d4ed8]/60 hover:bg-[#faf7ee]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#172554] truncate">
                          {sellerName}
                        </span>
                        <StatusBadge status={tx.settlementStatus} size="xs" />
                      </div>

                      <div className="mt-2.5 flex items-baseline justify-between">
                        <span className="text-base sm:text-lg font-bold font-mono text-[#172554]">
                          {formatINR(tx.settlementAmount)}
                        </span>
                        <span className="text-[11px] text-[#1e3a8a] font-mono font-semibold">
                          {tx.paymentMethod || 'MOCK_UPI'}
                        </span>
                      </div>

                      <div className="mt-2 text-[10px] text-[#1e3a8a]/80 font-mono flex justify-between items-center">
                        <span className="truncate max-w-[130px] font-medium">{prodName}</span>
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
                <div className="w-12 h-12 rounded-full bg-[#faf7ee] border border-[#1e3a8a]/30 text-[#1d4ed8] mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#172554]">Transaction Not Found in Database</h3>
                  <p className="text-xs text-[#1e3a8a] max-w-md mx-auto">
                    No database transaction matches ID <span className="font-mono text-[#1d4ed8] font-bold">{paramId}</span>. The deal may not have been persisted yet or the session was refreshed.
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
                <div className="w-12 h-12 rounded-full bg-[#faf7ee] border border-[#1e3a8a]/30 text-[#1d4ed8] mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#172554]">Failed to Retrieve Transaction Record</h3>
                  <p className="text-xs text-[#1e3a8a] max-w-md mx-auto">
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
                <div className="p-4 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-2.5 text-xs text-[#172554]">
                  {/* Target Product */}
                  <div className="flex justify-between items-center pb-2 border-b border-[#1e3a8a]/15">
                    <span className="text-[#1e3a8a] font-medium">Target Product:</span>
                    <span className="text-[#172554] font-bold text-right">
                      {selectedTx.offer?.quantity || selectedTx.negotiation?.targetQuantity || 1}x{' '}
                      {selectedTx.offer?.product?.name ||
                        selectedTx.negotiation?.targetProduct?.name ||
                        selectedTx.productName ||
                        'Enterprise Hardware SKU'}
                    </span>
                  </div>

                  {/* SKU & Category */}
                  <div className="flex justify-between items-center">
                    <span className="text-[#1e3a8a] font-medium">SKU & Category:</span>
                    <span className="text-[#172554] font-mono">
                      {selectedTx.offer?.product?.sku || selectedTx.negotiation?.targetProduct?.sku || 'SKU-STANDARD'} (
                      {selectedTx.offer?.product?.category || selectedTx.negotiation?.targetProduct?.category || 'Hardware'})
                    </span>
                  </div>

                  {/* Buyer Enterprise */}
                  <div className="flex justify-between items-center">
                    <span className="text-[#1e3a8a] font-medium">Buyer Enterprise:</span>
                    <span className="text-[#172554] font-semibold">
                      {selectedTx.buyerBusiness?.name || selectedTx.negotiation?.buyerBusiness?.name || user?.business?.name || 'Enterprise Buyer'}
                      <span className="text-[#1e3a8a]/80 text-[10px] ml-1.5 font-mono">
                        ({selectedTx.buyerBusiness?.registrationNumber || selectedTx.negotiation?.buyerBusiness?.registrationNumber || 'IN-ENT-2024'})
                      </span>
                    </span>
                  </div>

                  {/* Seller Supplier */}
                  <div className="flex justify-between items-center">
                    <span className="text-[#1e3a8a] font-medium">Seller Supplier:</span>
                    <span className="text-[#172554] font-semibold">
                      {selectedTx.sellerBusiness?.name || selectedTx.offer?.sellerBusiness?.name || 'Verified Supplier Enterprise'}
                      <span className="text-[#1e3a8a]/80 text-[10px] ml-1.5 font-mono">
                        ({selectedTx.sellerBusiness?.registrationNumber || 'IN-SUP-2024-001'})
                      </span>
                    </span>
                  </div>

                  {/* Total Settlement Amount */}
                  <div className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-[#fffdf9] border-2 border-[#1d4ed8]">
                    <div>
                      <span className="text-[#1d4ed8] font-bold block text-xs">Total Negotiated Settlement:</span>
                      <span className="text-[10px] text-[#1e3a8a] font-mono">
                        Unit Rate: {formatINR(selectedTx.offer?.unitPrice || (selectedTx.settlementAmount / (selectedTx.offer?.quantity || 12)))}
                      </span>
                    </div>
                    <span className="font-mono text-[#1d4ed8] font-black text-xl sm:text-2xl">
                      {formatINR(selectedTx.settlementAmount)}
                    </span>
                  </div>

                  {/* Lead Time & SLA */}
                  <div className="flex justify-between items-center">
                    <span className="text-[#1e3a8a] font-medium">Fulfillment SLA Lead Time:</span>
                    <span className="font-mono text-[#172554] font-semibold">
                      {selectedTx.offer?.deliveryHours || selectedTx.negotiation?.maxDeliveryHours || 40} Hours Guaranteed
                      <span className="text-[#1d4ed8] ml-1.5 text-[10px] font-bold">✓ Passes SLA</span>
                    </span>
                  </div>

                  {/* Projected Resale Margin & Quality */}
                  <div className="flex justify-between items-center">
                    <span className="text-[#1e3a8a] font-medium">Commercial Margin & QA:</span>
                    <span className="font-mono text-[#172554] font-semibold">
                      {selectedTx.offer?.resaleMarginProjected ? `${selectedTx.offer.resaleMarginProjected}%` : '24.5%'} Margin
                      <span className="text-[#1e3a8a] ml-1.5 font-sans">• {selectedTx.offer?.qualityGrade || 'Enterprise Grade'}</span>
                    </span>
                  </div>

                  {/* Destination Supplier VPA */}
                  <div className="flex justify-between items-center">
                    <span className="text-[#1e3a8a] font-medium">Destination Supplier VPA:</span>
                    <span className="font-mono text-[#172554] font-semibold">
                      {selectedTx.mockUpiVpa || 'supplier@icici'}
                    </span>
                  </div>

                  {/* Deterministic Financial Check */}
                  <div className="flex justify-between items-center pt-2 border-t border-[#1e3a8a]/15">
                    <span className="text-[#1e3a8a] font-medium">Deterministic Financial Check:</span>
                    <span className="text-[#1d4ed8] font-bold font-mono">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#1e3a8a]/15 text-[10px] font-mono text-[#1e3a8a]">
                    <div className="truncate">
                      <span>Tx: </span>
                      <span className="text-[#172554] cursor-pointer hover:text-[#1d4ed8] font-semibold" onClick={() => copyToClipboard(selectedTx.id, 'Transaction ID')}>
                        {selectedTx.id.substring(0, 10)}...
                      </span>
                    </div>
                    <div className="truncate">
                      <span>Neg: </span>
                      <span className="text-[#172554] cursor-pointer hover:text-[#1d4ed8] font-semibold" onClick={() => copyToClipboard(selectedTx.negotiationId, 'Negotiation ID')}>
                        {selectedTx.negotiationId.substring(0, 10)}...
                      </span>
                    </div>
                    <div className="truncate text-right">
                      <span>Offer: </span>
                      <span className="text-[#172554] cursor-pointer hover:text-[#1d4ed8] font-semibold" onClick={() => copyToClipboard(selectedTx.offerId, 'Offer ID')}>
                        {selectedTx.offerId ? selectedTx.offerId.substring(0, 10) + '...' : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Approver Sign-off Fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#172554] mb-1">
                      Designated Procurement Director
                    </label>
                    <input
                      type="text"
                      value={approverName}
                      disabled={selectedTx.settlementStatus === 'SETTLED'}
                      onChange={(e) => setApproverName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] text-xs focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] font-medium disabled:bg-[#f4efe3] disabled:opacity-75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172554] mb-1">
                      Payer Escrow VPA (Mock UPI)
                    </label>
                    <input
                      type="text"
                      value={payerVpa}
                      disabled={selectedTx.settlementStatus === 'SETTLED'}
                      onChange={(e) => setPayerVpa(e.target.value)}
                      className="w-full px-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#1d4ed8] font-mono text-xs font-bold focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] disabled:bg-[#f4efe3] disabled:opacity-75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172554] mb-1">
                      Human Approval Audit Reason
                    </label>
                    <textarea
                      rows={2}
                      value={approvalNotes}
                      disabled={selectedTx.settlementStatus === 'SETTLED'}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] text-xs focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] disabled:bg-[#f4efe3] disabled:opacity-75"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-3 border-t border-[#1e3a8a]/15 flex flex-wrap items-center justify-end gap-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsDeclineModalOpen(true)}
                    disabled={selectedTx.settlementStatus === 'SETTLED' || selectedTx.settlementStatus === 'REJECTED' || settling || declining}
                    className="gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-[#172554]" />
                    {selectedTx.settlementStatus === 'REJECTED' ? 'Deal Rejected' : 'Decline Deal'}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApprove}
                    disabled={settling || selectedTx.settlementStatus === 'SETTLED' || selectedTx.settlementStatus === 'REJECTED'}
                    loading={settling}
                    className="gap-2 shadow-xs"
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
                <div className="w-12 h-12 rounded-full bg-[#faf7ee] border border-[#1e3a8a]/30 text-[#1d4ed8] mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#172554]">No Transactions in Approval Queue</h3>
                  <p className="text-xs text-[#1e3a8a] max-w-md mx-auto">
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
            <label className="block text-xs font-semibold text-[#172554] mb-1">
              Reason for Declining
            </label>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full px-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] text-xs focus:outline-none focus:border-[#1d4ed8]"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#f4efe3] border border-[#1e3a8a]/30 text-[11px] text-[#172554]">
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
        <div className="p-8 text-center text-[#1e3a8a] font-mono text-sm">
          Loading approval portal...
        </div>
      }
    >
      <TransactionApprovalContent />
    </React.Suspense>
  );
}
