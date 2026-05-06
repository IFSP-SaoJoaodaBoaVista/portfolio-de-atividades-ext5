// src/services/quizzes.service.js
// CRUD de quizzes e perguntas. Sem Firebase Auth — usa IDs do localStorage.

import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ── Quizzes ─────────────────────────────────────────────────────────────────

export async function createQuiz(quizData, questions, authorId, authorName) {
  const quizRef = await addDoc(collection(db, 'quizzes'), {
    title:         quizData.title,
    subject:       quizData.subject,
    description:   quizData.description || '',
    authorId,
    authorName,
    questionCount: questions.length,
    isPublished:   false,
    createdAt:     serverTimestamp(),
    updatedAt:     serverTimestamp(),
  });

  if (questions.length > 0) {
    const batch = writeBatch(db);
    questions.forEach((q, index) => {
      const qRef = doc(collection(db, 'quizzes', quizRef.id, 'questions'));
      batch.set(qRef, { ...q, order: index + 1 });
    });
    await batch.commit();
  }

  return quizRef.id;
}

export async function getQuiz(quizId) {
  const snap = await getDoc(doc(db, 'quizzes', quizId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getTeacherQuizzes(teacherUid) {
  const q = query(
    collection(db, 'quizzes'),
    where('authorId', '==', teacherUid),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Retorna todos os quizzes publicados — usado pela área do aluno. */
export async function getPublishedQuizzes() {
  const q = query(
    collection(db, 'quizzes'),
    where('isPublished', '==', true),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateQuiz(quizId, quizData, questions) {
  await updateDoc(doc(db, 'quizzes', quizId), {
    title:         quizData.title,
    subject:       quizData.subject,
    description:   quizData.description || '',
    questionCount: questions.length,
    updatedAt:     serverTimestamp(),
  });

  const oldQSnap = await getDocs(collection(db, 'quizzes', quizId, 'questions'));
  const batch = writeBatch(db);
  oldQSnap.docs.forEach(d => batch.delete(d.ref));
  questions.forEach((q, index) => {
    const qRef = doc(collection(db, 'quizzes', quizId, 'questions'));
    batch.set(qRef, { ...q, order: index + 1 });
  });
  await batch.commit();
}

export async function deleteQuiz(quizId) {
  const batch = writeBatch(db);
  const qSnap = await getDocs(collection(db, 'quizzes', quizId, 'questions'));
  qSnap.docs.forEach(d => batch.delete(d.ref));
  batch.delete(doc(db, 'quizzes', quizId));
  await batch.commit();
}

export async function togglePublish(quizId, isPublished) {
  await updateDoc(doc(db, 'quizzes', quizId), { isPublished, updatedAt: serverTimestamp() });
}

// ── Questions ────────────────────────────────────────────────────────────────

export async function getQuestions(quizId) {
  const snap = await getDocs(
    query(collection(db, 'quizzes', quizId, 'questions'), orderBy('order'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
