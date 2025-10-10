'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  email: string;
  userType: 'BUYER' | 'SUPPLIER' | 'ADMIN';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a logged-in buyer user for the demo
    setUser({
      email: 'demo@buyer.com',
      userType: 'BUYER'
    });
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
