// src/pages/teacher/TeacherDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileQuestion, PlusCircle, CheckCircle } from 'lucide-react';
import AppLayout, { PageHeader, StatCard } from '../../components/layout/AppLayout';
import { getTeacherQuizzes } from '../../services/quizzes.service';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Spinner } from '../../components/ui';

export default function TeacherDashboard() {
  const { user, profile } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getTeacherQuizzes(user.uid).then(data => { setQuizzes(data); setLoading(false); });
    }
  }, [user]);

  const published = quizzes.filter(q => q.isPublished).length;
  const totalQ    = quizzes.reduce((s, q) => s + (q.questionCount || 0), 0);

  return (
    <AppLayout>
      <PageHeader
        title={`Olá, ${profile?.name?.split(' ')[0] || 'Professor'}! 👋`}
        subtitle="Aqui está um resumo da sua atividade"
        action={
          <Button onClick={() => navigate('/teacher/quizzes/new')}>
            <PlusCircle size={16} /> Novo Quiz
          </Button>
        }
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
            <div className="animate-fade-up animate-delay-1">
              <StatCard label="Meus Quizzes" value={quizzes.length} icon={BookOpen} color="var(--navy)" />
            </div>
            <div className="animate-fade-up animate-delay-2">
              <StatCard label="Publicados" value={published} icon={CheckCircle} color="var(--green)" />
            </div>
            <div className="animate-fade-up animate-delay-3">
              <StatCard label="Total de Perguntas" value={totalQ} icon={FileQuestion} color="var(--amber-dark)" />
            </div>
          </div>

          {/* Recent quizzes */}
          <div className="animate-fade-up animate-delay-4">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
              Quizzes Recentes
            </h2>
            {quizzes.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                  Você ainda não criou nenhum quiz. Comece agora!
                </p>
                <Button onClick={() => navigate('/teacher/quizzes/new')}>
                  <PlusCircle size={16} /> Criar meu primeiro quiz
                </Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {quizzes.slice(0, 6).map((q, i) => (
                  <div key={q.id} className="card" style={{ padding: 20, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', animationDelay: `${i * 0.05}s` }}
                    onClick={() => navigate(`/teacher/quizzes/${q.id}/edit`)}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span className="badge badge-navy">{q.subject}</span>
                      <span className={`badge ${q.isPublished ? 'badge-green' : 'badge-muted'}`}>
                        {q.isPublished ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 6, lineHeight: 1.3 }}>
                      {q.title}
                    </h3>
                    {q.description && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                        {q.description.slice(0, 80)}{q.description.length > 80 ? '…' : ''}
                      </p>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileQuestion size={13} /> {q.questionCount || 0} pergunta{q.questionCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {quizzes.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button variant="secondary" onClick={() => navigate('/teacher/quizzes')}>
                Ver todos os quizzes
              </Button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
