// src/pages/student/QuizPlay.jsx
// Tela de jogo do aluno. Salva o resultado no Firestore ao terminar.

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw, Home, History } from 'lucide-react';
import { getQuiz, getQuestions } from '../../services/quizzes.service';
import { saveResult } from '../../services/results.service';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Spinner } from '../../components/ui';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function ScoreScreen({ score, total, quizTitle, onRestart, onHome, onHistory, saved }) {
  const pct     = Math.round((score / total) * 100);
  const perfect = score === total;
  const passing = pct >= 60;

  const emoji   = perfect ? '🏆' : pct >= 80 ? '🎉' : passing ? '👍' : '😅';
  const message = perfect
    ? 'Perfeito! Você acertou tudo!'
    : pct >= 80 ? 'Excelente! Quase perfeito!'
    : passing   ? 'Bom trabalho! Continue assim!'
    :             'Continue praticando, você vai melhorar!';

  const barColor = perfect ? 'var(--green)' : pct >= 60 ? 'var(--amber)' : 'var(--red)';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-500) 100%)', padding: 24,
    }}>
      <div className="card animate-fade-up" style={{ maxWidth: 460, width: '100%', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 8 }}>{emoji}</div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{quizTitle}</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--navy)', marginBottom: 24 }}>
          Resultado Final
        </h2>
        <div style={{ fontSize: 64, fontFamily: 'var(--font-display)', fontWeight: 800, color: barColor, lineHeight: 1, marginBottom: 4 }}>
          {score}<span style={{ fontSize: 28, color: 'var(--text-muted)', fontWeight: 400 }}>/{total}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{pct}% de acerto</p>
        <div style={{ height: 10, background: 'var(--surface-2)', borderRadius: 999, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999, background: barColor, width: `${pct}%`, transition: 'width 1s ease' }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', marginBottom: 8 }}>{message}</p>
        {saved && (
          <p style={{ fontSize: 12, color: 'var(--green)', marginBottom: 24 }}>✓ Resultado salvo no seu histórico</p>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={onHome}><Home size={15} /> Início</Button>
          <Button variant="secondary" onClick={onHistory}><History size={15} /> Histórico</Button>
          <Button onClick={onRestart}><RotateCcw size={15} /> Tentar novamente</Button>
        </div>
      </div>
    </div>
  );
}

export default function QuizPlay() {
  const { quizId }   = useParams();
  const navigate     = useNavigate();
  const { user, profile } = useAuth();

  const [quiz, setQuiz]         = useState(null);
  const [questions, setQs]      = useState([]);
  const [loading, setLoading]   = useState(true);
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore]       = useState(0);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved]       = useState(false);

  const load = async () => {
    setLoading(true);
    const [q, qs] = await Promise.all([getQuiz(quizId), getQuestions(quizId)]);
    setQuiz(q);
    setQs(qs);
    setLoading(false);
  };

  useEffect(() => { load(); }, [quizId]);

  // Save result when quiz finishes
  useEffect(() => {
    if (!finished || !quiz || !user) return;
    saveResult({
      quizId,
      quizTitle: quiz.title,
      subject:   quiz.subject,
      authorId:  quiz.authorId,
      studentId: user.uid,
      studentName: profile?.name || 'Aluno',
      score,
      total: questions.length,
    }).then(() => setSaved(true)).catch(console.error);
  }, [finished]);

  const handleRestart = () => {
    setCurrent(0); setSelected(null); setAnswered(false);
    setScore(0); setFinished(false); setSaved(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Quiz não encontrado</h2>
          <Button onClick={() => navigate('/student')}>Voltar</Button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <ScoreScreen
        score={score}
        total={questions.length}
        quizTitle={quiz.title}
        saved={saved}
        onRestart={handleRestart}
        onHome={() => navigate('/student')}
        onHistory={() => navigate('/student/history')}
      />
    );
  }

  const q         = questions[current];
  const isCorrect = selected === q.correctOptionId;
  const progress  = (current / questions.length) * 100;
  const isLastQ   = current === questions.length - 1;

  const handleSelect = (optId) => {
    if (answered) return;
    setSelected(optId);
    setAnswered(true);
    if (optId === q.correctOptionId) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (isLastQ) { setFinished(true); }
    else { setCurrent(c => c + 1); setSelected(null); setAnswered(false); }
  };

  const optionStyle = (opt) => {
    const isThis       = selected === opt.id;
    const isCorrectOpt = opt.id === q.correctOptionId;
    let bg = 'var(--white)', border = 'var(--border)', color = 'var(--text-primary)';
    if (answered) {
      if (isCorrectOpt)          { bg = 'var(--green-light)'; border = 'var(--green)'; color = 'var(--green)'; }
      else if (isThis)           { bg = 'var(--red-light)';   border = 'var(--red)';   color = 'var(--red)'; }
    } else if (isThis)           { bg = '#EEF2FF'; border = 'var(--navy)'; }
    return {
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 18px', borderRadius: 10,
      border: `1.5px solid ${border}`,
      background: bg, color,
      cursor: answered ? 'default' : 'pointer',
      transition: 'all 0.15s',
      fontFamily: 'var(--font-body)', fontSize: 15,
      fontWeight: answered && isCorrectOpt ? 600 : 400,
      textAlign: 'left', width: '100%',
    };
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, var(--navy) 0%, var(--navy-500) 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px',
    }}>
      {/* Top bar */}
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/student')}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#fff', display: 'flex' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 2 }}>{quiz.title}</p>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--amber)', borderRadius: 999, width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {current + 1} / {questions.length}
        </div>
      </div>

      {/* Question card */}
      <div className="card animate-fade-up" style={{ width: '100%', maxWidth: 640, padding: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <span style={{ padding: '3px 12px', borderRadius: 999, background: 'var(--navy)', color: '#fff', fontSize: 12, fontWeight: 700 }}>
            Pergunta {current + 1}
          </span>
          {answered && (
            <span style={{
              padding: '3px 12px', borderRadius: 999,
              background: isCorrect ? 'var(--green-light)' : 'var(--red-light)',
              color: isCorrect ? 'var(--green)' : 'var(--red)',
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {isCorrect ? <><CheckCircle size={13} /> Correto!</> : <><XCircle size={13} /> Incorreto</>}
            </span>
          )}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 24, lineHeight: 1.4 }}>
          {q.text}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {q.options.map((opt, oi) => {
            const isCorrectOpt = opt.id === q.correctOptionId;
            const isThis = selected === opt.id;
            return (
              <button key={opt.id} style={optionStyle(opt)} onClick={() => handleSelect(opt.id)}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                  background: answered && isCorrectOpt ? 'var(--green)' : answered && isThis && !isCorrectOpt ? 'var(--red)' : 'var(--surface-2)',
                  color: answered && (isCorrectOpt || (isThis && !isCorrectOpt)) ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}>
                  {answered && isCorrectOpt ? <CheckCircle size={16} /> : answered && isThis && !isCorrectOpt ? <XCircle size={16} /> : OPTION_LABELS[oi]}
                </div>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {answered && q.explanation && (
          <div className="animate-fade-in" style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--amber-light)', border: '1px solid var(--amber)', fontSize: 13, color: 'var(--amber-dark)', lineHeight: 1.6, marginBottom: 20 }}>
            💡 <strong>Explicação:</strong> {q.explanation}
          </div>
        )}

        {answered && (
          <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleNext} size="lg">
              {isLastQ ? '🏆 Ver resultado' : 'Próxima pergunta'} <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {questions.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < current ? 'rgba(255,255,255,0.6)' : i === current ? 'var(--amber)' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  );
}
