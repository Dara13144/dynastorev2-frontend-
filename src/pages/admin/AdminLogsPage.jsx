import React, { useState, useEffect } from 'react';
import { ScrollText, Search, ShieldCheck } from 'lucide-react';
import API from '../../utils/api.js';
import { TableSkeleton } from '../../components/SkeletonLoader.jsx';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await API.get('/admin/logs');
        if (res.data.success) {
          setLogs(res.data.logs || []);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white font-display">System Audit Logs</h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete, tamper-evident record of administrative and financial operations
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">Target ID</th>
                  <th className="p-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-brand-cyan/15 text-cyan-300 border border-brand-cyan/30 text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-white font-sans font-semibold">
                      {log.target_type}
                    </td>
                    <td className="p-4 text-slate-400 text-[11px] truncate max-w-[120px]">
                      {log.target_id || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-300 font-sans text-[11px] max-w-xs">
                      {(() => {
                        const meta = log.metadata;
                        if (!meta || (typeof meta === 'object' && Object.keys(meta).length === 0)) {
                          return <span className="text-slate-500">—</span>;
                        }
                        if (typeof meta === 'string') {
                          return <span className="text-slate-300 truncate block">{meta}</span>;
                        }
                        const parts = [];
                        if (meta.title) parts.push(`Title: ${meta.title}`);
                        if (meta.code) parts.push(`Code: ${meta.code}`);
                        if (meta.username) parts.push(`User: ${meta.username}`);
                        if (meta.amount !== undefined) parts.push(`$${meta.amount}`);
                        if (meta.status) parts.push(`Status: ${meta.status}`);
                        if (meta.reason) parts.push(`Reason: ${meta.reason}`);

                        if (parts.length > 0) {
                          return <span className="text-cyan-300 font-medium truncate block">{parts.join(' • ')}</span>;
                        }

                        // Clean key-value summary
                        const keys = Object.keys(meta).slice(0, 2);
                        const summary = keys.map((k) => `${k}: ${meta[k]}`).join(', ');
                        return <span className="text-slate-400 truncate block">{summary || '—'}</span>;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
