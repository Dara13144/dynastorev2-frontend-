import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Sparkles, Gift, Copy, Wallet, Award, RefreshCw } from "lucide-react";
import API from "../utils/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Draw the spin wheel as SVG
function SpinWheelSVG({ segments, rotation }) {
  const cx = 200;
  const cy = 200;
  const r = 185;
  const total = segments.reduce((s, seg) => s + Number(seg.weight || 1), 0);

  let currentAngle = -90; // start from top
  const slices = segments.map((seg) => {
    const pct = Number(seg.weight || 1) / total;
    const angle = pct * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const largeArc = angle > 180 ? 1 : 0;

    const midAngle = startAngle + angle / 2;
    const labelR = r * 0.62;
    const lx = cx + labelR * Math.cos(toRad(midAngle));
    const ly = cy + labelR * Math.sin(toRad(midAngle));

    const path = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    return { seg, path, lx, ly, midAngle, angle };
  });

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl" style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0s" }}>
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="rgba(0,0,0,0.5)" />
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
      {slices.map(({ seg, path, lx, ly, midAngle, angle }) => (
        <g key={seg.id}>
          <path d={path} fill={seg.color} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
          <g transform={`translate(${lx},${ly}) rotate(${midAngle + 90})`}>
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={angle < 30 ? "8" : angle < 50 ? "10" : "12"}
              fontWeight="800"
              fontFamily="system-ui"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)", paintOrder: "stroke fill", stroke: "rgba(0,0,0,0.4)", strokeWidth: "3" }}
            >
              {seg.label.length > 14 ? seg.label.slice(0, 12) + ".." : seg.label}
            </text>
          </g>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={22} fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="3" filter="url(#shadow)" />
      <circle cx={cx} cy={cy} r={14} fill="#06b6d4" />
    </svg>
  );
}

