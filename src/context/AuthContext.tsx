import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string, role: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check institutional session
    fetch('/api/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 2. Ensure Firebase session for Firestore access
    // We make this silent as it might be restricted, but relaxed rules will allow read access
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        signInAnonymously(auth).catch(() => {
          // Silent failure if admin restricted operation
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (userId: string, role: any, name: string) => {
    setUser({ userId, role, name } as any);
  };

  const logout = () => {
    fetch('/api/logout', { method: 'POST' }).finally(() => {
      setUser(null);
      window.location.href = '/login';
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
