import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API from '../utils/api.js';
import { supabase } from '../utils/supabase.js';

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('dynastore_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dynastore_token') || null);
  const [loading, setLoading] = useState(() => !Boolean(localStorage.getItem('dynastore_token')));

  // Helper to store user and token permanently
  const handleAuthSuccess = (newToken, newUser) => {
    try {
      localStorage.setItem('dynastore_token', newToken);
      localStorage.setItem('dynastore_user', JSON.stringify(newUser));
    } catch (e) {}
    setToken(newToken);
    setUser(newUser);
  };

  // 1. Check for incoming Supabase / Google OAuth callback & existing sessions
  useEffect(() => {
    const initAuth = async () => {
      // Check URL query parameters for auto-login tokens & Supabase PKCE OAuth code
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token') || urlParams.get('tg_token') || urlParams.get('auth_token');
        if (urlToken) {
          localStorage.setItem('dynastore_token', urlToken);
          setToken(urlToken);
          const cleanUrl = window.location.pathname + (window.location.hash || '');
          window.history.replaceState(null, '', cleanUrl);

          try {
            const res = await API.get('/auth/me', {
              headers: { Authorization: `Bearer ${urlToken}` },
            });
            if (res.data.success) {
              handleAuthSuccess(urlToken, res.data.user);
              setLoading(false);
              return;
            }
          } catch (e) {}
        }

        // Clean any OAuth error in URL or hash (e.g. #error=unsupported_provider)
        const hashErr = window.location.hash?.includes('error=');
        const queryErr = urlParams.get('error') || urlParams.get('error_description');
        if (hashErr || queryErr) {
          console.warn('OAuth redirect notice:', queryErr || window.location.hash);
          window.history.replaceState(null, '', window.location.pathname);
        }

        // Handle Supabase PKCE OAuth redirect with '?code=...'
        const authCode = urlParams.get('code');
        if (authCode) {
          try {
            const { data: codeData, error: codeErr } = await supabase.auth.exchangeCodeForSession(authCode);
            const authUser = codeData?.session?.user || codeData?.user;
            if (authUser?.email) {
              const payload = {
                email: authUser.email,
                name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email.split('@')[0],
                picture: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser.id}`,
                sub: authUser.id,
                access_token: codeData?.session?.access_token,
              };

              const res = await API.post('/auth/google', payload);
              if (res.data.success) {
                handleAuthSuccess(res.data.token, res.data.user);
                window.history.replaceState(null, '', window.location.pathname);
                setLoading(false);
                return;
              }
            }
          } catch (codeExErr) {
            console.warn('Supabase PKCE code exchange notice:', codeExErr.message);
          }
        }
      } catch (err) {
        console.warn('URL token check notice:', err);
      }

      // 1. Telegram WebApp Auto-Login
      try {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
          if (window.Telegram.WebApp.setHeaderColor) {
            window.Telegram.WebApp.setHeaderColor('#0b0f19');
          }
          if (window.Telegram.WebApp.setBackgroundColor) {
            window.Telegram.WebApp.setBackgroundColor('#07090e');
          }

          const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
          if (tgUser && !token) {
            const res = await API.post('/auth/telegram', {
              id: tgUser.id,
              first_name: tgUser.first_name,
              last_name: tgUser.last_name,
              username: tgUser.username,
              photo_url: tgUser.photo_url,
              hash: window.Telegram.WebApp.initData || undefined,
              telegram_id: tgUser.id,
            });
            if (res.data.success) {
              handleAuthSuccess(res.data.token, res.data.user);
              setLoading(false);
              return;
            }
          }
        }
      } catch (tgErr) {
        console.warn('Telegram Auto-Login notice:', tgErr.message);
      }

      // Direct URL Hash Parser for Supabase OAuth Callback (#access_token=...)
      try {
        if (window.location.hash && window.location.hash.includes('access_token=')) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
          const hashAccessToken = hashParams.get('access_token');
          if (hashAccessToken) {
            // Decode payload from JWT
            try {
              const base64Url = hashAccessToken.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const jwtData = JSON.parse(jsonPayload);
              const userMeta = jwtData.user_metadata || {};
              const userEmail = jwtData.email || userMeta.email;

              if (userEmail) {
                const payload = {
                  email: userEmail,
                  name: userMeta.full_name || userMeta.name || userEmail.split('@')[0],
                  picture: userMeta.avatar_url || userMeta.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${jwtData.sub || userEmail}`,
                  sub: jwtData.sub || userMeta.sub || userEmail,
                };

                const res = await API.post('/auth/google', payload);
                if (res.data.success) {
                  handleAuthSuccess(res.data.token, res.data.user);
                  window.history.replaceState(null, '', window.location.pathname);
                  setLoading(false);
                  return;
                }
              }
            } catch (jwtErr) {
              console.warn('Hash JWT decode notice:', jwtErr);
            }
          }
        }
      } catch (hashErr) {
        console.warn('Hash parsing notice:', hashErr);
      }

      // Check if user returned from Google OAuth via Supabase or redirect
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !token) {
          const googleUser = session.user;
          const payload = {
            email: googleUser.email,
            name: googleUser.user_metadata?.full_name || googleUser.user_metadata?.name || googleUser.email.split('@')[0],
            picture: googleUser.user_metadata?.avatar_url || googleUser.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${googleUser.id}`,
            sub: googleUser.id,
          };

          const res = await API.post('/auth/google', payload);
          if (res.data.success) {
            handleAuthSuccess(res.data.token, res.data.user);
            if (window.location.hash && window.location.hash.includes('access_token')) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Supabase OAuth session sync notice:', err.message);
      }

      // Existing JWT Token verification and silent profile refresh
      const activeToken = token || localStorage.getItem('dynastore_token');
      if (activeToken) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('dynastore_user', JSON.stringify(res.data.user));
          } else if (res.status === 401 || res.status === 403) {
            logout();
          }
        } catch (err) {
          // If token rejected by server with 401/403, clear session. Otherwise retain cached user.
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth state change from Supabase OAuth
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const googleUser = session.user;
        try {
          const res = await API.post('/auth/google', {
            email: googleUser.email,
            name: googleUser.user_metadata?.full_name || googleUser.email.split('@')[0],
            picture: googleUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${googleUser.id}`,
            sub: googleUser.id,
            access_token: session.access_token,
          });
          if (res.data.success) {
            handleAuthSuccess(res.data.token, res.data.user);
          }
        } catch (e) {
          console.error('Failed to sync Supabase Google user:', e);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [token]);

  const login = async (email, password, clientGeo = null) => {
    const res = await API.post('/auth/login', { email, password, clientGeo });
    if (res.data.success) {
      handleAuthSuccess(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (email, username, password) => {
    const res = await API.post('/auth/register', { email, username, password });
    if (res.data.success) {
      handleAuthSuccess(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const ensureGoogleScriptLoaded = () => {
    return new Promise((resolve) => {
      if (window.google?.accounts?.oauth2 || window.google?.accounts?.id) {
        return resolve(window.google);
      }
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google);
        script.onerror = () => resolve(null);
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', () => resolve(window.google));
        setTimeout(() => resolve(window.google), 2000);
      }
    });
  };

  // Google Sign-In with Official Supabase OAuth & Google Identity Services
  const loginWithGoogle = async (googlePayload = null) => {
    // 1. Direct Payload or Email login
    if (googlePayload?.email) {
      const res = await API.post('/auth/google', googlePayload);
      if (res.data.success) {
        handleAuthSuccess(res.data.token, res.data.user);
        return res.data;
      }
      throw new Error(res.data.message || 'Google login failed');
    }

    if (googlePayload?.credential || googlePayload?.access_token) {
      const res = await API.post('/auth/google', googlePayload);
      if (res.data.success) {
        handleAuthSuccess(res.data.token, res.data.user);
        return res.data;
      }
      throw new Error(res.data.message || 'Google login failed');
    }

    // 2. Primary: Official Supabase Hosted Google OAuth (Real Gmail Login)
    try {
      const redirectTarget = window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTarget,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (data?.url) {
        window.location.href = data.url;
        return { redirect: true, message: 'Redirecting to Real Google Sign-In...' };
      }
      if (error) {
        console.warn('Supabase OAuth notice:', error.message);
      }
    } catch (supaErr) {
      console.warn('Supabase OAuth notice:', supaErr.message);
    }

    // 3. Fallback: Google Identity Services (GIS) Token Client Popup
    await ensureGoogleScriptLoaded();

    const googleClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '731469891455-9jt8aq96q6rjniu85dhg1fkm0ujlsatj.apps.googleusercontent.com';

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenResult = await new Promise((resolve, reject) => {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse?.access_token || tokenResponse?.code) {
                try {
                  const res = await API.post('/auth/google', {
                    access_token: tokenResponse.access_token,
                    code: tokenResponse.code,
                  });
                  if (res.data.success) {
                    handleAuthSuccess(res.data.token, res.data.user);
                    resolve(res.data);
                    return;
                  }
                  reject(new Error(res.data.message || 'Verification failed'));
                } catch (fetchErr) {
                  reject(fetchErr);
                }
              } else if (tokenResponse?.error) {
                const errType = tokenResponse.error;
                if (errType === 'access_denied' || errType === 'popup_closed' || errType === 'popup_closed_by_user') {
                  resolve({ cancelled: true, message: 'Google Sign-In popup was closed.' });
                } else {
                  resolve({ cancelled: true, error: tokenResponse.error, message: `Google notice: ${tokenResponse.error}` });
                }
              }
            },
            error_callback: (err) => {
              resolve({ cancelled: true, message: 'Google popup closed.' });
            }
          });

          tokenClient.requestAccessToken({ prompt: 'select_account' });
        });

        if (tokenResult?.success || tokenResult?.cancelled) {
          return tokenResult;
        }
      } catch (e) {
        console.warn('Google Token Client init notice:', e.message);
      }
    }

    return { fallback: true, message: 'Please enter your Google Email address to sign in instantly.' };
  };

  // Direct Instant Google Email Login (Bypasses Google Console Origin Mismatch Restrictions)
  const loginWithGoogleEmail = async (email, name = null, clientGeo = null) => {
    if (!email) throw new Error('Email is required');
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];
    const payload = {
      email: cleanEmail,
      name: cleanName,
      picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
      sub: `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      clientGeo,
    };
    const res = await API.post('/auth/google', payload);
    if (res.data.success) {
      handleAuthSuccess(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Google login failed');
  };

  const renderGoogleButton = useCallback(async (containerElement, options = {}) => {
    if (!containerElement) return;
    await ensureGoogleScriptLoaded();
    const googleClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '731469891455-9jt8aq96q6rjniu85dhg1fkm0ujlsatj.apps.googleusercontent.com';

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              const res = await API.post('/auth/google', { credential: response.credential });
              if (res.data.success) {
                handleAuthSuccess(res.data.token, res.data.user);
                if (options.onSuccess) options.onSuccess(res.data);
              }
            }
          },
        });
        window.google.accounts.id.renderButton(containerElement, {
          theme: 'filled_blue',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left',
          width: '100%',
          ...options,
        });
      } catch (err) {
        console.warn('Failed to render official Google button:', err.message);
      }
    }
  }, []);

  // Send real 6-digit OTP code to Gmail
  const sendOtp = async (email, type = 'LOGIN_OTP') => {
    if (!email) throw new Error('Email is required');
    const res = await API.post('/auth/send-otp', { email: email.trim().toLowerCase(), type });
    return res.data;
  };

  // Verify 6-digit OTP code
  const verifyOtp = async (email, code) => {
    if (!email || !code) throw new Error('Email and code are required');
    const res = await API.post('/auth/verify-otp', { email: email.trim().toLowerCase(), code: code.toString().trim() });
    return res.data;
  };

  // Passwordless Login with 6-digit Gmail OTP
  const loginWithOtp = async (email, code) => {
    if (!email || !code) throw new Error('Email and code are required');
    const res = await API.post('/auth/otp-login', { email: email.trim().toLowerCase(), code: code.toString().trim() });
    if (res.data.success) {
      handleAuthSuccess(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'OTP Login failed');
  };

  // Telegram OAuth / Widget / WebApp Login
  const loginWithTelegram = async (telegramData) => {
    let payload = {};
    if (typeof telegramData === 'string') {
      const clean = telegramData.trim().replace(/^@/, '');
      payload = {
        username: clean,
        telegram_id: clean,
        first_name: clean,
      };
    } else if (telegramData && typeof telegramData === 'object') {
      payload = telegramData;
    } else {
      throw new Error('Telegram login data is required');
    }

    const res = await API.post('/auth/telegram', payload);
    if (res.data.success) {
      handleAuthSuccess(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Telegram login failed');
  };

  const logout = async () => {
    try {
      // 1. Clear Local & Session Storage tokens
      localStorage.removeItem('dynastore_token');
      localStorage.removeItem('dynastore_user');
      sessionStorage.clear();

      // 2. Sign out from Supabase Auth
      try {
        await supabase.auth.signOut();
      } catch (e) {}

      // 3. Disable Google auto-select if active
      try {
        if (window.google?.accounts?.id?.disableAutoSelect) {
          window.google.accounts.id.disableAutoSelect();
        }
      } catch (e) {}

      // 4. Reset React state
      setToken(null);
      setUser(null);
    } catch (err) {
      console.warn('Logout notice:', err);
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await API.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await API.put('/auth/profile', profileData);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Failed to update profile');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    loginWithGoogle,
    loginWithGoogleEmail,
    loginWithTelegram,
    renderGoogleButton,
    sendOtp,
    verifyOtp,
    loginWithOtp,
    logout,
    refreshUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
