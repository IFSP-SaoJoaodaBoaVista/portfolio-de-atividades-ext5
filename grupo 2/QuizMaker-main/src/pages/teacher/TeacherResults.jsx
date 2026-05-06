// src/pages/teacher/TeacherResults.jsx
// Painel de pontuações dos alunos para os quizzes do professor.

import { useEffect, useState } from 'react';
import { Users, TrendingUp, Award, FileQuestion } from 'lucide-react';
import AppLayout, { PageHeader, StatCard } from '../../components/layout/AppLayout';
import { getTeacherResults } from '../../services/results.service';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, EmptyState } from '../../components/ui';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function pctColor(pct) {
  if (pct === 100) return 'var(--amber-dark)';
  if (pct >= 60)   return 'var(--green)';
  return 'var(--red)';
}

export default function TeacherResults() {
  const { user } = useAuth();
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterQuiz, setFilter] = useState('');

  useEffect(() => {
    if (!user) return;
    getTeacherResults(user.uid)
      .then(data => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  // Unique quiz titles for filter
  const quizTitles = [...new Set(results.map(r => r.quizTitle))].sort();

  const filtered = filterQuiz ? results.filter(r => r.quizTitle === filterQuiz) : results;

  // Stats
  const total    = results.length;
  const students = new Set(results.map(r => r.studentId)).size;
  const avgPct   = total ? Math.round(results.reduce((s, r) => s + r.pct, 0) / total) : 0;
  const perfect  = results.filter(r => r.pct === 100).length;

  return (
    <AppLayout>
      <PageHeader title="Pontuações dos Alunos" subtitle="Resultados dos seus quizzes publicados" />

      {/* Stats */}
      {!loading && total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }} className="animate-fade-up">
          <StatCard label="Total de Respostas" value={total}    icon={FileQuestion} color="var(--navy)" />
          <StatCard label="Alunos Únicos"       value={students} icon={Users}        color="var(--navy-300)" />
          <StatCard label="Média de Acerto"      value={`${avgPct}%`} icon={TrendingUp} color="var(--amber-dark)" />
          <StatCard label="Notas 100%"           value={perfect}  icon={Award}       color="var(--green)" />
        </div>
      )}

      {/* Filter by quiz */}
      {!loading && quizTitles.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }} className="animate-fade-up">
          <button
            onClick={() => setFilter('')}
            style={{
              padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${!filterQuiz ? 'var(--navy)' : 'var(--border)'}`,
              background: !filterQuiz ? 'var(--navy)' : 'var(--white)',
              color: !filterQuiz ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Todos
          </button>
          {quizTitles.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t === filterQuiz ? '' : t)}
              style={{
                padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${filterQuiz === t ? 'var(--navy)' : 'var(--border)'}`,
                background: filterQuiz === t ? 'var(--navy)' : 'var(--white)',
                color: filterQuiz === t ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="📊"
            title="Nenhum resultado ainda"
            description="Quando alunos responderem seus quizzes publicados, os resultados aparecerão aqui."
          />
        </div>
      ) : (
        <div className="card animate-fade-up" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Aluno', 'Quiz', 'Pontuação', 'Acerto', 'Data'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const color = pctColor(r.pct);
                return (
                  <tr key={r.id} className="animate-fade-up"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', animationDelay: `${i * 0.03}s` }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>🎓 {r.studentName}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 200 }}>{r.quizTitle}</div>
                      {r.subject && <span className="badge badge-navy" style={{ fontSize: 10, marginTop: 4 }}>{r.subject}</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color }}>
                        {r.score}/{r.total}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: color, borderRadius: 999, width: `${r.pct}%` }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color }}>{r.pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
