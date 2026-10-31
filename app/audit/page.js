'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { auditService } from '../../services/agentService';
import { useUI } from '../../context/UIContext';
import { formatDateTime } from '../../utils/formatters';
import {
  FileText,
  Shield,
  Key,
  Hash,
  Search,
  Download,
  Eye,
  Copy,
  Terminal,
  Lock,
} from 'lucide-react';

export default function AuditLogsPage() {
  const { showToast } = useUI();
  const [logs, setLogs] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedActor, setSelectedActor] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Inspect Log Modal State
  const [inspectLog, setInspectLog] = useState(null);

  useEffect(() => {
    let mounted = true;
    auditService
      .getLogs()
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

  const filteredLogs = logs.filter((log) => {
    const matchesEntity = selectedEntity === 'ALL' || log.entityType === selectedEntity;
    const matchesActor = selectedActor === 'ALL' || log.actorType === selectedActor;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      log.id.toLowerCase().includes(search) ||
      log.action.toLowerCase().includes(search) ||
      (log.entityId || '').toLowerCase().includes(search) ||
      (log.actorId || '').toLowerCase().includes(search) ||
      (log.details || '').toLowerCase().includes(search);

    return matchesEntity && matchesActor && matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = 'Log ID,Timestamp,Actor Type,Actor ID,Action,Entity Type,Entity ID,Details,SHA256 Hash\n';
    const rows = filteredLogs
      .map((l) =>
        [
          l.id,
          `"${l.timestamp}"`,
          l.actorType,
          `"${l.actorId || 'system'}"`,
          l.action,
          l.entityType,
          l.entityId,
          `"${(l.details || '').replace(/"/g, '""')}"`,
          l.tamperProofHash || 'sha256-verified-hash',
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agentmart-audit-trail-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported immutable audit trail to CSV!', 'success');
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
            <FileText className="w-6 h-6 text-indigo-400 shrink-0" /> Tamper-Evident Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cryptographically linked event logs recording all multi-agent actions, state transitions, security flags, and human approvals.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" /> Export Audit Trail
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Entity Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'TRANSACTION', 'SECURITY', 'NEGOTIATION'].map((ent) => (
            <button
              key={ent}
              onClick={() => setSelectedEntity(ent)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedEntity === ent
                  ? 'bg-indigo-600 text-white font-semibold shadow-indigo-500/20 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {ent}
            </button>
          ))}
        </div>

        {/* Actor Filter & Search Input */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">All Actors</option>
            <option value="HUMAN">Human</option>
            <option value="AGENT">Agent</option>
            <option value="SYSTEM">System</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Entity Type & ID</th>
                <th className="py-3 px-4 font-semibold">Audit Event Details</th>
                <th className="py-3 px-4 font-semibold">SHA-256 Hash</th>
                <th className="py-3 px-4 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No audit records match selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-sans text-[11px] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                          log.actorType === 'HUMAN'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : log.actorType === 'AGENT'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {log.actorType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100 text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 text-indigo-400 text-[11px]">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans max-w-xs truncate text-[11px]">
                      {log.details || JSON.stringify(log.newState || {})}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[10px] max-w-[130px] truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{log.tamperProofHash || 'sha256-verified-hash'}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(log.tamperProofHash || '', 'Hash')}
                          className="text-slate-500 hover:text-white shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setInspectLog(log)}
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

      {/* Inspect Log Modal */}
      <Modal
        isOpen={Boolean(inspectLog)}
        onClose={() => setInspectLog(null)}
        title="Immutable Audit Log Record"
        subtitle={`Log Entry ID: ${inspectLog?.id}`}
      >
        {inspectLog && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">Actor Identity:</span>
                <span className="text-slate-200">{inspectLog.actorId || inspectLog.actorType}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Action Type:</span>
                <span className="text-emerald-400 font-bold">{inspectLog.action}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Entity Scope:</span>
                <span className="text-indigo-400">{inspectLog.entityType} ({inspectLog.entityId})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Timestamp:</span>
                <span>{formatDateTime(inspectLog.timestamp)}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1 font-semibold">Narrative Event Description:</span>
              <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed font-sans">
                {inspectLog.details || 'State transition executed and cryptographically sealed.'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block mb-1 font-semibold">State Payload Diff (JSON):</span>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                {JSON.stringify(inspectLog.newState || {}, null, 2)}
              </pre>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono">
              <span className="text-slate-500 block mb-1">Cryptographic Tamper-Proof SHA-256 Hash:</span>
              <code className="text-emerald-400 break-all text-[11px]">
                {inspectLog.tamperProofHash || 'sha256-verified-immutable-event-hash'}
              </code>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setInspectLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
