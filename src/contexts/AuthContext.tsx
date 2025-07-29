import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: { [key: string]: User } = {
  'owner': {
    id: '1',
    username: 'owner',
    role: 'owner',
    name: 'Factory Owner'
  },
  'worker': {
    id: '2',
    username: 'worker',
    role: 'worker',
    name: 'Factory Worker'
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    // Simple auth check (in real app, this would be API call)
    if ((username === 'owner' && password === 'owner123') || 
        (username === 'worker' && password === 'worker123')) {
      setUser(mockUsers[username]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};