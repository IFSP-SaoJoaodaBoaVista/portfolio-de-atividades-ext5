// src/pages/admin/AdminQuizzes.jsx
import { useEffect, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout, { PageHeader } from '../../components/layout/AppLayout';
import { listAllQuizzes } from '../../services/users.service';
import { Button, Input, Spinner, EmptyState } from '../../components/ui';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listAllQuizzes().then(data => { setQuizzes(data); setLoading(false); });
  }, []);

  const filtered = quizzes.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.subject?.toLowerCase().includes(search.toLowerCase()) ||
    q.authorName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader
        title="Todos os Quizzes"
        subtitle={`${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} na plataforma`}
      />

      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <Input placeholder="Buscar quiz, matéria ou professor..." style={{ paddingLeft: 38 }}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon="📝" title="Nenhum quiz encontrado"
            description="Os professores ainda não criaram nenhum quiz." />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Título', 'Matéria', 'Professor', 'Perguntas', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, i) => (
                <tr key={q.id} className="animate-fade-up"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', animationDelay: `${i * 0.04}s` }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>{q.title}</div>
                    {q.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{q.description}</div>}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge badge-navy">{q.subject}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{q.authorName}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{q.questionCount || 0}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`badge ${q.isPublished ? 'badge-green' : 'badge-muted'}`}>
                      {q.isPublished ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
