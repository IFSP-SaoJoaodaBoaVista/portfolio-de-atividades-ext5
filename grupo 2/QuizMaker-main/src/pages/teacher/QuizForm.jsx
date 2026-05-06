// src/pages/teacher/QuizForm.jsx
// Formulário compartilhado para criar e editar quizzes.
// Suporta adição/remoção dinâmica de perguntas e alternativas.

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Trash2, ChevronUp, ChevronDown, CheckCircle, ArrowLeft, Save } from 'lucide-react';
import AppLayout, { PageHeader } from '../../components/layout/AppLayout';
import { createQuiz, updateQuiz, getQuiz, getQuestions } from '../../services/quizzes.service';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Field, Input, Select, Textarea, Spinner, useToast, Toast } from '../../components/ui';

const SUBJECTS = [
  'Matemática','Português','Ciências','História','Geografia',
  'Física','Química','Biologia','Inglês','Filosofia','Sociologia','Artes','Educação Física',
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function emptyOption(id) {
  return { id, text: '' };
}

function emptyQuestion() {
  return {
    _key: Math.random().toString(36).slice(2),
    text: '',
    options: ['a','b','c','d'].map(id => emptyOption(id)),
    correctOptionId: 'a',
    explanation: '',
  };
}

/* ── Single question editor ─────────────────────────────────────────────── */
function QuestionEditor({ question, index, total, onChange, onRemove, onMove }) {
  const update = (field, value) => onChange({ ...question, [field]: value });
  const updateOption = (optId, text) =>
    onChange({ ...question, options: question.options.map(o => o.id === optId ? { ...o, text } : o) });

  return (
    <div className="card" style={{ padding: 24, marginBottom: 16, border: question.text ? '1px solid var(--border)' : '1.5px solid var(--amber)' }}>
      {/* Question header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--navy)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)', flex: 1 }}>
          Pergunta {index + 1}
        </span>

        {/* Move up/down */}
        <button disabled={index === 0} onClick={() => onMove(index, -1)}
          style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: 'var(--text-muted)', opacity: index === 0 ? 0.3 : 1, padding: 4, display: 'flex' }}>
          <ChevronUp size={16} />
        </button>
        <button disabled={index === total - 1} onClick={() => onMove(index, 1)}
          style={{ background: 'none', border: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer', color: 'var(--text-muted)', opacity: index === total - 1 ? 0.3 : 1, padding: 4, display: 'flex' }}>
          <ChevronDown size={16} />
        </button>
        <button onClick={onRemove} disabled={total === 1}
          style={{ background: 'none', border: 'none', cursor: total === 1 ? 'not-allowed' : 'pointer', color: total === 1 ? 'var(--border)' : 'var(--red)', padding: 4, display: 'flex' }}>
          <Trash2 size={16} />
        </button>
      </div>

      {/* Question text */}
      <Field label="Enunciado da pergunta">
        <Textarea
          placeholder="Digite a pergunta aqui..."
          value={question.text}
          onChange={e => update('text', e.target.value)}
          rows={2}
        />
      </Field>

      {/* Options */}
      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 10 }}>
          Alternativas <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(marque a correta)</span>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {question.options.map((opt, oi) => {
            const isCorrect = question.correctOptionId === opt.id;
            return (
              <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Radio / correct indicator */}
                <button
                  type="button"
                  onClick={() => update('correctOptionId', opt.id)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${isCorrect ? 'var(--green)' : 'var(--border)'}`,
                    background: isCorrect ? 'var(--green)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  title="Marcar como correta"
                >
                  {isCorrect
                    ? <CheckCircle size={16} color="#fff" />
                    : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>{OPTION_LABELS[oi]}</span>
                  }
                </button>
                <Input
                  placeholder={`Alternativa ${OPTION_LABELS[oi]}`}
                  value={opt.text}
                  onChange={e => updateOption(opt.id, e.target.value)}
                  style={{ flex: 1, borderColor: isCorrect ? 'var(--green)' : undefined }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation (optional) */}
      <div style={{ marginTop: 14 }}>
        <Field label="Explicação (opcional)" hint="Mostrada ao aluno após responder">
          <Textarea
            placeholder="Ex: A resposta correta é B porque..."
            value={question.explanation}
            onChange={e => update('explanation', e.target.value)}
            rows={2}
          />
        </Field>
      </div>
    </div>
  );
}

/* ── Main form page ─────────────────────────────────────────────────────── */
export default function QuizForm() {
  const { quizId } = useParams();
  const isEditing  = !!quizId;
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();

  const [loading, setLoading]   = useState(isEditing);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  // Quiz metadata
  const [title, setTitle]         = useState('');
  const [subject, setSubject]     = useState('');
  const [description, setDesc]    = useState('');

  // Questions
  const [questions, setQuestions] = useState([emptyQuestion()]);

  // Load existing quiz if editing
  useEffect(() => {
    if (!isEditing) return;
    async function load() {
      try {
        const [quiz, qs] = await Promise.all([getQuiz(quizId), getQuestions(quizId)]);
        if (!quiz) { navigate('/teacher/quizzes'); return; }
        setTitle(quiz.title);
        setSubject(quiz.subject);
        setDesc(quiz.description || '');
        if (qs.length > 0) {
          setQuestions(qs.map(q => ({
            _key: q.id,
            text: q.text,
            options: q.options,
            correctOptionId: q.correctOptionId,
            explanation: q.explanation || '',
          })));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quizId]);

  /* ── Question helpers ─────────────────────────────────────────────────── */
  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);

  const removeQuestion = (idx) =>
    setQuestions(prev => prev.filter((_, i) => i !== idx));

  const updateQuestion = (idx, updated) =>
    setQuestions(prev => prev.map((q, i) => i === idx ? updated : q));

  const moveQuestion = (idx, dir) => {
    setQuestions(prev => {
      const arr = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
  };

  /* ── Validation ───────────────────────────────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!title.trim())   errs.title   = 'Título é obrigatório';
    if (!subject)        errs.subject = 'Selecione uma matéria';
    questions.forEach((q, i) => {
      if (!q.text.trim()) errs[`q_${i}_text`] = `Pergunta ${i + 1}: enunciado obrigatório`;
      q.options.forEach((o, oi) => {
        if (!o.text.trim()) errs[`q_${i}_opt_${oi}`] = `Pergunta ${i + 1}: alternativa ${OPTION_LABELS[oi]} obrigatória`;
      });
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Save ─────────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!validate()) {
      toast.error('Corrija os erros antes de salvar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    try {
      const quizData   = { title: title.trim(), subject, description: description.trim() };
      const questionData = questions.map(({ _key, ...q }) => q);

      if (isEditing) {
        await updateQuiz(quizId, quizData, questionData);
        toast.success('Quiz atualizado com sucesso!');
      } else {
        const newId = await createQuiz(quizData, questionData, user.uid, profile.name);
        toast.success('Quiz criado com sucesso!');
        navigate(`/teacher/quizzes/${newId}/edit`, { replace: true });
      }
    } catch (err) {
      toast.error('Erro ao salvar quiz. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={36} /></div>
      </AppLayout>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <AppLayout>
      <PageHeader
        title={isEditing ? 'Editar Quiz' : 'Novo Quiz'}
        subtitle={isEditing ? `Editando "${title}"` : 'Preencha os dados e adicione as perguntas'}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={() => navigate('/teacher/quizzes')}>
              <ArrowLeft size={15} /> Voltar
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save size={15} /> {isEditing ? 'Salvar Alterações' : 'Criar Quiz'}
            </Button>
          </div>
        }
      />

      {/* Error summary */}
      {hasErrors && (
        <div style={{
          padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FCA5A5',
          borderRadius: '8px', marginBottom: 24, fontSize: 13, color: 'var(--red)',
        }}>
          ⚠️ Há {Object.keys(errors).length} campo{Object.keys(errors).length > 1 ? 's' : ''} com erro. Revise antes de salvar.
        </div>
      )}

      {/* Quiz metadata */}
      <div className="card animate-fade-up" style={{ padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>
          Informações do Quiz
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>
          <Field label="Título do Quiz" error={errors.title}>
            <Input
              placeholder="Ex: Revisão de Frações — 6º Ano"
              value={title}
              onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: undefined })); }}
              error={errors.title}
            />
          </Field>
          <Field label="Matéria" error={errors.subject}>
            <Select
              value={subject}
              onChange={e => { setSubject(e.target.value); if (errors.subject) setErrors(p => ({ ...p, subject: undefined })); }}
              error={errors.subject}
            >
              <option value="">Selecione...</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </div>
        <div style={{ marginTop: 20 }}>
          <Field label="Descrição (opcional)">
            <Textarea
              placeholder="Uma breve descrição do conteúdo abordado neste quiz..."
              value={description}
              onChange={e => setDesc(e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Questions section */}
      <div className="animate-fade-up animate-delay-1">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>
            Perguntas <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 14 }}>({questions.length})</span>
          </h2>
          <Button variant="secondary" size="sm" onClick={addQuestion}>
            <PlusCircle size={14} /> Adicionar Pergunta
          </Button>
        </div>

        {questions.map((q, i) => (
          <QuestionEditor
            key={q._key}
            question={q}
            index={i}
            total={questions.length}
            onChange={(updated) => updateQuestion(i, updated)}
            onRemove={() => removeQuestion(i)}
            onMove={(idx, dir) => moveQuestion(idx, dir)}
          />
        ))}

        <div style={{ marginTop: 8, marginBottom: 40 }}>
          <Button variant="secondary" fullWidth onClick={addQuestion} style={{ borderStyle: 'dashed' }}>
            <PlusCircle size={16} /> Adicionar mais uma pergunta
          </Button>
        </div>

        {/* Bottom save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 32 }}>
          <Button variant="secondary" onClick={() => navigate('/teacher/quizzes')}>
            <ArrowLeft size={15} /> Cancelar
          </Button>
          <Button onClick={handleSave} loading={saving} size="lg">
            <Save size={16} /> {isEditing ? 'Salvar Alterações' : 'Criar Quiz'}
          </Button>
        </div>
      </div>

      <Toast toasts={toast.toasts} remove={toast.remove} />
    </AppLayout>
  );
}
