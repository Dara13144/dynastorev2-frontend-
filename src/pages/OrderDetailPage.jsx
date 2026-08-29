import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Download, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import API from '../utils/api.js';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order not found</h2>
        <Link to="/orders" className="text-xs text-brand-cyan underline">Back to Orders</Link>
      </div>
    );
  }

  const isPaid = order.status === 'PAID' || order.status === 'COMPLETED';

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <Link to="/orders" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
        <h1 className="text-3xl font-black text-white font-display">Order Receipt</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Order ID: {order.id}</p>
      </div>

      <div className="rounded-3xl glass-card border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Status banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/10">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Payment Status</span>
            <div className="flex items-center gap-2 mt-1">
              {isPaid ? (
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> PAID & UNLOCKED
                </span>
              ) : (
                <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {order.status}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Payment Method</span>
            <span className="text-xs font-bold text-white uppercase">{order.payment_method}</span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Products</h3>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 text-xs text-slate-200">
                <span className="font-semibold text-white">{item.product_title}</span>
                <span className="font-bold text-brand-cyan">${Number(item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total calculation */}
        <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Transaction Ref</span>
            <span className="font-mono text-slate-300">{order.transaction_id || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Timestamp</span>
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between items-baseline text-base font-bold text-white">
            <span>Total Paid</span>
            <span className="text-2xl font-black text-brand-cyan font-display">
              ${Number(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>

        {isPaid && (
          <div className="pt-2">
            <Link
              to="/downloads"
              className="w-full py-3.5 rounded-2xl gradient-btn text-xs font-bold flex items-center justify-center gap-2 shadow-neon-cyan"
            >
              <Download className="w-4 h-4" />
              <span>Go to My Downloads to Download Game Files</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
