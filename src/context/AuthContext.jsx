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

  // Google Sign-In with Official Google OAuth (Redirect Mode - No Popup Closed Errors)
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

    try {
      // Direct full-page official Google OAuth redirect via Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Google OAuth redirect notice:', err.message);
      throw new Error(err.message || 'Google Sign-In failed');
    }
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
