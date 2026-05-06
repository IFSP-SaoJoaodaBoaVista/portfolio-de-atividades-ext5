// src/pages/student/StudentHistory.jsx
// Histórico de quizzes respondidos pelo aluno.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Trophy, RotateCcw, ArrowLeft, BookOpen } from 'lucide-react';
import AppLayout, { PageHeader } from '../../components/layout/AppLayout';
import { getStudentHistory } from '../../services/results.service';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Spinner, EmptyState } from '../../components/ui';

function pctColor(pct) {
  if (pct === 100) return 'var(--amber-dark)';
  if (pct >= 60)   return 'var(--green)';
  return 'var(--red)';
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function StudentHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getStudentHistory(user.uid)
      .then(data => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  // Summary stats
  const total    = results.length;
  const avgPct   = total ? Math.round(results.reduce((s, r) => s + r.pct, 0) / total) : 0;
  const best     = total ? Math.max(...results.map(r => r.pct)) : 0;
  const perfect  = results.filter(r => r.pct === 100).length;

  return (
    <AppLayout>
      <PageHeader
        title="Meu Histórico"
        subtitle="Quizzes que você respondeu"
        action={
          <Button variant="secondary" onClick={() => navigate('/student')}>
            <ArrowLeft size={15} /> Voltar
          </Button>
        }
      />

      {/* Summary cards */}
      {!loading && total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }} className="animate-fade-up">
          {[
            { label: 'Quizzes Feitos',  value: total,     icon: '📝', color: 'var(--navy)' },
            { label: 'Média de Acerto', value: `${avgPct}%`, icon: '📊', color: 'var(--navy-300)' },
            { label: 'Melhor Pontuação', value: `${best}%`, icon: '🏆', color: 'var(--amber-dark)' },
            { label: 'Resultados 100%', value: perfect,   icon: '⭐', color: 'var(--green)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={32} /></div>
      ) : results.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="📚"
            title="Nenhum quiz respondido ainda"
            description="Vá para a página inicial e complete um quiz para ver seu histórico aqui."
            action={<Button onClick={() => navigate('/student')}>Ver Quizzes</Button>}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="animate-fade-up">
          {results.map((r, i) => {
            const color = pctColor(r.pct);
            return (
              <div key={r.id} className="card animate-fade-up" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 18, animationDelay: `${i * 0.04}s` }}>
                {/* Score circle */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  border: `3px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: r.pct === 100 ? 14 : 16, color,
                }}>
                  {r.pct === 100 ? '🏆' : `${r.pct}%`}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>
                      {r.quizTitle}
                    </h3>
                    {r.subject && (
                      <span className="badge badge-navy" style={{ fontSize: 10 }}>{r.subject}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>{r.score}/{r.total} acertos</span>
                    <span>·</span>
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                </div>

                {/* Progress bar mini */}
                <div style={{ width: 80, flexShrink: 0 }}>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: color, borderRadius: 999, width: `${r.pct}%` }} />
                  </div>
                </div>

                <Button size="sm" variant="secondary" onClick={() => navigate(`/student/quiz/${r.quizId}`)}>
                  <RotateCcw size={13} /> Refazer
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
