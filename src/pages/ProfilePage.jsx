import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Wallet, Shield, KeyRound, Check, LogOut, Package, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await updateProfile({ username, avatar_url: avatarUrl });
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setUpdating(true);
      await updateProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white font-display">User Profile & Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your DynaStore gaming account and credentials</p>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Wallet Balance</span>
            <span className="text-xl font-bold text-white font-display">${Number(user?.balance || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Account Role</span>
            <span className="text-xl font-bold text-white font-display">{user?.role || 'USER'}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Member Since</span>
            <span className="text-sm font-bold text-white font-display">
              {new Date(user?.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Info */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">
            General Information
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl bg-slate-800 object-cover border border-white/15"
              />
              <div className="flex-1 min-w-0">
                <label className="text-xs text-slate-400 block font-medium mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-background-card text-xs text-white rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block font-medium mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-black/40 text-xs text-slate-500 rounded-xl px-3 py-2.5 border border-white/5 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-background-card text-xs text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-3 rounded-xl gradient-btn text-xs font-bold flex items-center justify-center gap-2 shadow-neon-cyan"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">
              Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-slate-400 block font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background-card text-xs text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background-card text-xs text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background-card text-xs text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <button
                type="submit"
                disabled={updating || !newPassword}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Update Password</span>
              </button>
            </form>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of DynaStore</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
