// src/services/users.service.js
// CRUD de usuários no Firestore.

import {
  doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  collection, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { createAuthUser } from './auth.service';

export async function createTeacher({ name, email, password, subjects }, adminUid) {
  // 1. Criar conta no Firebase Auth (app secundário)
  const { uid, error } = await createAuthUser(email, password);
  if (error) throw new Error(error);

  // 2. Criar perfil no Firestore
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    name,
    role: 'teacher',
    subjects: subjects || [],
    active: true,
    createdBy: adminUid,
    createdAt: serverTimestamp(),
  });

  return uid;
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listTeachers() {
  const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateTeacher(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleTeacherActive(uid, active) {
  await updateDoc(doc(db, 'users', uid), { active });
}

export async function listAllQuizzes() {
  const snap = await getDocs(collection(db, 'quizzes'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
