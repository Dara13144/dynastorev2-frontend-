import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, HardDrive, ShieldCheck, CheckCircle2, Loader2, Gamepad2, ArrowRight } from 'lucide-react';
import API from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { TableSkeleton } from '../components/SkeletonLoader.jsx';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setLoading(true);
        const res = await API.get('/downloads');
        if (res.data.success) {
          setDownloads(res.data.downloads || []);
        }
      } catch (err) {
        console.error('Failed to load downloads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  const handleDownload = async (productId, title) => {
    try {
      setDownloadingId(productId);
      const res = await API.get(`/downloads/${productId}`);

      if (res.data.success && res.data.downloadUrl) {
        toast.success(`Starting secure download for "${title}"`);
        // Trigger browser download via signed URL
        const link = document.createElement('a');
        link.href = res.data.downloadUrl;
        link.setAttribute('download', res.data.fileName || 'game.zip');
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Download request failed. Ensure payment is verified.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white font-display">My Game Library & Downloads</h1>
        <p className="text-sm text-slate-400 mt-1">
          Access and download your paid digital games, modpacks, and standalone packages
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : downloads.length > 0 ? (
        <div className="space-y-4">
          {downloads.map((item) => (
            <div
              key={item.productId}
              className="p-6 rounded-3xl glass-card border border-white/10 hover:border-brand-cyan/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl"
            >
              {/* Game Metadata */}
              <div className="flex items-start sm:items-center gap-4">
                <img
                  src={item.cover_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'}
                  alt={item.title}
                  className="w-20 h-20 rounded-2xl object-cover bg-slate-900 shrink-0 border border-white/10"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                      Purchased & Unlocked
                    </span>
                    <span className="text-xs text-slate-400">• {item.platform || 'PC'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">{item.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                      {item.fileSize || 'Standard Package'}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">{item.fileName}</span>
                    <span>•</span>
                    <span>Purchased {new Date(item.purchasedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Download Action */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  onClick={() => handleDownload(item.productId, item.title)}
                  disabled={downloadingId === item.productId}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl gradient-btn text-xs font-bold flex items-center justify-center gap-2 shadow-neon-cyan disabled:opacity-60"
                >
                  {downloadingId === item.productId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Signed URL...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Game File</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-card rounded-3xl border border-white/10 max-w-xl mx-auto space-y-5 p-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center mx-auto text-slate-500">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">No Games in Your Library</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Once you purchase game files via ABA PayWay or your digital wallet, they will appear here with secure direct download links.
          </p>
          <Link
            to="/games"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-btn text-sm font-semibold shadow-neon-cyan"
          >
            <span>Explore Games Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
