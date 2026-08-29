import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CreditCard,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
} from 'lucide-react';
import API from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ABAPayModal from '../components/ABAPayModal.jsx';
import CutLuyPayModal from '../components/CutLuyPayModal.jsx';
import { TableSkeleton } from '../components/SkeletonLoader.jsx';

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gateway, setGateway] = useState('CUTLUY'); // CUTLUY, ABA_PAYWAY
  const [depositAmount, setDepositAmount] = useState('10');
  const [customAmount, setCustomAmount] = useState('');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const [abaModalOpen, setAbaModalOpen] = useState(false);
  const [cutluyModalOpen, setCutluyModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const presetAmounts = ['1', '5', '10', '20', '50', '100'];

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/wallet');
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load wallet transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleDepositClick = async () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : parseFloat(depositAmount);

    if (isNaN(finalAmount) || finalAmount <= 0) {
      toast.error('Please enter a valid deposit amount greater than $0');
      return;
    }

    try {
      setSubmittingDeposit(true);

      if (gateway === 'CUTLUY') {
        const res = await API.post('/payments/cutluy/create', {
          amount: finalAmount,
          paymentType: 'WALLET_DEPOSIT',
        });

        if (res.data.success) {
          setPaymentData(res.data);
          setCutluyModalOpen(true);
        }
      } else {
        const res = await API.post('/wallet/deposit', {
          amount: finalAmount,
        });

        if (res.data.success) {
          setPaymentData(res.data);
          setAbaModalOpen(true);
        }
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to initiate deposit');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const handleDepositSuccess = async () => {
    setAbaModalOpen(false);
    setCutluyModalOpen(false);
    await refreshUser();
    await fetchWalletData();
    toast.success('Wallet balance credited successfully!');
  };

  const balance = Number(user?.balance || 0);
  const balanceKhr = Math.round(balance * 4100).toLocaleString();

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white font-display">Digital Wallet & Balance</h1>
        <p className="text-sm text-slate-400 mt-1">
          Top up your DynaStore balance instantly with ABA PayWay KHQR to purchase games with 1-click checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Balance Card & Deposit Form */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Balance Display */}
          <div className="rounded-3xl glass-card border border-brand-cyan/30 p-8 shadow-neon-cyan relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Available Balance
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-white font-display">
                    ${balance.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block uppercase font-medium">Approx. KHR</span>
                <span className="text-sm font-bold text-cyan-300">៛{balanceKhr}</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" /> Official Bakong KHQR Gateway
              </span>
              <span>USD Currency</span>
            </div>
          </div>

          {/* Top-up Selection */}
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-5 shadow-xl">
            <h3 className="text-base font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-brand-cyan" />
              Add Balance via CutLuy KHQR
            </h3>

            {/* Quick Amount Buttons */}
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-2.5">Select Preset Amount</span>
              <div className="grid grid-cols-3 gap-2.5">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setDepositAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                      depositAmount === amt && !customAmount
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-rose-500 shadow-lg'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-2">Or Custom Amount ($ USD)</span>
              <input
                type="number"
                min="0.01"
                step="0.5"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 15.00"
                className="w-full bg-background-card text-white text-sm rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40"
              />
            </div>

            {/* Deposit Submit Button */}
            <button
              onClick={handleDepositClick}
              disabled={submittingDeposit}
              className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-rose-600/30"
            >
              {submittingDeposit ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>
                    Top-Up ${customAmount || depositAmount} via CutLuy KHQR
                  </span>
                </>
              )}
            </button>

            <div className="p-3 rounded-xl bg-white/5 text-[11px] text-slate-400 leading-relaxed">
              💡 CutLuy KHQR auto-checks payment every 3-5 seconds and instantly credits funds to your wallet across all banking apps (Bakong, ABA, Wing, ACLEDA).
            </div>
          </div>
        </div>

        {/* Transaction Ledger Table */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-brand-cyan" />
                Transaction History
              </h3>
              <span className="text-xs text-slate-400 font-medium">{transactions.length} Records</span>
            </div>

            {loading ? (
              <TableSkeleton rows={4} />
            ) : transactions.length > 0 ? (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {transactions.map((tx) => {
                  const isPositive = Number(tx.amount) > 0;
                  return (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {tx.description || tx.type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-black font-display block ${
                            isPositive ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {isPositive ? '+' : ''}${Math.abs(Number(tx.amount)).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Bal: ${Number(tx.balance_after).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <History className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No transactions recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CutLuy KHQR Payment Modal */}
      {paymentData && (
        <CutLuyPayModal
          isOpen={cutluyModalOpen}
          onClose={() => setCutluyModalOpen(false)}
          paymentData={paymentData}
          onSuccess={handleDepositSuccess}
        />
      )}
    </div>
  );
}
