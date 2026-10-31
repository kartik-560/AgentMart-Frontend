'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { transactionService } from '../../services/transactionService';
import { useUI } from '../../context/UIContext';
import { formatINR, formatDateTime } from '../../utils/formatters';
import {
  History,
  CheckCircle2,
  FileText,
  Search,
  Download,
  Eye,
  QrCode,
  Copy,
  Receipt,
  Landmark,
} from 'lucide-react';

export default function TransactionHistoryPage() {
  const { showToast } = useUI();
  const [transactions, setTransactions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Receipt Modal State
  const [receiptTx, setReceiptTx] = useState(null);

  useEffect(() => {
    let mounted = true;
    transactionService
      .getAll()
      .then((res) => {
        if (mounted && res?.data) {
          setTransactions(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesStatus = selectedStatus === 'ALL' || tx.settlementStatus === selectedStatus;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      tx.id.toLowerCase().includes(search) ||
      (tx.sellerBusiness?.name || '').toLowerCase().includes(search) ||
      (tx.productName || '').toLowerCase().includes(search) ||
      (tx.mockUpiReference || '').toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = 'Transaction ID,Supplier Partner,Product,Amount (INR),Status,Mock UPI Ref,Approved By,Timestamp\n';
    const rows = filteredTransactions
      .map((tx) =>
        [
          tx.id,
          `"${tx.sellerBusiness?.name || 'Prism Wholesale'}"`,
          `"${tx.productName || 'Wi-Fi 6 Router'}"`,
          tx.settlementAmount,
          tx.settlementStatus,
          tx.mockUpiReference || '-',
          `"${tx.approvedBy || 'Kartik'}"`,
          `"${tx.settledAt || tx.createdAt}"`,
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agentmart-transactions-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported transaction history to CSV!', 'success');
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
            <History className="w-6 h-6 text-indigo-400 shrink-0" /> Transaction Settlement History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical log of authorized settlements, Mock UPI payment confirmations, and human signatories.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'SETTLED', 'PENDING_APPROVAL', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white font-semibold shadow-indigo-500/20 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search TX ID, supplier, or UPI ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Data Table Card */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">Transaction ID</th>
                <th className="py-3 px-4 font-semibold">Supplier Partner</th>
                <th className="py-3 px-4 font-semibold">Item & SKU</th>
                <th className="py-3 px-4 font-semibold">Settlement Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Mock UPI Ref</th>
                <th className="py-3 px-4 font-semibold">Signatory</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 text-indigo-400 text-[11px] font-bold">
                      {tx.id}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-100 font-medium">
                      {tx.sellerBusiness?.name || 'Prism Wholesale Direct'}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300 text-[11px] max-w-[160px] truncate">
                      {tx.productName || 'Enterprise Wi-Fi 6 Mesh Router'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      {formatINR(tx.settlementAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={tx.settlementStatus} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                      {tx.mockUpiReference || (tx.settlementStatus === 'SETTLED' ? 'UPI-DEMO-998822' : '-')}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-400 text-[11px]">
                      {tx.approvedBy ? tx.approvedBy.split(' - ')[0] : 'Pending'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-sans text-[11px] whitespace-nowrap">
                      {formatDateTime(tx.settledAt || tx.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setReceiptTx(tx)}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Receipt Modal */}
      <Modal
        isOpen={Boolean(receiptTx)}
        onClose={() => setReceiptTx(null)}
        title="Escrow Settlement Receipt"
        subtitle={`Transaction: ${receiptTx?.id}`}
      >
        {receiptTx && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <span className="text-slate-500">Settlement Amount:</span>
                <span className="font-mono text-xl font-bold text-emerald-400">
                  {formatINR(receiptTx.settlementAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Supplier Enterprise:</span>
                <span className="text-slate-100 font-medium">
                  {receiptTx.sellerBusiness?.name || 'Prism Wholesale Direct'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Purchasing Enterprise:</span>
                <span className="text-slate-200">Apex Retail Enterprises</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Mock UPI Reference:</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {receiptTx.mockUpiReference || 'UPI-SETTLED-DEMO'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Destination VPA:</span>
                <span className="font-mono text-slate-300">
                  {receiptTx.mockUpiVpa || 'prismwholesale@icici'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Human Approver:</span>
                <span className="text-slate-200">{receiptTx.approvedBy || 'Kartik - Director'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-400 font-mono">
                  {formatDateTime(receiptTx.settledAt || receiptTx.createdAt)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono">
              <span className="text-slate-500 block mb-1">Cryptographic Tamper-Proof Hash:</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-slate-300 truncate text-[10px]">
                  {receiptTx.tamperProofHash || 'sha256-4b2a8f89c09d8e7b1a2f4c6e9d0e1f3a5b7c8d9e0f'}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      receiptTx.tamperProofHash || 'sha256-4b2a8f89c09d8e7b1a2f4c6e9d0e1f3a5b7c8d9e0f',
                      'Audit Hash'
                    )
                  }
                  className="text-slate-500 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setReceiptTx(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
