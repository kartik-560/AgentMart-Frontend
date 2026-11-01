'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage and verify with backend
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (typeof window === 'undefined') return;
      
      const storedToken = localStorage.getItem('agentmart_token');
      const storedUser = localStorage.getItem('agentmart_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (mounted) {
            setToken(storedToken);
            setUser(parsedUser);
          }

          // Verify token validity against backend
          const meRes = await authService.getMe();
          if (mounted && meRes?.data) {
            setUser(meRes.data);
            localStorage.setItem('agentmart_user', JSON.stringify(meRes.data));
          }
        } catch (err) {
          console.warn('Session verification notice:', err?.message);
          // If token expired/invalid (401), clean up
          if (err?.statusCode === 401) {
            localStorage.removeItem('agentmart_token');
            localStorage.removeItem('agentmart_user');
            if (mounted) {
              setToken(null);
              setUser(null);
            }
          }
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async ({ email, password, accountType }) => {
    const res = await authService.login({ email, password, accountType });
    if (res?.data) {
      const { user: loggedInUser, token: authToken } = res.data;
      setUser(loggedInUser);
      setToken(authToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('agentmart_token', authToken);
        localStorage.setItem('agentmart_user', JSON.stringify(loggedInUser));
      }
      return loggedInUser;
    }
    throw new Error('Authentication response did not contain user data');
  };

  const register = async (registerData) => {
    const res = await authService.register(registerData);
    if (res?.data) {
      const { user: registeredUser, token: authToken } = res.data;
      setUser(registeredUser);
      setToken(authToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('agentmart_token', authToken);
        localStorage.setItem('agentmart_user', JSON.stringify(registeredUser));
      }
      return registeredUser;
    }
    throw new Error('Registration response did not contain user data');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentmart_token');
      localStorage.removeItem('agentmart_user');
      window.location.href = '/login';
    }
  };

  const accountType = user?.accountType || (user?.role === 'SUPPLIER_REP' ? 'SELLER' : (user?.role ? 'BUYER' : null));
  const isBuyer = accountType === 'BUYER';
  const isSeller = accountType === 'SELLER';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        accountType,
        isBuyer,
        isSeller,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

