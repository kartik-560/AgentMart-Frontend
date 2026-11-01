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
  Search,
  Download,
  Eye,
  Copy,
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
          `"${tx.approvedBy || 'Director'}"`,
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
    <div className="space-y-6 text-[#172554]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172554] flex items-center gap-2">
            <History className="w-6 h-6 text-[#1d4ed8] shrink-0" /> Transaction Settlement History
          </h1>
          <p className="text-xs sm:text-sm text-[#1e3a8a] mt-1">
            Historical log of authorized settlements, Mock UPI payment confirmations, and human signatories.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs font-bold">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#1e3a8a]/20 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'SETTLED', 'PENDING_APPROVAL', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-[#1d4ed8] text-[#faf7ee] shadow-xs'
                  : 'bg-[#f4efe3] text-[#1e3a8a] hover:bg-[#eadecc] hover:text-[#172554] border border-[#1e3a8a]/20'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#1e3a8a] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search TX ID, supplier, or UPI ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-xl text-xs text-[#172554] placeholder-[#1e3a8a]/50 focus:outline-none focus:border-[#1d4ed8]"
          />
        </div>
      </div>

      {/* Data Table Card */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e3a8a]/20 bg-[#f4efe3] text-[#172554]">
                <th className="py-3 px-4 font-bold">Transaction ID</th>
                <th className="py-3 px-4 font-bold">Supplier Partner</th>
                <th className="py-3 px-4 font-bold">Item & SKU</th>
                <th className="py-3 px-4 font-bold">Settlement Amount</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Mock UPI Ref</th>
                <th className="py-3 px-4 font-bold">Signatory</th>
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a8a]/15 font-mono text-[#172554]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#1e3a8a] font-sans">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#faf7ee] transition-colors">
                    <td className="py-3.5 px-4 text-[#1d4ed8] text-[11px] font-bold">
                      {tx.id}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-[#172554] font-bold">
                      {tx.sellerBusiness?.name || 'Prism Wholesale Direct'}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-[#172554] text-[11px] max-w-[160px] truncate">
                      {tx.productName || 'Enterprise Wi-Fi 6 Mesh Router'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1d4ed8]">
                      {formatINR(tx.settlementAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={tx.settlementStatus} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-[#172554] text-[11px]">
                      {tx.mockUpiReference || (tx.settlementStatus === 'SETTLED' ? 'UPI-DEMO-998822' : '-')}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-[#1e3a8a] text-[11px]">
                      {tx.approvedBy ? tx.approvedBy.split(' - ')[0] : 'Pending'}
                    </td>
                    <td className="py-3.5 px-4 text-[#1e3a8a] font-sans text-[11px] whitespace-nowrap">
                      {formatDateTime(tx.settledAt || tx.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setReceiptTx(tx)}
                        className="text-[#1d4ed8] hover:text-[#1e3a8a]"
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
          <div className="space-y-4 text-xs text-[#172554]">
            <div className="p-4 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-[#1e3a8a]/15">
                <span className="text-[#1e3a8a]">Settlement Amount:</span>
                <span className="font-mono text-xl font-bold text-[#1d4ed8]">
                  {formatINR(receiptTx.settlementAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#1e3a8a]">Supplier Enterprise:</span>
                <span className="text-[#172554] font-bold">
                  {receiptTx.sellerBusiness?.name || 'Prism Wholesale Direct'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#1e3a8a]">Purchasing Enterprise:</span>
                <span className="text-[#172554] font-medium">Apex Retail Enterprises</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#1e3a8a]">Mock UPI Reference:</span>
                <span className="font-mono text-[#1d4ed8] font-bold">
                  {receiptTx.mockUpiReference || 'UPI-SETTLED-DEMO'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#1e3a8a]">Destination VPA:</span>
                <span className="font-mono text-[#172554]">
                  {receiptTx.mockUpiVpa || 'prismwholesale@icici'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#1e3a8a]">Human Approver:</span>
                <span className="text-[#172554] font-semibold">{receiptTx.approvedBy || 'Director'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#1e3a8a]">Timestamp:</span>
                <span className="text-[#1e3a8a] font-mono">
                  {formatDateTime(receiptTx.settledAt || receiptTx.createdAt)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[11px] font-mono">
              <span className="text-[#1e3a8a] block mb-1 font-bold">Cryptographic Tamper-Proof Hash:</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-[#1d4ed8] truncate text-[10px] font-bold">
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
                  className="text-[#1e3a8a] hover:text-[#172554]"
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
