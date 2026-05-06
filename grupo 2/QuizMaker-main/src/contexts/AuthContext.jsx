// src/contexts/AuthContext.jsx
// Identidade baseada em localStorage — sem Firebase Auth.
// Papéis: 'teacher' | 'student' | 'admin'

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Credenciais fixas do admin (em produção usar env ou Firestore)
const ADMIN_EMAIL    = 'admin@quizmaker.app';
const ADMIN_PASSWORD = 'admin123';

function generateId() {
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function AuthProvider({ children }) {
  const [identity, setIdentity] = useState(() => {
    try {
      const raw = localStorage.getItem('qm_identity');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const enter = useCallback((name, role) => {
    let id;
    try {
      const raw = localStorage.getItem('qm_identity');
      id = raw ? JSON.parse(raw).id : generateId();
    } catch {
      id = generateId();
    }
    const newIdentity = { id, name: name.trim(), role };
    localStorage.setItem('qm_identity', JSON.stringify(newIdentity));
    setIdentity(newIdentity);
  }, []);

  /** Login do admin via email + senha */
  const adminLogin = useCallback((email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminIdentity = { id: 'admin-root', name: 'Administrador', role: 'admin' };
      localStorage.setItem('qm_identity', JSON.stringify(adminIdentity));
      setIdentity(adminIdentity);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('qm_identity');
    setIdentity(null);
  }, []);

  const value = {
    user:      identity ? { uid: identity.id } : null,
    profile:   identity ? { ...identity, uid: identity.id } : null,
    loading:   false,
    isAdmin:   identity?.role === 'admin',
    isTeacher: identity?.role === 'teacher',
    isStudent: identity?.role === 'student',
    enter,
    adminLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
