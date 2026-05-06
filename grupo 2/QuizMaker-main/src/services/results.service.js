// src/services/results.service.js
// Salva e lê resultados de quizzes no Firestore.

import {
  collection, addDoc, getDocs, query,
  where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Salva o resultado de um quiz respondido por um aluno.
 */
export async function saveResult({ quizId, quizTitle, subject, authorId, studentId, studentName, score, total }) {
  return addDoc(collection(db, 'results'), {
    quizId,
    quizTitle,
    subject,
    authorId,       // UID do professor dono do quiz
    studentId,      // UID/ID do aluno (localStorage)
    studentName,
    score,
    total,
    pct: Math.round((score / total) * 100),
    createdAt: serverTimestamp(),
  });
}

/** Histórico completo de um aluno. */
export async function getStudentHistory(studentId) {
  const q = query(
    collection(db, 'results'),
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Resultados de todos os quizzes de um professor. */
export async function getTeacherResults(authorId) {
  const q = query(
    collection(db, 'results'),
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Todos os resultados — para o admin. */
export async function getAllResults() {
  const q = query(collection(db, 'results'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