export default function SpinWheelModal({ orderId, onClose }) {
  const toast = useToast();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [award, setAward] = useState(null);
  const [copied, setCopied] = useState(false);
  const rotRef = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/spin/config");
        if (res.data.success) setSegments(res.data.segments.filter((s) => s.is_active));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const animateSpin = useCallback((targetDeg) => {
    const startTime = performance.now();
    const duration = 4200;
    const startRot = rotRef.current;
    const delta = targetDeg - (startRot % 360) + 360 * 8; // at least 8 full rotations

    const ease = (t) => 1 - Math.pow(1 - t, 4);

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const current = startRot + delta * ease(t);
      rotRef.current = current;
      setRotation(current);
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, []);

  const handleSpin = async () => {
    if (spinning || winner) return;
    setSpinning(true);
    try {
      const res = await API.post("/spin", { orderId });
      if (res.data.success) {
        const w = res.data.winner;
        const a = res.data.award;

        // Calculate target angle (center of winning segment)
        const total = segments.reduce((s, sg) => s + Number(sg.weight || 1), 0);
        let cumAngle = 0;
        let targetCenter = 0;
        for (const seg of segments) {
          const angle = (Number(seg.weight || 1) / total) * 360;
          if (seg.id === w.id) {
            targetCenter = cumAngle + angle / 2;
            break;
          }
          cumAngle += angle;
        }

        // The pointer is at top (270 deg from 0 in SVG coords, but we offset -90)
        // We want targetCenter to be at top => rotate so targetCenter goes to 0 (top)
        const finalDeg = 360 - targetCenter;

        animateSpin(finalDeg);

        setTimeout(() => {
          setWinner(w);
          setAward(a);
          setSpinning(false);
          // Clear session so the wheel doesn't reopen on page refresh
          sessionStorage.removeItem('spin_order_id');
          if (w.prize_type !== 'NONE') {
            // Confetti burst for winning!
            import('canvas-confetti').then(m => {
              const confetti = m.default || m;
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
            }).catch(() => {});
          }
          if (a?.walletCredit) {
            refreshUser();
            toast.success('+$' + Number(a.walletCredit).toFixed(2) + ' added to your wallet!');
          } else if (a?.couponCode) {
            toast.success('Coupon code ' + a.couponCode + ' added to your account!');
          }
        }, 4300);
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Spin failed, please try again";
      toast.error(msg);
      setSpinning(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const prizeIcon = winner?.prize_type === "WALLET" ? Wallet : winner?.prize_type === "COUPON" ? Gift : winner?.prize_type === "BADGE" ? Award : Sparkles;
  const PrizeIcon = prizeIcon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 60px rgba(139,92,246,0.2), 0 25px 60px rgba(0,0,0,0.6)" }}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 text-center" style={{ background: "linear-gradient(180deg, rgba(139,92,246,0.15) 0%, transparent 100%)" }}>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Lucky Spin!</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-white font-display">You Earned 1 Free Spin!</h2>
            <p className="text-xs text-slate-400 mt-1">Thank you for your purchase — spin to win a prize!</p>
          </div>

          {/* Wheel */}
          <div className="relative px-8 pb-2">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ marginTop: "-2px" }}>
              <div style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "24px solid #f59e0b", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
            </div>

            {loading ? (
              <div className="w-64 h-64 mx-auto flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="w-72 h-72 mx-auto" style={{ filter: spinning ? "drop-shadow(0 0 20px rgba(6,182,212,0.4))" : "none", transition: "filter 0.3s" }}>
                {segments.length > 0 ? (
                  <SpinWheelSVG segments={segments} rotation={rotation} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No segments configured</div>
                )}
              </div>
            )}
          </div>

          {/* Winner Reveal */}
          <AnimatePresence>
            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mx-6 mb-4 p-4 rounded-2xl text-center"
                style={{ background: winner.prize_type === "NONE" ? "rgba(51,65,85,0.6)" : "rgba(139,92,246,0.15)", border: winner.prize_type === "NONE" ? "1px solid rgba(100,116,139,0.3)" : "1px solid rgba(139,92,246,0.4)" }}
              >
                {winner.prize_type !== "NONE" ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: winner.color + "33", border: "1px solid " + winner.color + "66" }}>
                      <PrizeIcon className="w-6 h-6" style={{ color: winner.color }} />
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">🎉 You Won!</p>
                    <p className="text-xl font-black text-white mt-0.5">{winner.label}</p>

                    {award?.couponCode && (
                      <div className="mt-3 flex items-center gap-2 justify-center">
                        <span className="font-mono font-black text-brand-cyan text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-brand-cyan/30">{award.couponCode}</span>
                        <button onClick={() => copyCode(award.couponCode)} className="p-2 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan transition">
                          {copied ? <Sparkles className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                    {award?.walletCredit && (
                      <p className="mt-2 text-emerald-400 font-bold text-sm">+${Number(award.walletCredit).toFixed(2)} added to your wallet!</p>
                    )}
                    {award?.badge && (
                      <p className="mt-2 text-amber-400 font-bold text-sm">Badge unlocked: {award.badge}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-2xl mb-1">😅</p>
                    <p className="text-base font-bold text-slate-300">Better Luck Next Time!</p>
                    <p className="text-xs text-slate-500 mt-1">Keep buying games for more chances to win!</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action */}
          <div className="px-6 pb-6">
            {!winner ? (
              <button
                onClick={handleSpin}
                disabled={spinning || loading || !segments.length}
                className="w-full py-3.5 rounded-2xl font-black text-slate-950 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ background: spinning ? "linear-gradient(135deg, #4ade80, #22d3ee)" : "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}
              >
                {spinning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Spinning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>SPIN NOW!</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { onClose(); navigate('/games'); }}
                  className="w-full py-3.5 rounded-2xl font-black text-slate-950 text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", boxShadow: "0 4px 20px rgba(6,182,212,0.3)" }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explore Games</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 rounded-2xl font-semibold text-slate-400 text-xs hover:text-white transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
