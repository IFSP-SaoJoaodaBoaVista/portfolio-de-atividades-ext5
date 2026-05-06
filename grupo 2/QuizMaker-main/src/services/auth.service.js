// src/services/auth.service.js
// Toda a lógica de autenticação em um único lugar.

import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { auth, firebaseConfig } from '../firebase/config';

const AUTH_ERRORS = {
  'auth/user-not-found':    'Usuário não encontrado.',
  'auth/wrong-password':    'Senha incorreta.',
  'auth/invalid-credential':'E-mail ou senha inválidos.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/weak-password':     'A senha deve ter pelo menos 6 caracteres.',
  'auth/invalid-email':     'E-mail inválido.',
};

export async function login(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { user: credential.user, error: null };
  } catch (err) {
    return { user: null, error: AUTH_ERRORS[err.code] || 'Erro ao fazer login.' };
  }
}

export async function logout() {
  await signOut(auth);
}

/**
 * Cria um usuário no Firebase Auth usando um app secundário,
 * para não fazer logout da sessão do admin.
 */
export async function createAuthUser(email, password) {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    return { uid: credential.user.uid, error: null };
  } catch (err) {
    return { uid: null, error: AUTH_ERRORS[err.code] || 'Erro ao criar usuário.' };
  } finally {
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);
  }
}
