import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dynastore_token') || null);
  const [loading, setLoading] = useState(true);

  // 1. Check for incoming Supabase Google OAuth callback & existing sessions
  useEffect(() => {
    const initAuth = async () => {
      // Check if user returned from Google OAuth via Supabase
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
            localStorage.setItem('dynastore_token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Supabase OAuth session sync notice:', err.message);
      }

      // Existing JWT Token verification
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
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
          });
          if (res.data.success) {
            localStorage.setItem('dynastore_token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
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

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('dynastore_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (email, username, password) => {
    const res = await API.post('/auth/register', { email, username, password });
    if (res.data.success) {
      localStorage.setItem('dynastore_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  // Google Sign-In with Real Google Account Popup (GSI Token Client)
  const loginWithGoogle = async (googlePayload = null) => {
    if (googlePayload?.email) {
      const res = await API.post('/auth/google', googlePayload);
      if (res.data.success) {
        localStorage.setItem('dynastore_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
      }
      throw new Error(res.data.message || 'Google login failed');
    }

    const googleClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '16446964112-ci1cf4v6vc551ppvm003107sgkqg96as.apps.googleusercontent.com';

    // 1. Try Supabase Google OAuth Redirect First (Zero Origin-Mismatch)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (!error && data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (sbErr) {
      console.warn('Supabase OAuth notice, falling back to GIS Token Client:', sbErr.message);
    }

    // 2. Google Identity Services (GIS) Token Client Popup
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        try {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse?.access_token) {
                try {
                  // Send real Google access_token to backend for server-side verification
                  const res = await API.post('/auth/google', {
                    access_token: tokenResponse.access_token,
                  });

                  if (res.data.success) {
                    localStorage.setItem('dynastore_token', res.data.token);
                    setToken(res.data.token);
                    setUser(res.data.user);
                    resolve(res.data);
                    return;
                  }
                } catch (fetchErr) {
                  console.error('Error verifying Google session on server:', fetchErr);
                  reject(fetchErr);
                }
              } else if (tokenResponse?.error) {
                console.warn('Google OAuth notice:', tokenResponse.error);
                if (tokenResponse.error === 'origin_mismatch') {
                  const originErr = new Error('Google Sign-In is not configured for this website origin. Please register ' + window.location.origin + ' in Google Cloud Console.');
                  originErr.code = 'origin_mismatch';
                  reject(originErr);
                } else {
                  reject(new Error(tokenResponse.error));
                }
              }
            },
          });

          tokenClient.requestAccessToken({ prompt: 'select_account' });
          return;
        } catch (e) {
          console.warn('Google Token Client init notice, falling back:', e.message);
        }
      }

      // 3. Fallback: Google Identity Services (GSI) One-Tap / ID Credential
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response) => {
              try {
                if (response.credential) {
                  const res = await API.post('/auth/google', {
                    credential: response.credential,
                  });
                  if (res.data.success) {
                    localStorage.setItem('dynastore_token', res.data.token);
                    setToken(res.data.token);
                    setUser(res.data.user);
                    resolve(res.data);
                    return;
                  }
                }
              } catch (err) {
                reject(err);
              }
            },
          });

          window.google.accounts.id.prompt();
          return;
        } catch (e) {
          console.warn('GSI ID init notice:', e.message);
        }
      }

      reject(new Error('Google Identity Services SDK is not loaded. Please check your internet connection or browser extensions.'));
    });
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Non-blocking
    }
    localStorage.removeItem('dynastore_token');
    setToken(null);
    setUser(null);
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
