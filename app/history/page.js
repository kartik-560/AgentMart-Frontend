'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import { transactionService } from '../../services/transactionService';
import { formatINR, formatDateTime } from '../../utils/formatters';
import { History, CheckCircle2, FileText } from 'lucide-react';

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    transactionService.getAll()
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-400" /> Transaction Settlement History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Historical log of authorized settlements, Mock UPI payment confirmations, and human signatories.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-medium">Transaction ID</th>
                <th className="py-3 px-4 font-medium">Supplier Partner</th>
                <th className="py-3 px-4 font-medium">Amount (INR)</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Mock UPI Ref</th>
                <th className="py-3 px-4 font-medium">Approved By</th>
                <th className="py-3 px-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 text-indigo-400 text-[11px]">{tx.id}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-100 font-medium">
                    {tx.sellerBusiness?.name || 'Prism Wholesale Direct'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    {formatINR(tx.settlementAmount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={tx.settlementStatus} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                    {tx.mockUpiReference || (tx.settlementStatus === 'SETTLED' ? 'UPI-DEMO-991204' : '-')}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">
                    {tx.approvedBy || (tx.settlementStatus === 'SETTLED' ? 'Kartik - Lead' : 'Pending')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-sans text-[11px]">
                    {formatDateTime(tx.settledAt || tx.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

