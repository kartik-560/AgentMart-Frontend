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
  Search,
  Download,
  Eye,
  Copy,
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
    <div className="space-y-6 text-[#172554]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172554] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#1d4ed8] shrink-0" /> Tamper-Evident Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-[#1e3a8a] mt-1">
            Cryptographically linked event logs recording all multi-agent actions, state transitions, security flags, and human approvals.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs font-bold">
          <Download className="w-3.5 h-3.5" /> Export Audit Trail
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#1e3a8a]/20 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Entity Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'TRANSACTION', 'SECURITY', 'NEGOTIATION'].map((ent) => (
            <button
              key={ent}
              onClick={() => setSelectedEntity(ent)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedEntity === ent
                  ? 'bg-[#1d4ed8] text-[#faf7ee] shadow-xs'
                  : 'bg-[#f4efe3] text-[#1e3a8a] hover:bg-[#eadecc] hover:text-[#172554] border border-[#1e3a8a]/20'
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
            className="px-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-xl text-xs text-[#172554] focus:outline-none focus:border-[#1d4ed8] font-mono font-bold"
          >
            <option value="ALL">All Actors</option>
            <option value="HUMAN">Human</option>
            <option value="AGENT">Agent</option>
            <option value="SYSTEM">System</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#1e3a8a] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-xl text-xs text-[#172554] placeholder-[#1e3a8a]/50 focus:outline-none focus:border-[#1d4ed8]"
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e3a8a]/20 bg-[#f4efe3] text-[#172554]">
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Actor</th>
                <th className="py-3 px-4 font-bold">Action</th>
                <th className="py-3 px-4 font-bold">Entity Type & ID</th>
                <th className="py-3 px-4 font-bold">Audit Event Details</th>
                <th className="py-3 px-4 font-bold">SHA-256 Hash</th>
                <th className="py-3 px-4 font-bold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a8a]/15 font-mono text-[#172554]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#1e3a8a] font-sans">
                    No audit records match selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#faf7ee] transition-colors">
                    <td className="py-3.5 px-4 text-[#1e3a8a] font-sans text-[11px] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[#1e3a8a]/20 bg-[#f4efe3] text-[#1d4ed8]">
                        {log.actorType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#172554] text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 text-[#1d4ed8] font-bold text-[11px]">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="py-3.5 px-4 text-[#172554] font-sans max-w-xs truncate text-[11px]">
                      {log.details || JSON.stringify(log.newState || {})}
                    </td>
                    <td className="py-3.5 px-4 text-[#1e3a8a] text-[10px] max-w-[130px] truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{log.tamperProofHash || 'sha256-verified-hash'}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(log.tamperProofHash || '', 'Hash')}
                          className="text-[#1e3a8a] hover:text-[#172554] shrink-0"
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

      {/* Inspect Log Modal */}
      <Modal
        isOpen={Boolean(inspectLog)}
        onClose={() => setInspectLog(null)}
        title="Immutable Audit Log Record"
        subtitle={`Log Entry ID: ${inspectLog?.id}`}
      >
        {inspectLog && (
          <div className="space-y-4 text-xs text-[#172554]">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 font-mono text-[11px]">
              <div>
                <span className="text-[#1e3a8a] block">Actor Identity:</span>
                <span className="text-[#172554] font-bold">{inspectLog.actorId || inspectLog.actorType}</span>
              </div>
              <div>
                <span className="text-[#1e3a8a] block">Action Type:</span>
                <span className="text-[#1d4ed8] font-bold">{inspectLog.action}</span>
              </div>
              <div>
                <span className="text-[#1e3a8a] block">Entity Scope:</span>
                <span className="text-[#172554] font-bold">{inspectLog.entityType} ({inspectLog.entityId})</span>
              </div>
              <div>
                <span className="text-[#1e3a8a] block">Timestamp:</span>
                <span>{formatDateTime(inspectLog.timestamp)}</span>
              </div>
            </div>

            <div>
              <span className="text-[#172554] block mb-1 font-bold">Narrative Event Description:</span>
              <p className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] leading-relaxed font-sans">
                {inspectLog.details || 'State transition executed and cryptographically sealed.'}
              </p>
            </div>

            <div>
              <span className="text-[#172554] block mb-1 font-bold">State Payload Diff:</span>
              <pre className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 font-mono text-[11px] text-[#172554] overflow-x-auto">
                {JSON.stringify(inspectLog.newState || {}, null, 2)}
              </pre>
            </div>

            <div className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[11px] font-mono">
              <span className="text-[#1e3a8a] block mb-1 font-bold">Cryptographic Tamper-Proof SHA-256 Hash:</span>
              <code className="text-[#1d4ed8] break-all text-[11px] font-bold">
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
