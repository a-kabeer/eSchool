import React, { createContext, useContext, useState } from 'react';
import type { AuthUser, UserRole } from '@/types';

interface AuthContextValue {
  user: AuthUser;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
  can: (action: 'view' | 'create' | 'edit' | 'delete' | 'export') => boolean;
}

const DEFAULT_USER: AuthUser = {
  id: 'usr-01',
  name: 'Jonathan Deo',
  email: 'jonathan.deo@materialm.io',
  role: 'Admin',
  title: 'Product Operations Lead',
  department: 'Executive & Product',
  avatarInitials: 'JD',
  location: 'San Francisco, USA',
};

const ROLE_CAPABILITIES: Record<UserRole, Record<'view' | 'create' | 'edit' | 'delete' | 'export', boolean>> = {
  Admin: { view: true, create: true, edit: true, delete: true, export: true },
  Manager: { view: true, create: true, edit: true, delete: false, export: true },
  Viewer: { view: true, create: false, edit: false, delete: false, export: false },
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (email: string, name?: string) => {
    const derivedName =
      name && name.trim()
        ? name.trim()
        : email
            .split('@')[0]
            .replace(/[._-]+/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    const initials = derivedName
      .split(' ')
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? '')
      .join('');
    setUser((prev) => ({
      ...prev,
      email,
      name: derivedName || prev.name,
      avatarInitials: initials || prev.avatarInitials,
    }));
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const setRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }));
  };

  const updateProfile = (patch: Partial<AuthUser>) => {
    setUser((prev) => ({ ...prev, ...patch }));
  };

  const can = (action: 'view' | 'create' | 'edit' | 'delete' | 'export') => {
    return ROLE_CAPABILITIES[user.role][action];
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, setRole, updateProfile, can }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
