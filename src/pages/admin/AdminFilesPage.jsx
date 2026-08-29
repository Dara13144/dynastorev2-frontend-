import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Upload,
  HardDrive,
  FileCheck,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import API from '../../utils/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminFilesPage() {
  const [fileList, setFileList] = useState([
    { path: 'games/cyberpulse_2088_v1.4.2.zip', name: 'cyberpulse_2088_setup.zip', size: '4.8 GB', uploadedAt: '2025-11-15' },
    { path: 'games/eldoria_kingdom_fall_v2.0.1.zip', name: 'eldoria_kingdom_fall.zip', size: '12.4 GB', uploadedAt: '2025-09-20' },
    { path: 'games/apex_drift_tokyo_v1.1.0.zip', name: 'apex_drift_tokyo.zip', size: '8.2 GB', uploadedAt: '2026-01-10' },
    { path: 'games/voxelcraft_ultra_v3.5.zip', name: 'voxelcraft_ultra_modpack.zip', size: '1.5 GB', uploadedAt: '2026-02-01' },
    { path: 'games/blackwood_manor_v1.0.4.zip', name: 'blackwood_manor.zip', size: '6.1 GB', uploadedAt: '2025-10-31' },
    { path: 'games/stellar_command_v1.3.zip', name: 'stellar_command_fleet.zip', size: '5.3 GB', uploadedAt: '2025-12-05' },
  ]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedPath, setCopiedPath] = useState(null);
  const toast = useToast();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(20);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('bucket', 'game-files');

      // Simulate progress progression
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 25 : prev));
      }, 300);

      const res = await API.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      if (res.data.success) {
        const newFileEntry = {
          path: res.data.filePath,
          name: res.data.fileName,
          size: res.data.fileSize,
          uploadedAt: new Date().toISOString().split('T')[0],
        };
        setFileList([newFileEntry, ...fileList]);
        toast.success(`File "${selectedFile.name}" uploaded to private game-files bucket!`);
        setSelectedFile(null);
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const copyPath = (path) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    toast.info('Storage file path copied to clipboard');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white font-display">Game Files & Storage Manager</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage private Supabase Storage packages (ZIP, RAR, 7Z, ISO, EXE, APK)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">
                  Upload Game Package
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                  Target: Encrypted 'game-files' Bucket
                </span>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Drag & Drop Box */}
              <label className="border-2 border-dashed border-white/15 hover:border-brand-cyan/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-black/20 hover:bg-white/5 transition-all">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".zip,.rar,.7z,.iso,.exe,.apk"
                  className="hidden"
                />
                <FolderArchive className="w-10 h-10 text-brand-cyan mb-2" />
                <span className="text-xs font-bold text-white block">
                  {selectedFile ? selectedFile.name : 'Choose Game Archive'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Supported: ZIP, RAR, 7Z, ISO, EXE, APK (Up to 500MB via API)
                </span>
              </label>

              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Uploading file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-cyan transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full py-3.5 rounded-xl gradient-btn text-xs font-bold flex items-center justify-center gap-2 shadow-neon-cyan disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Upload to Game-Files Bucket</span>
              </button>
            </form>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-cyan" /> Strict Storage Security
              </span>
              <p>
                Files in this bucket are never publicly exposed. Buyers only receive short-lived signed URLs generated on-the-fly upon verified order authorization.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Files List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">
                Vault Storage Objects
              </h3>
              <span className="text-xs text-slate-400 font-medium">{fileList.length} Files</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {fileList.map((file, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition-all text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 shrink-0">
                      <FolderArchive className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">{file.name}</span>
                      <span className="font-mono text-[11px] text-cyan-300/80 block truncate">
                        {file.path}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {file.size} • Uploaded {file.uploadedAt}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => copyPath(file.path)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 text-[11px]"
                      title="Copy path to assign to product"
                    >
                      {copiedPath === file.path ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Path</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
