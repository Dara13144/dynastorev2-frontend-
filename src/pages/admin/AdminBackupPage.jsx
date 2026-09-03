import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  HardDriveDownload,
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
  Server,
  Layers,
  Clock,
  Info,
  Calendar,
  Sparkles,
  Search,
  ArrowUpDown,
  Lock,
} from 'lucide-react';
import API from '../../utils/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { TableSkeleton } from '../../components/SkeletonLoader.jsx';

export default function AdminBackupPage() {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupNote, setBackupNote] = useState('');

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState(null);
  const [uploadedBackupData, setUploadedBackupData] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [restoreMode, setRestoreMode] = useState('merge');
  const [confirmSafetyCheck, setConfirmSafetyCheck] = useState(false);

  // Fetch backups and stats
  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/backups');
      if (res.data.success) {
        setBackups(res.data.backups || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load backups:', err);
      toast.error(err.formattedMessage || 'Failed to load system backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  // 1. Create a new backup snapshot
  const handleCreateBackup = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await API.post('/admin/backups', { note: backupNote });
      if (res.data.success) {
        toast.success(res.data.message || 'System backup snapshot generated successfully!');
        setShowCreateModal(false);
        setBackupNote('');
        fetchBackups();
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to create backup');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Direct live JSON export (instant browser download)
  const handleExportLiveBackup = async () => {
    try {
      toast.info('Generating live system snapshot...');
      const res = await API.get('/admin/backups/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.setAttribute('download', `dynastore_live_backup_${timestamp}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Live backup snapshot downloaded successfully!');
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to export live backup');
    }
  };

  // 3. Download an existing snapshot file
  const handleDownloadSnapshot = async (backup) => {
    try {
      toast.info(`Downloading ${backup.fileName}...`);
      const res = await API.get(`/admin/backups/${backup.backupId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', backup.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Snapshot downloaded');
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to download snapshot file');
    }
  };

  // 4. Delete a snapshot
  const handleDeleteBackup = async (backupId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete backup snapshot "${fileName}"? This cannot be undone.`)) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await API.delete(`/admin/backups/${backupId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Backup deleted successfully');
        fetchBackups();
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to delete backup');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Handle File Upload for Restore
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a valid DynaStore .json backup file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.data || typeof parsed.data !== 'object') {
          toast.error('Invalid backup file: Missing "data" payload structure');
          return;
        }
        setUploadedBackupData(parsed);
        setUploadedFileName(file.name);
        setSelectedBackupForRestore(null);
        setConfirmSafetyCheck(false);
        setShowRestoreModal(true);
        toast.info(`Loaded backup "${file.name}" for preview`);
      } catch (err) {
        toast.error('Failed to parse JSON file. Ensure the file is not corrupted.');
      }
    };
    reader.readAsText(file);
  };

  // 6. Execute Restore
  const handleExecuteRestore = async () => {
    if (!confirmSafetyCheck) {
      toast.error('Please acknowledge the safety verification checkbox');
      return;
    }

    try {
      setActionLoading(true);
      toast.info(`Restoring system in ${restoreMode} mode...`);

      let payload = { mode: restoreMode };
      if (selectedBackupForRestore) {
        payload.backupId = selectedBackupForRestore.backupId;
      } else if (uploadedBackupData) {
        payload.backupData = uploadedBackupData;
      } else {
        toast.error('No backup selected for restoration');
        return;
      }

      const res = await API.post('/admin/backups/restore', payload);
      if (res.data.success) {
        toast.success(res.data.message || 'System restoration completed successfully!');
        setShowRestoreModal(false);
        setSelectedBackupForRestore(null);
        setUploadedBackupData(null);
        setConfirmSafetyCheck(false);
        fetchBackups();
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Restoration failed. Please inspect database logs.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBackups = backups.filter(
    (b) =>
      b.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.note && b.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.createdBy && b.createdBy.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Hidden file input for uploading backup file */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-cyan/15 text-cyan-400 border border-brand-cyan/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white font-display tracking-tight">
                System Backup & Recovery
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Generate immutable snapshots, export full schemas, or restore system state
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl glass-card hover:bg-white/10 text-white border border-white/15 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>Upload & Restore</span>
          </button>

          <button
            onClick={handleExportLiveBackup}
            className="px-4 py-2.5 rounded-xl glass-card hover:bg-white/10 text-white border border-white/15 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Live JSON</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white flex items-center gap-2 shadow-neon-cyan active:scale-95 transition-all"
          >
            <HardDriveDownload className="w-4 h-4" />
            <span>Create Snapshot</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Snapshots */}
        <div className="p-5 rounded-3xl glass-card border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Snapshots Stored
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-display">
              {stats?.totalBackups || 0}
            </span>
            <span className="text-xs text-slate-400">
              ({stats?.totalDiskUsage || '0 B'})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            Local snapshots archive
          </p>
        </div>

        {/* Last Backup Date */}
        <div className="p-5 rounded-3xl glass-card border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Last Backup
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-base font-bold text-white block truncate">
              {stats?.lastBackupDate
                ? new Date(stats.lastBackupDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'No snapshots yet'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-400" />
            Automated & on-demand
          </p>
        </div>

        {/* Total System Records */}
        <div className="p-5 rounded-3xl glass-card border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Live Records
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-display">
              {stats?.totalLiveRecords || 0}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Across 10 core tables
          </p>
        </div>

        {/* Database Engine */}
        <div className="p-5 rounded-3xl glass-card border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Storage Engine
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-bold text-white block truncate">
              {stats?.storageEngine || 'PostgreSQL'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Encrypted & protected
          </p>
        </div>
      </div>

      {/* Live Table Breakdown Badges */}
      {stats?.liveCounts && (
        <div className="p-5 rounded-3xl glass-card border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Live Entity Composition (Current Database State)
            </span>
            <button
              onClick={fetchBackups}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(stats.liveCounts).map(([table, count]) => (
              <div
                key={table}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs"
              >
                <span className="capitalize text-slate-300 font-medium">
                  {table.replace(/_/g, ' ')}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[11px] border border-cyan-500/30">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backup Snapshots Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-display">
              Stored Snapshot Archives
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-bold font-mono">
              {filteredBackups.length}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search snapshots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : filteredBackups.length === 0 ? (
          <div className="p-12 rounded-3xl glass-card border border-white/10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileJson className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Backup Snapshots Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No snapshots matching your search query. Clear search to view all.'
                  : 'Your system does not have any saved snapshots yet. Create your first backup snapshot now.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white inline-flex items-center gap-2 shadow-neon-cyan"
              >
                <HardDriveDownload className="w-4 h-4" />
                <span>Generate First Snapshot</span>
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-4">Snapshot Name & Note</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4">Created By</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Entities</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBackups.map((b) => (
                    <tr key={b.backupId} className="hover:bg-white/5 transition-colors group">
                      {/* Name & Note */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                            <FileJson className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white text-xs block truncate">
                              {b.fileName}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block">
                              {b.note || 'Manual system snapshot'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="p-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                        {new Date(b.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Created By */}
                      <td className="p-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-medium">
                          {b.createdBy}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="p-4 whitespace-nowrap font-mono font-semibold text-slate-300 text-[11px]">
                        {b.sizeFormatted}
                      </td>

                      {/* Entities Count */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-brand-cyan/15 text-cyan-300 border border-brand-cyan/30 text-[11px] font-bold font-mono">
                          {b.totalRecords} records
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Download button */}
                          <button
                            onClick={() => handleDownloadSnapshot(b)}
                            title="Download JSON Snapshot"
                            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white border border-transparent hover:border-white/15 transition-all"
                          >
                            <Download className="w-4 h-4 text-emerald-400" />
                          </button>

                          {/* Restore button */}
                          <button
                            onClick={() => {
                              setSelectedBackupForRestore(b);
                              setUploadedBackupData(null);
                              setConfirmSafetyCheck(false);
                              setShowRestoreModal(true);
                            }}
                            title="Restore from this snapshot"
                            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white border border-transparent hover:border-white/15 transition-all"
                          >
                            <RefreshCw className="w-4 h-4 text-cyan-400" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteBackup(b.backupId, b.fileName)}
                            title="Delete snapshot"
                            className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* Create Backup Modal */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-card border border-white/20 p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <HardDriveDownload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Create Backup Snapshot
                </h3>
                <p className="text-xs text-slate-400">
                  Captures all 10 system database tables into an archive
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBackup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Backup Note / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled Weekly Backup, Pre-release v2.5"
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <Info className="w-4 h-4 shrink-0" />
                  What will be backed up:
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                  <li>Categories, Game Products & Assets</li>
                  <li>User Accounts & Role Permissions</li>
                  <li>Customer Orders & Purchased Items</li>
                  <li>Wallet Adjustments & Payment Receipts</li>
                  <li>Audit Logs & Notification Feed</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white flex items-center gap-2 shadow-neon-cyan active:scale-95 transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <HardDriveDownload className="w-4 h-4" />
                      <span>Start Snapshot</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Restore System Confirmation Modal */}
      {/* ======================================================== */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl glass-card border border-rose-500/30 p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  System Restore & Recovery
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedBackupForRestore
                    ? `Restoring from server snapshot: ${selectedBackupForRestore.fileName}`
                    : `Restoring from uploaded file: ${uploadedFileName}`}
                </p>
              </div>
            </div>

            {/* Entity Summary Preview */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Entities to Restore:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-black/40 border border-white/10">
                {selectedBackupForRestore?.counts ? (
                  Object.entries(selectedBackupForRestore.counts).map(([table, count]) => (
                    <div key={table} className="text-[11px] text-slate-400">
                      <span className="capitalize">{table.replace(/_/g, ' ')}:</span>{' '}
                      <span className="font-mono text-cyan-300 font-bold">{count}</span>
                    </div>
                  ))
                ) : uploadedBackupData?.counts ? (
                  Object.entries(uploadedBackupData.counts).map(([table, count]) => (
                    <div key={table} className="text-[11px] text-slate-400">
                      <span className="capitalize">{table.replace(/_/g, ' ')}:</span>{' '}
                      <span className="font-mono text-cyan-300 font-bold">{count}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 col-span-3">Full system data structure</span>
                )}
              </div>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Restore Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRestoreMode('merge')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    restoreMode === 'merge'
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-neon-cyan'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block text-cyan-300">Merge / Upsert</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Updates existing records by ID and inserts missing records without wiping other data.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRestoreMode('overwrite')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    restoreMode === 'overwrite'
                      ? 'bg-rose-500/15 border-rose-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block text-rose-400">Full Replace</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Replaces table contents with snapshot data. Recommended only for disaster recovery.
                  </span>
                </button>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                Administrative Confirmation Required
              </div>
              <p className="text-[11px] text-rose-200/80 leading-relaxed">
                Applying this snapshot will overwrite matched database records. We recommend exporting a live snapshot before performing a restore.
              </p>
            </div>

            {/* Checkbox verification */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmSafetyCheck}
                onChange={(e) => setConfirmSafetyCheck(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-black text-cyan-400 focus:ring-0"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                I understand this operation modifies live system database tables and authorize this restoration.
              </span>
            </label>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackupForRestore(null);
                  setUploadedBackupData(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!confirmSafetyCheck || actionLoading}
                onClick={handleExecuteRestore}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Restoring System...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Confirm & Execute Restore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
