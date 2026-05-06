// src/pages/teacher/QuizList.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2, Globe, Lock, Search, FileQuestion } from 'lucide-react';
import AppLayout, { PageHeader } from '../../components/layout/AppLayout';
import { getTeacherQuizzes, deleteQuiz, togglePublish } from '../../services/quizzes.service';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Spinner, EmptyState, ConfirmDialog, useToast, Toast } from '../../components/ui';

export default function QuizList() {
  const { user } = useAuth();
  const [quizzes, setQuizzes]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [delTarget, setDelTarget] = useState(null);
  const toast   = useToast();
  const navigate = useNavigate();

  const load = async () => {
    const data = await getTeacherQuizzes(user.uid);
    // Sort by createdAt descending (Firestore Timestamps)
    data.sort((a, b) => {
      const ta = a.createdAt?.seconds || 0;
      const tb = b.createdAt?.seconds || 0;
      return tb - ta;
    });
    setQuizzes(data);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handleDelete = async (quiz) => {
    try {
      await deleteQuiz(quiz.id);
      toast.success(`Quiz "${quiz.title}" excluído.`);
      load();
    } catch {
      toast.error('Erro ao excluir quiz.');
    }
  };

  const handleTogglePublish = async (quiz) => {
    try {
      await togglePublish(quiz.id, !quiz.isPublished);
      toast.success(quiz.isPublished ? 'Quiz voltou para rascunho.' : 'Quiz publicado!');
      load();
    } catch {
      toast.error('Erro ao alterar status.');
    }
  };

  const filtered = quizzes.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader
        title="Meus Quizzes"
        subtitle={`${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} criado${quizzes.length !== 1 ? 's' : ''}`}
        action={
          <Button onClick={() => navigate('/teacher/quizzes/new')}>
            <PlusCircle size={16} /> Novo Quiz
          </Button>
        }
      />

      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <Input placeholder="Buscar quiz ou matéria..." style={{ paddingLeft: 38 }}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<FileQuestion size={48} />}
            title={search ? 'Nenhum quiz encontrado' : 'Você ainda não criou quizzes'}
            description={search ? 'Tente outro termo de busca.' : 'Crie seu primeiro quiz e comece a engajar seus alunos!'}
            action={!search && (
              <Button onClick={() => navigate('/teacher/quizzes/new')}>
                <PlusCircle size={16} /> Criar Quiz
              </Button>
            )}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((q, i) => (
            <div key={q.id} className="card animate-fade-up"
              style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.05}s`, display: 'flex', flexDirection: 'column' }}>

              {/* Card header strip */}
              <div style={{ height: 6, background: q.isPublished ? 'var(--green)' : 'var(--border)' }} />

              <div style={{ padding: 20, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span className="badge badge-navy">{q.subject}</span>
                  <span className={`badge ${q.isPublished ? 'badge-green' : 'badge-muted'}`}>
                    {q.isPublished ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 6, lineHeight: 1.3 }}>
                  {q.title}
                </h3>

                {q.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                    {q.description.slice(0, 90)}{q.description.length > 90 ? '…' : ''}
                  </p>
                )}

                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FileQuestion size={13} />
                  {q.questionCount || 0} pergunta{q.questionCount !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                padding: '12px 20px', borderTop: '1px solid var(--border)',
                display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/teacher/quizzes/${q.id}/edit`)}>
                  <Pencil size={13} /> Editar
                </Button>
                <Button size="sm" variant={q.isPublished ? 'ghost' : 'amber'}
                  onClick={() => handleTogglePublish(q)}
                  title={q.isPublished ? 'Voltar para rascunho' : 'Publicar quiz'}
                >
                  {q.isPublished ? <Lock size={13} /> : <Globe size={13} />}
                  {q.isPublished ? 'Despublicar' : 'Publicar'}
                </Button>
                <button
                  onClick={() => setDelTarget(q)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6, display: 'flex' }}
                  title="Excluir quiz"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={() => handleDelete(delTarget)}
        title="Excluir Quiz"
        message={`Tem certeza que deseja excluir "${delTarget?.title}"? Esta ação não pode ser desfeita e todas as perguntas serão apagadas.`}
        confirmLabel="Excluir"
        variant="danger"
      />

      <Toast toasts={toast.toasts} remove={toast.remove} />
    </AppLayout>
  );
}
