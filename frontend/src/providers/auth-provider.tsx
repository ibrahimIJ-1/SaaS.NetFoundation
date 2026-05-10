'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/types/auth';
import { apiClient } from '@/services/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  tenantId: string | null;
  isLoading: boolean;
  login: (token: string, tenantId: string, user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasFeature: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = Cookies.get('token');
      const storedTenantId = Cookies.get('tenantId');

      if (storedToken && storedTenantId) {
        setToken(storedToken);
        setTenantId(storedTenantId);
        
        try {
          // Verify token and fetch latest user data
          const response = await apiClient.get<User>('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to verify session', error);
          Cookies.remove('token');
          Cookies.remove('tenantId');
          setToken(null);
          setTenantId(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newTenantId: string, newUser: User) => {
    Cookies.set('token', newToken, { secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    Cookies.set('tenantId', newTenantId, { secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    
    setToken(newToken);
    setTenantId(newTenantId);
    setUser(newUser);
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('tenantId');
    setToken(null);
    setTenantId(null);
    setUser(null);
    window.location.href = '/login';
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return user.roles.includes('Admin') || user.permissions.includes(permission);
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    return user.roles.includes('Admin') || user.roles.includes(role);
  };

  const hasFeature = (feature: string) => {
    if (!user) return false;
    return user.features.includes(feature);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, tenantId, isLoading, login, logout, hasPermission, hasRole, hasFeature }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
