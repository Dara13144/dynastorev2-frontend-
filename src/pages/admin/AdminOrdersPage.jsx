import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, CheckCircle2, Clock, XCircle, ExternalLink, Filter } from 'lucide-react';
import API from '../../utils/api.js';
import { TableSkeleton } from '../../components/SkeletonLoader.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/admin/orders/${orderId}`, { status: newStatus, payment_status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      await fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white font-display">Orders & Payment Audit</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor customer transactions, ABA PayWay references, and order fulfillment states
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/5">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, tran ref, customer email..."
            className="w-full bg-background-card text-xs text-white rounded-xl pl-9 pr-4 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background-card text-xs text-slate-300 rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan"
          >
            <option value="">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <span className="text-xs text-slate-400 font-medium">{filtered.length} Orders</span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Payment Method & Ref</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold text-white block">
                        #{order.id.slice(0, 8)}...
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-white block">{order.user?.username || 'Customer'}</span>
                      <span className="text-[10px] text-slate-400">{order.user?.email || order.user_id}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-cyan-300 block">{order.payment_method}</span>
                      <span className="font-mono text-[10px] text-slate-400 block">
                        {order.transaction_id || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 font-black text-white font-display text-sm">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          order.status === 'PAID' || order.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : order.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {order.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'PAID')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
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
