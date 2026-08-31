import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

// Layouts
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Public & User Pages
import HomePage from './pages/HomePage.jsx';
import GamesPage from './pages/GamesPage.jsx';
import GameDetailPage from './pages/GameDetailPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import PaymentStatusPage from './pages/PaymentStatusPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WalletPage from './pages/WalletPage.jsx';
import DownloadsPage from './pages/DownloadsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';

// Auth Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import VerifyOtpPage from './pages/VerifyOtpPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminFilesPage from './pages/admin/AdminFilesPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminWalletPage from './pages/admin/AdminWalletPage.jsx';
import AdminLogsPage from './pages/admin/AdminLogsPage.jsx';

import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                {/* Storefront Layout */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/games/:slug" element={<GameDetailPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/payment/status" element={<PaymentStatusPage />} />
                  
                  {/* User Dashboard */}
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/downloads" element={<DownloadsPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />

                  {/* Auth */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/verify-otp" element={<VerifyOtpPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Admin Panel Layout */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="files" element={<AdminFilesPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="wallet" element={<AdminWalletPage />} />
                  <Route path="logs" element={<AdminLogsPage />} />
                </Route>
              </Routes>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
