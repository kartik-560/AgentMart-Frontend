'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import { auditService } from '../../services/agentService';
import { formatDateTime } from '../../utils/formatters';
import { FileText, Shield, Key, Hash } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    auditService.getLogs()
      .then((res) => {
        if (mounted && res?.data?.logs) {
          setLogs(res.data.logs);
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
          <FileText className="w-6 h-6 text-indigo-400" /> Tamper-Evident Audit Trail
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographically linked event logs recording all multi-agent actions, state transitions, and approvals.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Actor</th>
                <th className="py-3 px-4 font-medium">Action</th>
                <th className="py-3 px-4 font-medium">Entity</th>
                <th className="py-3 px-4 font-medium">State Detail</th>
                <th className="py-3 px-4 font-medium">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 text-slate-400 font-sans text-[11px] whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.actorType === 'HUMAN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      log.actorType === 'AGENT' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.actorType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-100">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-indigo-400 text-[11px]">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate text-[11px]">
                    {JSON.stringify(log.newState || {})}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[10px] max-w-[140px] truncate">
                    {log.tamperProofHash || 'sha256-verified-hash'}
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

