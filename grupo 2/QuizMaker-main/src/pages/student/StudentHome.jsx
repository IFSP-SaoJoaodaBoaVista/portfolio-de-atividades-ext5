// src/pages/student/StudentHome.jsx
// Tela do aluno: lista de quizzes publicados com filtro por matéria.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, FileQuestion, PlayCircle } from 'lucide-react';
import AppLayout, { PageHeader } from '../../components/layout/AppLayout';
import { getPublishedQuizzes } from '../../services/quizzes.service';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Spinner, EmptyState } from '../../components/ui';

export default function StudentHome() {
  const { profile } = useAuth();
  const navigate    = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    getPublishedQuizzes().then(data => {
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setQuizzes(data);
      setLoading(false);
    });
  }, []);

  // Collect unique subjects from available quizzes
  const subjects = [...new Set(quizzes.map(q => q.subject).filter(Boolean))].sort();

  const filtered = quizzes.filter(q => {
    const matchSearch  = !search  || q.title?.toLowerCase().includes(search.toLowerCase()) || q.subject?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subject || q.subject === subject;
    return matchSearch && matchSubject;
  });

  const SUBJECT_COLORS = {
    'Matemática': '#3B82F6', 'Português': '#8B5CF6', 'Ciências': '#10B981',
    'História': '#F59E0B', 'Geografia': '#14B8A6', 'Física': '#6366F1',
    'Química': '#EC4899', 'Biologia': '#22C55E', 'Inglês': '#F97316',
    'Filosofia': '#A78BFA', 'Sociologia': '#FB923C', 'Artes': '#E879F9',
    'Educação Física': '#34D399',
  };
  const color = (s) => SUBJECT_COLORS[s] || 'var(--navy)';

  return (
    <AppLayout>
      <PageHeader
        title={`Olá, ${profile?.name?.split(' ')[0] || 'Aluno'}! 🎓`}
        subtitle="Escolha um quiz para começar"
      />

      {/* Search + subject filter */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <Input
            placeholder="Buscar quiz..."
            style={{ paddingLeft: 38 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setSubject('')}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${!subject ? 'var(--navy)' : 'var(--border)'}`,
              background: !subject ? 'var(--navy)' : 'var(--white)',
              color: !subject ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            Todas
          </button>
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSubject(s === subject ? '' : s)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${subject === s ? color(s) : 'var(--border)'}`,
                background: subject === s ? color(s) : 'var(--white)',
                color: subject === s ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="📚"
            title={search || subject ? 'Nenhum quiz encontrado' : 'Nenhum quiz disponível ainda'}
            description={search || subject ? 'Tente outros filtros.' : 'Aguarde seu professor publicar um quiz!'}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {filtered.map((q, i) => (
            <div
              key={q.id}
              className="card animate-fade-up"
              style={{
                padding: 0, overflow: 'hidden', cursor: 'pointer',
                animationDelay: `${i * 0.05}s`,
                transition: 'transform 0.15s, box-shadow 0.15s',
                display: 'flex', flexDirection: 'column',
              }}
              onClick={() => navigate(`/student/quiz/${q.id}`)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {/* Colored top strip */}
              <div style={{ height: 5, background: color(q.subject) }} />

              <div style={{ padding: '18px 20px 14px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 999,
                    background: color(q.subject) + '22',
                    color: color(q.subject),
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>
                    <BookOpen size={11} /> {q.subject}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 6, lineHeight: 1.3 }}>
                  {q.title}
                </h3>

                {q.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                    {q.description.slice(0, 80)}{q.description.length > 80 ? '…' : ''}
                  </p>
                )}

                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <FileQuestion size={13} /> {q.questionCount || 0} pergunta{q.questionCount !== 1 ? 's' : ''}
                  {q.authorName && (
                    <span style={{ marginLeft: 8 }}>· {q.authorName}</span>
                  )}
                </div>
              </div>

              {/* CTA footer */}
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 8,
                color: color(q.subject), fontWeight: 700, fontSize: 13,
              }}>
                <PlayCircle size={16} /> Iniciar quiz
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
