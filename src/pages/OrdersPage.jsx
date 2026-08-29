import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Download, ExternalLink, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import API from '../utils/api.js';
import { TableSkeleton } from '../components/SkeletonLoader.jsx';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await API.get('/orders');
        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PAID
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white font-display">My Orders</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your purchase history and order receipts
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.status === 'PAID' || order.status === 'COMPLETED';
            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl glass-card border border-white/10 space-y-4 hover:border-white/20 transition-all shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-white">
                        Order #{order.id.slice(0, 8)}...
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-xs text-slate-400">
                      Placed on {new Date(order.created_at).toLocaleDateString()} via {order.payment_method}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white font-display">
                      ${Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-slate-300">
                      <span>• {item.product_title || 'Game File License'}</span>
                      <span className="font-medium text-white">${Number(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1"
                  >
                    <span>View Receipt Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {isPaid && (
                    <Link
                      to="/downloads"
                      className="px-4 py-2 rounded-xl gradient-btn text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Game</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center glass-card rounded-3xl border border-white/10 max-w-xl mx-auto space-y-4 p-8">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400">
            You have not placed any orders yet. Browse our store to discover new games.
          </p>
          <Link to="/games" className="inline-block px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold">
            Explore Games
          </Link>
        </div>
      )}
    </div>
  );
}
