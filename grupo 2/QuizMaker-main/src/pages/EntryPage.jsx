// src/pages/EntryPage.jsx
// Tela de entrada: Professor / Aluno / Admin

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, ArrowRight, FileQuestion, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Field } from '../components/ui';

const ROLES = [
  {
    key:      'teacher',
    label:    'Professor',
    emoji:    '👨‍🏫',
    desc:     'Crie e gerencie seus quizzes',
    icon:     BookOpen,
    bg:       'var(--navy)',
    textColor:'#fff',
    dest:     '/teacher',
  },
  {
    key:      'student',
    label:    'Aluno',
    emoji:    '🎓',
    desc:     'Responda quizzes publicados',
    icon:     GraduationCap,
    bg:       'var(--amber)',
    textColor:'var(--navy)',
    dest:     '/student',
  },
];

export default function EntryPage() {
  const { enter, adminLogin } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setName]                 = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  // Admin login state
  const [showAdmin, setShowAdmin]       = useState(false);
  const [adminEmail, setAdminEmail]     = useState('');
  const [adminPass, setAdminPass]       = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [adminError, setAdminError]     = useState('');

  const roleObj = ROLES.find(r => r.key === selectedRole);

  const handleEnter = () => {
    if (!name.trim()) { setError('Digite seu nome para continuar'); return; }
    setLoading(true);
    enter(name.trim(), selectedRole);
    navigate(roleObj.dest, { replace: true });
  };

  const handleAdminLogin = () => {
    const ok = adminLogin(adminEmail, adminPass);
    if (ok) {
      navigate('/admin', { replace: true });
    } else {
      setAdminError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-500) 100%)',
      padding: 24,
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.05,
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(245,166,35,0.35)',
          }}>
            <FileQuestion size={32} color="var(--navy)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            QuizMaker
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
            Plataforma de quizzes educacionais
          </p>
        </div>

        {/* Admin login panel */}
        {showAdmin && (
          <div className="card animate-fade-up" style={{ padding: 32, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <ShieldCheck size={22} color="var(--navy)" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>
                Acesso de Administrador
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="E-mail" error={adminError}>
                <Input
                  type="email"
                  placeholder="admin@quizmaker.app"
                  value={adminEmail}
                  onChange={e => { setAdminEmail(e.target.value); setAdminError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                />
              </Field>
              <Field label="Senha">
                <div style={{ position: 'relative' }}>
                  <Input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>
              {adminError && (
                <p style={{ fontSize: 13, color: 'var(--red)', margin: 0 }}>{adminError}</p>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={() => setShowAdmin(false)}>← Voltar</Button>
                <Button fullWidth onClick={handleAdminLogin}>
                  <ShieldCheck size={15} /> Entrar como Admin
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — choose role */}
        {!selectedRole && !showAdmin && (
          <div className="animate-fade-up animate-delay-1">
            <p style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 20 }}>
              Quem é você?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {ROLES.map(role => (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 16, padding: '28px 20px',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    textAlign: 'center', color: '#fff',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.borderColor = role.key === 'teacher' ? 'rgba(255,255,255,0.4)' : 'var(--amber)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 12 }}>{role.emoji}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{role.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{role.desc}</div>
                </button>
              ))}
            </div>
            {/* Admin link */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={() => setShowAdmin(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                <ShieldCheck size={13} /> Acesso de administrador
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — enter name */}
        {selectedRole && (
          <div className="card animate-fade-up" style={{ padding: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: roleObj.bg, color: roleObj.textColor,
              fontSize: 13, fontWeight: 700, marginBottom: 24,
            }}>
              <span>{roleObj.emoji}</span> {roleObj.label}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
              Qual é o seu nome?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Será exibido na plataforma.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field label="Seu nome" error={error}>
                <Input
                  placeholder={roleObj.key === 'teacher' ? 'Ex: Prof. Ana Oliveira' : 'Ex: João Silva'}
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  error={error}
                  onKeyDown={e => e.key === 'Enter' && handleEnter()}
                  autoFocus
                />
              </Field>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={() => { setSelectedRole(null); setName(''); setError(''); }}>← Voltar</Button>
                <Button fullWidth onClick={handleEnter} loading={loading}
                  style={{ background: roleObj.bg, borderColor: roleObj.bg, color: roleObj.textColor }}>
                  Entrar <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
