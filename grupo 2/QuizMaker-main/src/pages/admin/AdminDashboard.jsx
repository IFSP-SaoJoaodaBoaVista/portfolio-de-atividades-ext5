// src/pages/admin/AdminDashboard.jsx
// Admin com acesso total: vê todos quizzes, pode excluir/editar qualquer um, vê todos os resultados.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileQuestion, BookOpen, TrendingUp, Trash2, Pencil,
  Globe, Lock, Search, Award, ChevronDown, ChevronUp
} from 'lucide-react';
import AppLayout, { PageHeader, StatCard } from '../../components/layout/AppLayout';
import { listAllQuizzes } from '../../services/users.service';
import { deleteQuiz, togglePublish } from '../../services/quizzes.service';
import { getAllResults } from '../../services/results.service';
import {
  Spinner, Input, Button, ConfirmDialog, useToast, Toast, EmptyState
} from '../../components/ui';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function pctColor(pct) {
  if (pct === 100) return 'var(--amber-dark)';
  if (pct >= 60)   return 'var(--green)';
  return 'var(--red)';
}

/* ── Tab: All Quizzes ─────────────────────────────────────────────────────── */
function AllQuizzesTab({ quizzes, loading, onRefresh }) {
  const navigate     = useNavigate();
  const toast        = useToast();
  const [search, setSearch]     = useState('');
  const [delTarget, setDelTarget] = useState(null);

  const filtered = quizzes.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.subject?.toLowerCase().includes(search.toLowerCase()) ||
    q.authorName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (quiz) => {
    try {
      await deleteQuiz(quiz.id);
      toast.success(`Quiz "${quiz.title}" excluído.`);
      onRefresh();
    } catch {
      toast.error('Erro ao excluir quiz.');
    }
  };

  const handleToggle = async (quiz) => {
    try {
      await togglePublish(quiz.id, !quiz.isPublished);
      toast.success(quiz.isPublished ? 'Quiz despublicado.' : 'Quiz publicado!');
      onRefresh();
    } catch {
      toast.error('Erro ao alterar status.');
    }
  };

  return (
    <>
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <Input placeholder="Buscar quiz, matéria ou professor..." style={{ paddingLeft: 38 }}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon="📝" title="Nenhum quiz encontrado" description="Ainda não há quizzes na plataforma." /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map((q, i) => (
            <div key={q.id} className="card animate-fade-up" style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.04}s`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 5, background: q.isPublished ? 'var(--green)' : 'var(--border)' }} />
              <div style={{ padding: '16px 18px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="badge badge-navy">{q.subject}</span>
                  <span className={`badge ${q.isPublished ? 'badge-green' : 'badge-muted'}`}>
                    {q.isPublished ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 4, lineHeight: 1.3 }}>{q.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  👨‍🏫 {q.authorName || '—'} · {formatDate(q.createdAt)}
                </p>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FileQuestion size={12} /> {q.questionCount || 0} pergunta{q.questionCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/quizzes/${q.id}/edit`)}>
                  <Pencil size={13} /> Editar
                </Button>
                <Button size="sm" variant={q.isPublished ? 'ghost' : 'amber'} onClick={() => handleToggle(q)}>
                  {q.isPublished ? <Lock size={13} /> : <Globe size={13} />}
                  {q.isPublished ? 'Despublicar' : 'Publicar'}
                </Button>
                <button
                  onClick={() => setDelTarget(q)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 6, borderRadius: 6, display: 'flex' }}
                  title="Excluir quiz"
                >
                  <Trash2 size={15} />
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
        message={`Excluir "${delTarget?.title}" de ${delTarget?.authorName}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
      />
      <Toast toasts={toast.toasts} remove={toast.remove} />
    </>
  );
}

/* ── Tab: All Results ─────────────────────────────────────────────────────── */
function AllResultsTab({ results, loading }) {
  const [search, setSearch] = useState('');

  const filtered = results.filter(r =>
    r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    r.quizTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <Input placeholder="Buscar aluno ou quiz..." style={{ paddingLeft: 38 }}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon="📊" title="Nenhum resultado ainda" description="Os alunos ainda não responderam nenhum quiz." /></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Aluno', 'Quiz', 'Professor', 'Pontuação', 'Acerto', 'Data'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const color = pctColor(r.pct);
                return (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, color: 'var(--navy)' }}>🎓 {r.studentName}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', maxWidth: 180 }}>{r.quizTitle}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{r.authorName || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color, fontSize: 14 }}>{r.score}/{r.total}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 48, height: 5, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: color, borderRadius: 999, width: `${r.pct}%` }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color }}>{r.pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ── Main Admin Dashboard ─────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [quizzes, setQuizzes]   = useState([]);
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('quizzes'); // 'quizzes' | 'results'

  const load = async () => {
    setLoading(true);
    try {
      const [qz, rs] = await Promise.all([listAllQuizzes(), getAllResults()]);
      setQuizzes(qz);
      setResults(rs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const published = quizzes.filter(q => q.isPublished).length;
  const students  = new Set(results.map(r => r.studentId)).size;
  const avgPct    = results.length ? Math.round(results.reduce((s, r) => s + r.pct, 0) / results.length) : 0;

  return (
    <AppLayout>
      <PageHeader title="Painel Administrativo" subtitle="Visão geral e controle total da plataforma" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }} className="animate-fade-up">
        <StatCard label="Total de Quizzes"    value={quizzes.length} icon={FileQuestion} color="var(--navy)" />
        <StatCard label="Quizzes Publicados"  value={published}      icon={BookOpen}     color="var(--green)" />
        <StatCard label="Respostas de Alunos" value={results.length} icon={TrendingUp}   color="var(--amber-dark)" />
        <StatCard label="Alunos Únicos"       value={students}       icon={Users}        color="var(--navy-300)" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {[
          { key: 'quizzes', label: `Todos os Quizzes (${quizzes.length})` },
          { key: 'results', label: `Resultados (${results.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 20px', fontWeight: 600, fontSize: 14,
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t.key ? 'var(--navy)' : 'var(--text-muted)',
              borderBottom: tab === t.key ? '2px solid var(--navy)' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.15s',
              fontFamily: 'var(--font-body)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'quizzes' && <AllQuizzesTab quizzes={quizzes} loading={loading} onRefresh={load} />}
      {tab === 'results' && <AllResultsTab results={results} loading={loading} />}
    </AppLayout>
  );
}
