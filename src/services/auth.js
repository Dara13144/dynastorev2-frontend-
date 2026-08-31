import API from '../utils/api.js';

export const authService = {
  // 1. Request Password Reset OTP
  async forgotPassword(email) {
    if (!email) throw new Error('Email is required');
    const res = await API.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
    return res.data;
  },

  // 2. Resend Password Reset OTP
  async resendOtp(email) {
    if (!email) throw new Error('Email is required');
    const res = await API.post('/auth/resend-otp', { email: email.trim().toLowerCase() });
    return res.data;
  },

  // 3. Verify OTP code and obtain Reset Token
  async verifyOtp(email, otp) {
    if (!email || !otp) throw new Error('Email and OTP code are required');
    const res = await API.post('/auth/verify-otp', {
      email: email.trim().toLowerCase(),
      otp: otp.toString().trim(),
      code: otp.toString().trim(),
    });
    return res.data;
  },

  // 4. Reset Password with Reset Token
  async resetPassword({ resetToken, token, newPassword, email }) {
    const activeToken = (resetToken || token) ? (resetToken || token).trim() : undefined;
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must contain at least 8 characters.');
    }
    const res = await API.post('/auth/reset-password', {
      resetToken: activeToken,
      token: activeToken,
      newPassword,
      email: email ? email.trim().toLowerCase() : undefined,
    });
    return res.data;
  },

  // 5. Send general OTP
  async sendOtp(email, type = 'LOGIN_OTP') {
    const res = await API.post('/auth/send-otp', { email: email.trim().toLowerCase(), type });
    return res.data;
  },

  // 6. Login with OTP
  async loginWithOtp(email, otp) {
    const res = await API.post('/auth/otp-login', {
      email: email.trim().toLowerCase(),
      otp: otp.toString().trim(),
      code: otp.toString().trim(),
    });
    return res.data;
  },

  // 7. Login with Telegram
  async loginWithTelegram(telegramData) {
    const res = await API.post('/auth/telegram', telegramData);
    return res.data;
  },

  // 8. Telegram QR Code Login
  async createTelegramQr(payload = {}) {
    const res = await API.post('/auth/telegram/qr/create', payload);
    return res.data;
  },

  async getTelegramQrStatus(sessionId) {
    const res = await API.get(`/auth/telegram/qr/status/${sessionId}`);
    return res.data;
  },

  async confirmTelegramQr(payload) {
    const res = await API.post('/auth/telegram/qr/confirm', payload);
    return res.data;
  },

  // 9. Cross-Device QR Code Sync & Authorization
  async createDeviceQr() {
    const res = await API.post('/auth/device-qr/create');
    return res.data;
  },

  async getDeviceQrStatus(sessionId) {
    const res = await API.get(`/auth/device-qr/status/${sessionId}`);
    return res.data;
  },

  async authorizeDeviceQr(sessionId) {
    const res = await API.post('/auth/device-qr/authorize', { sessionId });
    return res.data;
  },

  async confirmDeviceQr(sessionId, payload = {}) {
    const res = await API.post('/auth/device-qr/confirm', { sessionId, ...payload });
    return res.data;
  },
};

export default authService;
